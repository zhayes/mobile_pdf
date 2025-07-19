import { isPCByTouch } from "./utils";

class PDFViewer {

  public wrap_div: HTMLDivElement|null = null;
  public inner_div: HTMLDivElement|null = null;

  constructor(rootEl: HTMLElement) {
    this.create_viewer(rootEl);
  }

  private create_viewer = (rootEl:HTMLElement) => {
    this.wrap_div = document.createElement('div');

    this.wrap_div.style.width = '100%';
    this.wrap_div.style.height = '100%';
    this.wrap_div.style.overflow = isPCByTouch() ? 'auto' : 'hidden';

    this.inner_div = document.createElement('div');
    this.inner_div.style.margin = '0 4px';

    rootEl.appendChild(this.wrap_div);
    this.wrap_div.appendChild(this.inner_div);

  }


}


export default PDFViewer;
