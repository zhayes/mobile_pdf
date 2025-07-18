import { getDocument } from 'pdfjs-dist';

export type PDFSourceDataOption = Parameters<typeof getDocument>[0];


export interface PDFPage {
  canvas: HTMLCanvasElement|null;
  canvas_wrapper: HTMLDivElement;
  render_status: 'pending' | 'loading' | 'complete';
  page: number;
  key: string;
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
  before_pdf_render?: () => Promise<void>
}

export interface MobilePDFViewerConfig {
  resolution_multiplier?: number;
  hook_actions: HookActions
}
