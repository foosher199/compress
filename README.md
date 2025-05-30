# 网页资源压缩工具

一个基于浏览器的图片和音频压缩工具。

## 功能特点

- 图片压缩
  - 支持多种压缩质量选择
  - 支持自定义压缩比例
  - 实时预览压缩效果
  - 批量处理和导出

- 音频压缩
  - 支持多种比特率选择
  - 音频预览功能
  - 批量处理和导出

- 多语言支持
  - 中文界面
  - 英文界面
  - 语言设置自动保存

## 使用的库
- browser-image-compression.js - 图片压缩
- FFmpeg.js - 音频压缩
- JSZip - 文件打包下载

## 本地开发

1. 确保所有依赖文件都在正确的位置：
   ```
   project/
   ├── index.html
   ├── styles/
   │   └── main.css
   ├── scripts/
   │   ├── ffmpeg/
   │   │   ├── ffmpeg.js
   │   │   ├── ffmpeg-core.js
   │   │   ├── ffmpeg-core.wasm
   │   │   └── ffmpeg-core.worker.js
   │   ├── browser-image-compression.js
   │   ├── jszip.min.js
   │   └── main.js
   └── README.md
   ```

2. 使用本地服务器运行项目（必须，因为 WASM 文件需要通过 HTTP 服务器加载）
   - 可以使用 Python 的简单 HTTP 服务器：
     ```bash
     python -m http.server 8080
     ```
   - 或者使用 VS Code 的 Live Server 插件

3. 在浏览器中访问 `http://localhost:8080`

## 注意事项

- 由于使用了 WASM，必须通过 HTTP 服务器访问，直接打开 HTML 文件将无法工作
- 音频压缩功能需要等待 FFmpeg 初始化完成才能使用
- 建议使用现代浏览器（Chrome、Firefox、Safari 最新版本）

## 功能需求

### 1. 图片压缩
- 支持上传多种格式的图片（JPG、PNG、WEBP等）
- 支持批量上传图片
- 提供压缩质量调节选项（低、中、高）
- 显示压缩前后的文件大小对比
- 支持预览压缩后的图片效果
- 提供下载压缩后的图片功能

### 2. 音频压缩
- 支持常见音频格式（MP3、WAV、OGG等）
- 支持调节音频比特率
- 支持调节音频采样率
- 显示压缩前后的文件大小对比
- 支持预览压缩后的音频
- 提供下载压缩后的音频功能

### 3. 用户界面
- 简洁直观的拖拽上传界面
- 实时显示压缩进度
- 批量处理进度展示
- 响应式设计，支持移动端访问

### 4. 其他功能
- 支持同时压缩多个文件
- 提供压缩历史记录
- 支持设置最大文件大小限制
- 提供简单的文件管理功能

## 技术要求

### 前端
- 使用现代前端框架（如React/Vue）
- 实现拖拽上传功能
- 实现文件预览功能
- 实现进度条显示

### 后端
- 实现文件上传和下载接口
- 集成图片压缩库
- 集成音频压缩库
- 实现文件临时存储功能

### 安全性
- 文件类型验证
- 文件大小限制
- 防止恶意文件上传

## 后续优化方向
- 添加更多文件格式支持
- 优化压缩算法
- 添加批量下载功能
- 添加云存储功能
- 添加用户账户系统

## 项目状态
🚧 开发中

## 许可证
MIT License 