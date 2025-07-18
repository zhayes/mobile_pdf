# mobile-pdf

一个专为移动端设计的 PDF 预览与手势操作库，基于 pdfjs 实现，支持高性能分页渲染、手势缩放、拖拽、双击缩放等功能，适合在 H5、Hybrid、WebView 等场景下集成。

A PDF viewer and gesture operation library designed for mobile, based on pdfjs. It supports high-performance paginated rendering, pinch-to-zoom, drag, double-tap zoom, and is suitable for H5, Hybrid, and WebView scenarios.

---

## 特性 | Features

- 📄 高效渲染 PDF，支持分页懒加载  
  Efficient PDF rendering with paginated lazy loading
- 🤏 支持双指缩放、拖拽、双击缩放等手势  
  Supports pinch-to-zoom, drag, double-tap zoom and more gestures
- 🚀 性能优化，按需渲染，节省内存  
  Performance optimized, renders on demand, saves memory
- 🛠️ 灵活 API，易于集成和扩展  
  Flexible API, easy to integrate and extend

---

## 安装 | Installation

```bash
npm install mobile-pdf
# or
pnpm add mobile-pdf
```

---

## 快速上手 | Quick Start

### 1. 引入样式 | Import Styles

```js
import 'mobile-pdf/dist/style.css';
```

### 2. HTML 结构 | HTML Structure

```html
<div id="app" style="height: 100vh;"></div>
<input type="file" id="file_input" />
```

### 3. JS/TS 使用示例 | Usage Example

```js
import { PDFViewer, TouchManager, MobilePDF, Transform } from 'mobile-pdf';

// 1. 创建 PDF 容器 | Create PDF container
const app = document.getElementById('app');
const viewer = new PDFViewer(app);

// 2. 创建手势变换实例 | Create gesture transform instance
const transform = new Transform(viewer.inner_div, viewer.wrap_div);

// 3. 绑定手势管理 | Bind gesture manager
new TouchManager(transform);

// 4. 创建 PDF 渲染实例 | Create PDF render instance
const mobile_pdf = new MobilePDF(viewer.wrap_div, viewer.inner_div, {
  resolution_multiplier: 3,
  hook_actions: {
    start_loading: async () => {
      // PDF 开始加载时触发，可用于显示加载动画
      // Triggered when PDF loading starts, e.g. show loading spinner
    },
    begin_insert_pages: (total) => {
      // PDF 解析完成，准备插入页面时触发，可用于初始化页面容器
      // 此处建议重置 PDF 容器的位置和缩放比例，避免上次浏览状态影响新文档
      // Triggered before inserting pages, e.g. initialize page containers
      // It is recommended to reset the PDF container position and zoom here to avoid previous state affecting the new document
      transform.reset_transform();
    },
    complete_loading: async (pages, pdf_doc, total) => {
      // 所有页面插入并加载完成后触发，可用于隐藏加载动画
      // Triggered after all pages are loaded, e.g. hide loading spinner
    },
    start_rendering: (page) => {
      // 单页开始渲染时触发
      // Triggered when a page starts rendering
    },
    end_rendering: (page) => {
      // 单页渲染完成时触发，可用于隐藏单页占位符
      // Triggered when a page finishes rendering
    }
  }
});

// 5. 加载 PDF 文件 | Load PDF file
const fileInput = document.getElementById('file_input');
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  const buffer = await file.arrayBuffer();
  mobile_pdf.load_pdf(buffer);
});
```

---

## API 说明 | API Reference

### MobilePDF

```ts
new MobilePDF(wrapper_dom: HTMLElement, inner_dom: HTMLElement, config?: {
  resolution_multiplier?: number, // 渲染分辨率倍数，默认3 | Render resolution multiplier, default 3
  hook_actions?: HookActions
})
```

- `wrapper_dom`：外层容器 DOM | Outer wrapper DOM
- `inner_dom`：内容容器 DOM | Content container DOM
- `config`：配置对象 | Config object
  - `resolution_multiplier`：渲染分辨率倍数，影响清晰度与性能，默认为3 | Render resolution multiplier, affects clarity and performance
  - `hook_actions`：PDF 加载与渲染生命周期钩子 | PDF loading and rendering lifecycle hooks

