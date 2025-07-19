import { getDocument, type PDFDocumentProxy, type RenderTask } from 'pdfjs-dist';

export type PDFSourceDataOption = Parameters<typeof getDocument>[0];


export interface PDFPage {
  canvas: HTMLCanvasElement|null;
  canvas_wrapper: HTMLDivElement;
  render_status: 'pending' | 'loading' | 'complete';
  page: number;
  key: string;
  rendering_task?: RenderTask|null;
}

export interface Boundary {
  left: number;
  right: number;
  top: number;
  bottom: number;
  min_scale: number;
  max_scale: number
}

export interface TouchCenter {
  x: number;
  y: number;
}


export interface HookActions {
  start_loading?: () => Promise<void>;
  begin_insert_pages?: (total_num:number)=>void;
  complete_loading?: (pages: PDFPage[], pdf_doc:PDFDocumentProxy, total_num:number) => Promise<void>;
  start_rendering?: (page:PDFPage) => void;
  end_rendering?: (page:PDFPage) => void;
}

export interface MobilePDFViewerConfig {
  pdf_container_class?: string[];
  transform_container_class?:string[];
  page_container_class?: string[];
  canvas_class?: string[];
  resolution_multiplier?: number;
  hook_actions?: HookActions;
}
