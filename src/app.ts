import './style.css'
import { PDFViewer, TouchManager, MobilePDF, Transform } from './index';


const get_mobile_pdf = () => {

  const app = document.querySelector("#app") as HTMLDivElement;
  app.style.height = "calc(100vh - 100px)";

  const viewer = new PDFViewer(app);

  const transform_instance = new Transform(viewer.inner_div!, viewer.wrap_div!);

  new TouchManager(transform_instance);

  const mobile_pdf = new MobilePDF(viewer.wrap_div!, viewer.inner_div!, {
    hook_actions: {
      before_pdf_render: async () => {
        transform_instance.reset_transform();
      }
    }
  });

  return mobile_pdf;
}



window.onload = () => {
  const pdf = get_mobile_pdf();

  const fileInput = document.getElementById('file_input') as HTMLInputElement;

  fileInput.addEventListener('change', async(e:any) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0] as File;

    const buffer = await file.arrayBuffer();

    pdf.load_pdf(buffer);

  });


}
