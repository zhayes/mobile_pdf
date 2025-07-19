# mobile-pdf

<div align="center">

[![License](https://img.shields.io/npm/l/mobile-pdf.svg)](https://github.com/zhayes/mobile_pdf/blob/main/LICENSE)
[![NPM Downloads](https://img.shields.io/npm/dm/mobile-pdf.svg)](https://www.npmjs.com/package/mobile-pdf)

A high-performance, mobile-first PDF viewer with rich gesture support that works seamlessly on desktop too.

**Language:** [English](#english) | [中文](#中文)

</div>

---

## <a name="english"></a>English

### 📖 About The Project

`mobile-pdf` is a JavaScript library engineered for an optimal PDF viewing experience across all devices. It leverages the power of `pdfjs-dist` for robust PDF rendering and implements a highly efficient lazy-loading mechanism using `IntersectionObserver` to ensure that even large documents load quickly and consume minimal memory.

The library intelligently detects device capabilities. On touch-enabled devices, it provides a rich gesture-driven interface (pinch-to-zoom, drag-to-pan). On non-touch devices, it automatically enables native scrollbar-based navigation, providing a seamless experience out of the box.

### ✨ Features

-   **📄 High-Performance Rendering**: Efficiently renders pages on demand, keeping the UI responsive and memory usage low.
-   **👆 Smart Interaction Mode**: Automatically enables touch gestures on mobile and standard scrollbar navigation on desktops.
-   **🤏 Rich Gesture Support**: Provides smooth, intuitive touch gestures including pinch-to-zoom, drag-to-pan, and double-tap zoom.
-   **🛠️ Modular & Extensible API**: A clean, decoupled architecture allows for easy customization and integration.
-   **🎨 Customizable UI**: Easily style the viewer components by providing your own CSS classes.
-   **⚙️ Lifecycle Hooks**: Execute custom logic at key stages of the PDF loading and rendering process.
-   **✅ Zero-Config Styling**: CSS styles are bundled directly into the JavaScript, so no separate style import is needed.

### 📦 Installation

```bash
# Using pnpm (recommended)
pnpm add mobile-pdf

# Using npm
npm install mobile-pdf

# Using yarn
yarn add mobile-pdf
```

### 🚀 Quick Start

#### 1. Prepare the HTML

First, you need a container element in your HTML to host the PDF viewer. This element should have a defined size.

```html
<!-- The viewer will be mounted here. Ensure it has a height. -->
<div id="pdf-viewer" style="width: 100vw; height: 100vh;"></div>

<!-- Example: An input for users to select a local PDF file -->
<input type="file" id="file-input" accept=".pdf" />
```

#### 2. Initialize the Viewer

The library's functionality is split across four core classes. Here’s how you initialize and connect them:

```javascript
import { PDFViewer, MobilePDF, Transform, TouchManager } from 'mobile-pdf';

// Step 1: Create the viewer's DOM structure
const root_element = document.getElementById('pdf-viewer');
const pdf_viewer = new PDFViewer(root_element);

// Step 2: Set up gesture handling
const transform = new Transform(pdf_viewer.inner_div, pdf_viewer.wrap_div);
const touch_manager = new TouchManager(transform);

// Step 3: Create the PDF rendering engine
const mobile_pdf = new MobilePDF(pdf_viewer.wrap_div, pdf_viewer.inner_div, {
  resolution_multiplier: 3, // Higher value for sharper rendering
  hook_actions: {
    start_loading: async () => console.log('Loading started...'),
    begin_insert_pages: (total_pages) => {
      transform.reset_transform(); // Reset zoom/pan for new document
      console.log(`PDF parsed, ${total_pages} pages to be inserted.`);
    },
    complete_loading: async () => console.log('PDF document is fully loaded.'),
    end_rendering: (page) => console.log(`Page ${page.page} has rendered.`),
  },
});

// Step 4: Load a PDF
const file_input = document.getElementById('file-input');
file_input.addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (file) {
    const file_buffer = await file.arrayBuffer();
    await mobile_pdf.load_pdf(file_buffer);
  }
});

// For Single Page Applications (SPAs) like React, Vue, etc.
// It is crucial to clean up event listeners when the component unmounts.
//
// Example for a React component:
// useEffect(() => {
//   // ... initialization code from above ...
//   return () => {
//     touch_manager.removeEventListener(); // Cleanup on unmount
//   };
// }, []);
```

### 📚 API Reference

#### Architecture

1.  **`PDFViewer`**: Builds the necessary DOM elements and automatically configures the container for touch or scroll interaction.
2.  **`MobilePDF`**: Manages PDF loading and page rendering.
3.  **`Transform`**: Controls CSS `transform` properties (scale and translate).
4.  **`TouchManager`**: Captures user touch gestures and executes them via a `Transform` instance.

---

#### `new PDFViewer(rootEl: HTMLElement)`

Initializes the viewer's DOM structure. It intelligently detects if the device supports touch events.
-   On **touch devices**, the main container (`wrap_div`) will have `overflow: hidden` to allow for gesture-based panning.
-   On **non-touch devices** (like desktops), it will have `overflow: auto` to enable native scrollbars.

-   **`rootEl`**: The HTML element where the viewer will be mounted.
-   **Instance Properties**:
    -   `wrap_div: HTMLDivElement`: The outer container element (viewport).
    -   `inner_div: HTMLDivElement`: The inner content container that holds PDF pages and is the target for transformations.

---

#### `new MobilePDF(wrapper_dom, inner_dom, config?)`

The core class that handles the PDF rendering lifecycle.

-   **`wrapper_dom`**: The outer container element (`PDFViewer.wrap_div`).
-   **`inner_dom`**: The content container element (`PDFViewer.inner_div`).
-   **`config`**: An optional configuration object (`MobilePDFViewerConfig`).

##### Methods
-   **`load_pdf(source: PDFSourceDataOption): Promise<void>`**: Asynchronously loads a PDF document.
    -   `source`: Can be a URL (`string`), `ArrayBuffer`, `Uint8Array`, or other formats supported by `pdfjs-dist`.

##### Configuration (`MobilePDFViewerConfig`)

| Key | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `resolution_multiplier`| `number` | `3` | The multiplier for canvas rendering resolution. Higher values produce sharper images but use more memory. |
| `pdf_container_class` | `string[]` | `[]` | Custom CSS classes for the main wrapper (`wrap_div`). |
| `transform_container_class`| `string[]` | `[]` | Custom CSS classes for the content container (`inner_div`). |
| `page_container_class` | `string[]` | `[]` | Custom CSS classes for the wrapper of each page. |
| `canvas_class` | `string[]` | `[]` | Custom CSS classes for each `<canvas>` element. |
| `hook_actions` | `HookActions`| `{}` | An object containing lifecycle callback functions. |

##### Lifecycle Hooks (`hook_actions`)

| Hook | Parameters | Description |
| :--- | :--- | :--- |
| `start_loading` | `() => Promise<void>` | **Async**. Fires when `load_pdf` is called. Ideal for showing a loading indicator. |
| `begin_insert_pages`| `(total_pages: number) => void`| Fires after the PDF is parsed. Recommended place to reset transforms. |
| `complete_loading`| `(pages, pdf_doc, total) => Promise<void>` | **Async**. Fires after all page placeholders are in the DOM. |
| `start_rendering` | `(page: PDFPage) => void` | Fires just before a specific page begins to render. |
| `end_rendering` | `(page: PDFPage) => void` | Fires after a specific page has finished rendering. |

---

#### `new Transform(transform_el, wrapper_el, boundary?)`

Manages the 2D transformations (zoom and pan) for the content element.

-   **`transform_el`**: The element to which CSS transforms will be applied (`PDFViewer.inner_div`).
-   **`wrapper_el`**: The outer boundary-defining element (`PDFViewer.wrap_div`).
-   **`boundary`**: Optional object to configure movement boundaries and scale limits.

##### Boundary Configuration
The `boundary` object sets limits for panning and zooming.

| Key | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `left` | `number` | `50` | Maximum allowable pan distance from the left edge (in pixels). |
| `right` | `number` | `50` | Maximum allowable pan distance from the right edge (in pixels). |
| `top` | `number` | `50` | Maximum allowable pan distance from the top edge (in pixels). |
| `bottom` | `number` | `50` | Maximum allowable pan distance from the bottom edge (in pixels). |
| `min_scale` | `number` | `0.5` | The minimum allowed zoom-out scale. |
| `max_scale` | `number` | `4` | The maximum allowed zoom-in scale. |
**Note:** The `left`, `right`, `top`, and `bottom` boundary constraints only take effect when the content is zoomed in (`scale > 1`).

##### Methods
-   **`set_dragging(value: boolean)`**: Sets the internal dragging state.
-   **`set_pinching(value: boolean)`**: Sets the internal pinching state.
-   **`get_dragging(): boolean`**: Returns `true` if a drag operation is active.
-   **`get_pinching(): boolean`**: Returns `true` if a pinch operation is active.
-   **`get_translate(): { translate_x: number, translate_y: number }`**: Returns the current translation values.
-   **`get_scale(): number`**: Returns the current scale value.
-   **`transform(position?)`**: Applies a transformation. `position` is an object with optional `translate_x`, `translate_y`, and `scale` properties.
-   **`reset_transform()`**: Resets scale to `1` and translation to `(0, 0)`.
-   **`constrain_boundary(x, y)`**: Calculates and returns new coordinates constrained within the defined boundaries.

---

#### `new TouchManager(transform_instance)`

Listens for user touch events and orchestrates gestures. The constructor automatically detects touch support. If touch is available, it calls `addEventListener()` to begin listening for events.

-   **`transform_instance`**: An instance of the `Transform` class that this manager will control.

##### Methods
-   **`addEventListener()`**: Attaches `touchstart`, `touchmove`, and `touchend` event listeners to the transform element. It is called by the constructor automatically on touch-enabled devices.
-   **`removeEventListener()`**: Removes all event listeners. **This is crucial for cleanup in Single Page Applications** to prevent memory leaks when a component unmounts.

### 🙏 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/zhayes/mobile_pdf/issues).

### 📄 License

This project is licensed under the MIT License.

---

## <a name="中文"></a>中文

### 📖 关于项目

`mobile-pdf` 是一个为在所有设备上提供卓越 PDF 阅读体验而设计的 JavaScript 库。它利用了 `pdfjs-dist` 强大的 PDF 渲染能力，并基于 `IntersectionObserver` 实现了一套高效的懒加载机制，确保了即便是大型文档也能快速加载并仅消耗最少的内存。

该库能智能检测设备能力。在支持触摸的设备上，它提供由丰富手势驱动的交互界面（双指缩放、拖拽平移）；在非触摸设备上，它会自动启用基于原生滚动条的导航，开箱即可提供无缝的体验。

### ✨ 功能特性

-   **📄 高性能渲染**: 按需高效渲染页面，保持 UI 的响应速度和较低的内存占用。
-   **👆 智能交互模式**: 在移动设备上自动启用触摸手势，在桌面上自动启用标准滚动条导航。
-   **🤏 丰富的手势支持**: 提供流畅、直观的触摸手势，包括双指缩放、拖拽平移和双击缩放。
-   **🛠️ 模块化与可扩展 API**: 简洁、解耦的架构使得自定义和集成变得轻而易举。
-   **🎨 可自定义 UI**: 通过提供自定义 CSS 类名，轻松为阅读器组件添加样式。
-   **⚙️ 生命周期钩子**: 在 PDF 加载和渲染过程的关键阶段执行自定义逻辑。
-   **✅ 零配置样式**: CSS 样式已直接打包到 JavaScript 中，无需单独引入样式文件。

### 📦 安装

```bash
# 使用 pnpm (推荐)
pnpm add mobile-pdf

# 使用 npm
npm install mobile-pdf

# 使用 yarn
yarn add mobile-pdf
```

### 🚀 快速上手

#### 1. 准备 HTML 结构

首先，您需要在 HTML 中准备一个容器元素来承载 PDF 阅读器。该元素应具有确定的尺寸。

```html
<!-- 阅读器将在此处挂载。请确保它具有高度。 -->
<div id="pdf-viewer" style="width: 100vw; height: 100vh;"></div>

<!-- 示例：一个供用户选择本地 PDF 文件的输入框 -->
<input type="file" id="file-input" accept=".pdf" />
```

#### 2. 初始化阅读器

该库的功能分散在四个核心类中。以下是如何初始化并连接它们：

```javascript
import { PDFViewer, MobilePDF, Transform, TouchManager } from 'mobile-pdf';

// 步骤 1: 创建阅读器的 DOM 结构
const root_element = document.getElementById('pdf-viewer');
const pdf_viewer = new PDFViewer(root_element);

// 步骤 2: 设置手势处理
const transform = new Transform(pdf_viewer.inner_div, pdf_viewer.wrap_div);
const touch_manager = new TouchManager(transform);

// 步骤 3: 创建 PDF 渲染引擎
const mobile_pdf = new MobilePDF(pdf_viewer.wrap_div, pdf_viewer.inner_div, {
  resolution_multiplier: 3, // 更高的值可以获得更清晰的渲染效果
  hook_actions: {
    start_loading: async () => console.log('加载开始...'),
    begin_insert_pages: (total_pages) => {
      transform.reset_transform(); // 为新文档重置缩放和平移
      console.log(`PDF 解析完成，总计 ${total_pages} 页待插入。`);
    },
    complete_loading: async () => console.log('PDF 文档已完全加载。'),
    end_rendering: (page) => console.log(`第 ${page.page} 页已渲染。`),
  },
});

// 步骤 4: 加载一个 PDF
const file_input = document.getElementById('file-input');
file_input.addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (file) {
    const file_buffer = await file.arrayBuffer();
    await mobile_pdf.load_pdf(file_buffer);
  }
});

// 对于单页应用 (SPA) 如 React, Vue 等
// 在组件卸载时清理事件监听器至关重要。
//
// React 组件示例:
// useEffect(() => {
//   // ... 以上初始化代码 ...
//   return () => {
//     touch_manager.removeEventListener(); // 在卸载时清理
//   };
// }, []);
```

### 📚 API 参考

#### 架构

1.  **`PDFViewer`**: 构建所需的 DOM 元素，并为触摸或滚动交互自动配置容器。
2.  **`MobilePDF`**: 管理 PDF 的加载和页面渲染。
3.  **`Transform`**: 控制 CSS `transform` 属性（缩放和平移）。
4.  **`TouchManager`**: 捕获用户触摸手势，并通过 `Transform` 实例来执行操作。

---

#### `new PDFViewer(rootEl: HTMLElement)`

初始化阅读器的 DOM 结构。它能智能检测设备是否支持触摸事件。
-   在**触摸设备**上，主容器 (`wrap_div`) 将设置 `overflow: hidden` 以便进行手势平移。
-   在**非触摸设备**（如桌面电脑）上，它将设置 `overflow: auto` 以启用原生滚动条。

-   **`rootEl`**: 用于挂载阅读器的 HTML 元素。
-   **实例属性**:
    -   `wrap_div: HTMLDivElement`: 外层容器元素（视口）。
    -   `inner_div: HTMLDivElement`: 内部内容容器，用于存放 PDF 页面，也是变换的目标。

---

#### `new MobilePDF(wrapper_dom, inner_dom, config?)`

处理 PDF 渲染生命周期的核心类。

-   **`wrapper_dom`**: 外层容器元素 (`PDFViewer.wrap_div`)。
-   **`inner_dom`**: 内容容器元素 (`PDFViewer.inner_div`)。
-   **`config`**: 可选的配置对象 (`MobilePDFViewerConfig`)。

##### 方法
-   **`load_pdf(source: PDFSourceDataOption): Promise<void>`**: 异步加载一个 PDF 文档。
    -   `source`: 可以是 URL (`string`)、`ArrayBuffer`、`Uint8Array` 或 `pdfjs-dist` 支持的其他格式。

##### 配置 (`MobilePDFViewerConfig`)

| 键 | 类型 | 默认值 | 描述 |
| :--- | :--- | :--- | :--- |
| `resolution_multiplier`| `number` | `3` | 画布渲染分辨率的倍率。更高的值会带来更清晰的图像，但会增加内存使用量。 |
| `pdf_container_class` | `string[]` | `[]` | 添加到主包装器 (`wrap_div`) 的自定义 CSS 类名数组。 |
| `transform_container_class`| `string[]` | `[]` | 添加到可变换内容容器 (`inner_div`) 的自定义 CSS 类名数组。 |
| `page_container_class` | `string[]` | `[]` | 添加到每个独立页面包装器 `div` 的自定义 CSS 类名数组。 |
| `canvas_class` | `string[]` | `[]` | 添加到每个页面 `<canvas>` 元素的自定义 CSS 类名数组。 |
| `hook_actions` | `HookActions`| `{}` | 一个包含生命周期回调函数的对象。 |

##### 生命周期钩子 (`hook_actions`)

| 钩子 | 参数 | 描述 |
| :--- | :--- | :--- |
| `start_loading` | `() => Promise<void>` | **异步**。在调用 `load_pdf` 时触发。非常适合用于显示加载指示器。 |
| `begin_insert_pages`| `(total_pages: number) => void`| 在 PDF 解析完成后触发。建议在此处重置变换状态。 |
| `complete_loading`| `(pages, pdf_doc, total) => Promise<void>` | **异步**。在所有页面占位符都已添加到 DOM 后触发。 |
| `start_rendering` | `(page: PDFPage) => void` | 在特定页面即将开始渲染之前触发。 |
| `end_rendering` | `(page: PDFPage) => void` | 在特定页面完成渲染之后触发。 |

---

#### `new Transform(transform_el, wrapper_el, boundary?)`

管理内容元素的 2D 变换（缩放和平移）。

-   **`transform_el`**: 将被应用 CSS 变换的元素 (`PDFViewer.inner_div`)。
-   **`wrapper_el`**: 定义边界的外层元素 (`PDFViewer.wrap_div`)。
-   **`boundary`**: 可选对象，用于配置移动边界和缩放限制。

##### Boundary (边界) 配置
`boundary` 对象为平移和缩放设置限制。

| 键 | 类型 | 默认值 | 描述 |
| :--- | :--- | :--- | :--- |
| `left` | `number` | `50` | 距离左边缘的最大可平移距离（单位：像素）。 |
| `right` | `number` | `50` | 距离右边缘的最大可平移距离（单位：像素）。 |
| `top` | `number` | `50` | 距离上边缘的最大可平移距离（单位：像素）。 |
| `bottom` | `number` | `50` | 距离下边缘的最大可平移距离（单位：像素）。 |
| `min_scale` | `number` | `0.5` | 允许的最小缩小比例。 |
| `max_scale` | `number` | `4` | 允许的最大放大比例。 |
**注意:** `left`、`right`、`top` 和 `bottom` 边界约束仅在内容被放大时 (`scale > 1`) 生效。

##### 方法
-   **`set_dragging(value: boolean)`**: 设置内部的拖动状态。
-   **`set_pinching(value: boolean)`**: 设置内部的双指缩放状态。
-   **`get_dragging(): boolean`**: 如果拖动操作正在进行，则返回 `true`。
-   **`get_pinching(): boolean`**: 如果双指缩放操作正在进行，则返回 `true`。
-   **`get_translate(): { translate_x: number, translate_y: number }`**: 返回当前的平移值。
-   **`get_scale(): number`**: 返回当前的缩放值。
-   **`transform(position?)`**: 应用一个变换。`position` 是一个包含可选 `translate_x`、`translate_y` 和 `scale` 属性的对象。
-   **`reset_transform()`**: 将缩放重置为 `1`，平移重置为 `(0, 0)`。
-   **`constrain_boundary(x, y)`**: 计算并返回受边界约束的新坐标。

---

#### `new TouchManager(transform_instance)`

监听用户的触摸事件并协调手势。构造函数会自动检测触摸支持。如果支持触摸，它会调用 `addEventListener()` 开始监听事件。

-   **`transform_instance`**: 此管理器将要控制的 `Transform` 类的实例。

##### 方法
-   **`addEventListener()`**: 将 `touchstart`、`touchmove` 和 `touchend` 事件监听器附加到变换元素上。在支持触摸的设备上，构造函数会自动调用它。
-   **`removeEventListener()`**: 移除所有事件监听器。**这对于在单页应用中进行清理至关重要**，以防止组件卸载时发生内存泄漏。

### 🙏 贡献

欢迎提交贡献、问题和功能请求！请随时查看 [issues 页面](https://github.com/zhayes/mobile_pdf/issues)。

### 📄 许可证

本项目基于 MIT 许可证授权。
