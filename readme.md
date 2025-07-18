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
    before_pdf_render: async () => {
      transform.reset_transform();
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
  hook_actions?: {
    before_pdf_render?: () => Promise<void>
  }
})
```

- `wrapper_dom`：外层容器 DOM | Outer wrapper DOM
- `inner_dom`：内容容器 DOM | Content container DOM
- `config`：配置对象 | Config object
  - `resolution_multiplier`：渲染分辨率倍数，影响清晰度与性能 | Render resolution multiplier, affects clarity and performance
  - `hook_actions.before_pdf_render`：PDF 渲染前钩子 | Hook before PDF render

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