#### HookActions 生命周期钩子详细说明

| 钩子名 | 触发时机 | 参数 | 说明 |
| ------ | -------- | ---- | ---- |
| `start_loading` | PDF 开始加载时 | 无 | **异步钩子**。可用于显示加载动画、禁用操作等。Promise resolve 后进入下一步。<br>_Triggered when PDF loading starts. Useful for showing loading indicators, disabling UI, etc. Returns a Promise; next step waits for its resolution._ |
| `begin_insert_pages` | PDF 解析完成，准备插入页面时 | `total_num: number` | 可用于初始化页面容器、预分配资源等。**建议此时重置 PDF 容器位置和缩放比例，避免上次浏览状态影响新文档。**<br>_Triggered after PDF is parsed and before pages are inserted. Receives total page count. Useful for initializing page containers, pre-allocating resources, etc. **It is recommended to reset the PDF container position and zoom here to avoid previous state affecting the new document.**_ |
| `complete_loading` | 所有页面插入并加载完成后 | `pages: PDFPage[]`, `pdf_doc: PDFDocumentProxy`, `total_num: number` | **异步钩子**。可用于隐藏加载动画、获取文档信息、统计分析等。Promise resolve 后进入下一步。<br>_Triggered after all pages are inserted and loaded. Receives array of page objects, PDF document proxy, and total page count. Useful for hiding loading indicators, accessing document info, analytics, etc. Returns a Promise._ |
| `start_rendering` | 单页开始渲染时 | `page: PDFPage` | 可用于单页渲染前的处理，如显示占位符等。<br>_Triggered when a single page starts rendering. Receives the page object. Useful for per-page pre-render logic, such as showing placeholders._ |
| `end_rendering` | 单页渲染完成时 | `page: PDFPage` | 可用于单页渲染后的处理，如隐藏占位符、上报渲染完成等。<br>_Triggered when a single page finishes rendering. Receives the page object. Useful for per-page post-render logic, such as hiding placeholders, reporting render completion, etc._ |

- 其他配置项 | Other config options
  - `pdf_container_class`：外层 PDF 容器的类名数组 | Class names for the outer PDF container (Array)
  - `transform_container_class`：内容变换容器的类名数组 | Class names for the transform/content container (Array)
    - ⚠️ 为了完整显示阴影效果，PDF 的内容器默认添加了 4px 的左右边距。如果需要修改该边距，可通过自定义 `transform_container_class` 类名覆盖相关样式。
    - To fully display shadow effects, the PDF content container has a default 4px left and right margin. You can override this margin by customizing the style with your own `transform_container_class`.
  - `page_container_class`：每一页外层容器的类名数组 | Class names for each page's wrapper (Array)
  - `canvas_class`：每一页 canvas 的类名数组 | Class names for each page's canvas (Array)

---

### PDFViewer

```ts
new PDFViewer(rootEl: HTMLElement)
```
- `rootEl`：挂载的根 DOM 元素 | Root DOM element to mount
- 实例属性 | Instance properties：`wrap_div`, `inner_div`

### Transform

```ts
new Transform(transform_el: HTMLElement, wrapper_el: HTMLElement, boundary?: Boundary)
```
- `transform_el`：变换目标元素 | Element to transform
- `wrapper_el`：外层包裹元素 | Outer wrapper element
- `boundary`：边界限制参数（可选）| Boundary limit (optional)

### TouchManager

```ts
new TouchManager(transform_instance: Transform)
```
- `transform_instance`：Transform 实例 | Transform instance

---

## 依赖 | Dependencies

- [pdfjs-dist](https://github.com/mozilla/pdfjs-dist)
- [uid](https://github.com/lukeed/uid)

---

## 适用场景 | Scenarios

- 移动端 H5 页面 | Mobile H5 pages
- Hybrid App 内嵌 WebView | Hybrid App embedded WebView
- 需要自定义手势交互的 PDF 预览场景 | PDF preview scenarios requiring custom gesture interaction

---

## License

MIT
