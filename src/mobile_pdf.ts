import { getDocument, type PDFDocumentProxy, GlobalWorkerOptions, type PDFPageProxy } from 'pdfjs-dist';
import { uid } from 'uid';

import type { PDFSourceDataOption, PDFPage, MobilePDFViewerConfig } from "./types";

import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

GlobalWorkerOptions.workerSrc = workerUrl;


class MobilePDF {
  private pages: PDFPage[] = [];
  private intersection_observer: IntersectionObserver|null = null;
  private wrapper_dom: HTMLElement;
  private inner_dom: HTMLElement;
  private pdf_doc: PDFDocumentProxy|null = null;
  private config: MobilePDFViewerConfig;
  private base_scale: number = 1;
  private total_pages:number = 0;

  constructor(wrapper_dom: HTMLElement, inner_dom: HTMLElement, config?: MobilePDFViewerConfig){
    this.wrapper_dom = wrapper_dom;
    this.inner_dom = inner_dom;
    this.config = Object.assign({resolution_multiplier: 3}, config);

    this.add_class();
  }

  private add_class = ()=>{
    if(this.config.pdf_container_class){
      this.wrapper_dom.classList.add(...this.config.pdf_container_class);
    }

    if(this.config.transform_container_class){
      this.inner_dom.classList.add(...this.config.transform_container_class);
    }
  }

  public load_pdf = async(source: PDFSourceDataOption): Promise<void> => {

    await this.config.hook_actions?.start_loading?.();

    this.cleanup_pdf();

    const loading_task = getDocument(source);
    this.pdf_doc = await loading_task.promise;

    this.total_pages = this.pdf_doc.numPages;

    const wrapperWidth = this.inner_dom!.offsetWidth;
    const first_page = await this.pdf_doc.getPage(1);
    const viewport = first_page.getViewport({ scale: 1 });

    first_page.cleanup(); // 清理获取尺寸的页面

    this.base_scale = (wrapperWidth / viewport.width) * this.config.resolution_multiplier!;

    this.intersection_observer = this.create_observer();

    this.config.hook_actions?.begin_insert_pages?.(this.total_pages);

    this.insert_page_doms(this.total_pages);

    await this.config.hook_actions?.complete_loading?.(this.pages, this.pdf_doc, this.total_pages);
  }

  private create_null_page = (page_num:number):PDFPage => {
    const canvas_wrapper = window.document.createElement('div');
    canvas_wrapper.classList.add('zha_mobile_pdf_canvas_wrapper', ...(this.config.page_container_class || []));
    canvas_wrapper.style.height = '100vh';
    canvas_wrapper.dataset.page = page_num.toString();

    return {
      canvas: null,
      canvas_wrapper: canvas_wrapper,
      render_status: 'pending',
      page: page_num,
      key: uid()
    }
  }

  private insert_page_doms = async(total_num: number) => {
    this.pages = Array.from({ length: total_num }, (_, index) => {
      return this.create_null_page(index + 1);
    });

    for(const page of this.pages) {
      this.inner_dom.appendChild(page.canvas_wrapper);
      if (this.intersection_observer) {
        this.intersection_observer.observe(page.canvas_wrapper);
      }
    }

  }

  private render_page = async(pdf_page: PDFPage) => {
    let page: PDFPageProxy | null = null;
    try {
      if (!this.pdf_doc) return;
      pdf_page.render_status = 'loading';

      this.config.hook_actions?.start_rendering?.(pdf_page);

      if (!pdf_page.canvas) {
        pdf_page.canvas = document.createElement('canvas');
        if (this.config.canvas_class) {
          pdf_page.canvas.classList.add(...this.config.canvas_class);
        }
        pdf_page.canvas_wrapper.appendChild(pdf_page.canvas);
      }

      page = await this.pdf_doc.getPage(pdf_page.page);
      const viewport = page.getViewport({ scale: this.base_scale });

      if (!pdf_page.canvas) {
        pdf_page.render_status = 'pending';
        return;
      }

      const can_context = pdf_page.canvas.getContext('2d')!;

      pdf_page.canvas.width = viewport.width;
      pdf_page.canvas.height = viewport.height;

      pdf_page.rendering_task = page.render({
        canvasContext: can_context,
        viewport
      });

      await pdf_page.rendering_task.promise;
      pdf_page.rendering_task = null;

      if (pdf_page.canvas) {
        pdf_page.render_status = 'complete';
        this.config.hook_actions?.end_rendering?.(pdf_page);
      }

      if (pdf_page.canvas_wrapper) {
        pdf_page.canvas_wrapper.style.height = (viewport.height / this.config.resolution_multiplier!) + 'px';
      }
    } catch (err) {
      //渲染任务取消
      //console.info(err);
    } finally {
      page?.cleanup();
      if (pdf_page.rendering_task) {
        pdf_page.rendering_task = null;
      }
    }
  }


  private create_observer = () => {
    return new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const page_num = (entry.target as HTMLDivElement).dataset.page;
        if (isNaN(Number(page_num))) return;

        const current_page = this.pages[Number(page_num)-1];

        if (!current_page) return;

        if (entry.isIntersecting) {
          if (current_page.render_status === 'pending') {
            this.render_page(current_page);
          }
        } else {
          if (current_page.canvas && this.pages.length>1) {

            if (current_page.rendering_task && current_page.render_status === 'loading') {
              current_page.rendering_task.cancel();
              current_page.rendering_task = null;
            }

            current_page.canvas.remove();
            current_page.canvas = null;
          }

          current_page.render_status = 'pending';
        }
      });
    }, {
      root: this.wrapper_dom,
      rootMargin: '100% 0px',
      threshold: 0.1
    });
  }


  private cleanup_observer = () => {
    if (this.intersection_observer) {
      this.pages.forEach(item => {
        if (item.canvas_wrapper) {
          this.intersection_observer!.unobserve(item.canvas_wrapper);
        }
      });
      this.intersection_observer!.disconnect();
      this.intersection_observer = null;
    }
  };


  cleanup_pdf = () => {
    this.cleanup_observer();
    if (this.pdf_doc) {
      this.pdf_doc.destroy();
      this.pdf_doc = null;
    }
    this.pages = [];

    try {
      this.inner_dom.replaceChildren();
    } catch (err) {
      this.inner_dom.innerHTML = '';
    }
  };
}


export default MobilePDF;
