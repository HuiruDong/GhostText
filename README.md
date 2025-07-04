# GhostText - Chrome 扩展

## 功能介绍

这是一个 Chrome 浏览器扩展，允许用户在所有网页的指定位置显示自定义透明文字，文字不会干扰正常的网页操作。

### 主要功能

- ✨ 在网页上显示自定义透明文字
- 🎯 支持四个显示位置（右上角、左上角、右下角、左下角）
- 🎨 可调节透明度、字体大小、颜色
- 👻 完全非侵入性设计，不影响网页操作
- ⚡ 支持快捷键快速切换显示状态
- 💾 自动保存设置，浏览器重启后恢复
- 📱 响应式设计，适配不同屏幕尺寸

## 安装方法

### 方法一：开发者模式安装（推荐）

1. **准备图标文件**（可选）
   - 查看 `icons/README.md` 文件中的说明
   - 如果不添加图标，扩展仍可正常工作

2. **打开 Chrome 扩展管理页面**
   - 在地址栏输入：`chrome://extensions/`
   - 或者点击菜单 → 更多工具 → 扩展程序

3. **启用开发者模式**
   - 在页面右上角切换"开发者模式"开关

4. **加载扩展**
   - 点击"加载已解压的扩展程序"按钮
   - 选择包含扩展文件的文件夹（chrome-extension 文件夹）
   - 点击"选择文件夹"

5. **验证安装**
   - 扩展应该出现在扩展列表中
   - 浏览器工具栏会显示扩展图标

### 方法二：打包安装

1. **打包扩展**
   ```bash
   # 在 chrome-extension 文件夹中运行
   # Chrome 会自动打包为 .crx 文件
   ```

2. **安装 CRX 文件**
   - 将 .crx 文件拖拽到 Chrome 扩展管理页面
   - 按照提示完成安装

## 使用说明

### 基本使用

1. **打开扩展弹窗**
   - 点击浏览器工具栏中的扩展图标
   - 或右键点击扩展图标

2. **启用文字显示**
   - 在弹窗中切换"启用显示"开关

3. **输入显示文字**
   - 在"显示文字"文本框中输入要显示的内容
   - 支持多行文字和特殊字符

4. **调整显示效果**
   - **透明度**：拖动滑块调节文字透明度（0.1-1.0）
   - **字体大小**：调节文字大小（12-24px）
   - **文字颜色**：点击颜色选择器选择颜色
   - **显示位置**：选择文字在页面上的位置

5. **保存设置**
   - 点击"保存设置"按钮
   - 设置会自动应用到所有网页

### 高级功能

#### 快捷键操作
- **Ctrl+Shift+T**：快速切换文字显示开关
- 可在 Chrome 扩展管理页面的"键盘快捷键"中自定义

#### 实时预览
- 在设置界面可以看到文字效果的实时预览
- 所有设置变化会立即在预览区显示

#### 自动同步
- 设置会自动同步到所有已打开的网页
- 新打开的网页会自动应用当前设置

## 技术特性

### 非侵入性设计
- 使用 `pointer-events: none` 实现点击穿透
- 最高 z-index 层级确保文字始终可见
- 不会影响网页原有功能和布局

### 兼容性保护
- 使用 MutationObserver 防止被页面脚本干扰
- 定期检查确保文字显示正常
- 兼容各种类型的网站（SPA、动态网站等）

### 性能优化
- 轻量级实现，不影响页面加载速度
- 最小内存占用
- 响应式设计适配不同设备

## 故障排除

### 常见问题

**Q: 文字没有显示在网页上**
- 确保"启用显示"开关已打开
- 检查是否输入了显示文字
- 尝试刷新页面或重新打开网页

**Q: 快捷键不工作**
- 检查快捷键是否与其他扩展冲突
- 在 chrome://extensions/shortcuts 中重新设置快捷键

**Q: 在某些网站上不工作**
- 某些特殊网站（如 chrome:// 页面）不支持扩展
- 尝试在其他网站上测试

**Q: 设置没有保存**
- 确保点击了"保存设置"按钮
- 检查 Chrome 的存储权限是否正常

### 调试方法

1. **查看控制台错误**
   - 按 F12 打开开发者工具
   - 查看 Console 面板是否有错误信息

2. **检查扩展状态**
   - 访问 chrome://extensions/
   - 确保扩展已启用且没有错误

3. **重新加载扩展**
   - 在扩展管理页面点击"重新加载"按钮
   - 或禁用后重新启用扩展

## 文件结构

```
chrome-extension/
├── manifest.json          # 扩展配置文件
├── popup.html             # 弹窗界面
├── popup.css              # 弹窗样式
├── popup.js               # 弹窗逻辑
├── content.js             # 内容脚本
├── content.css            # 内容样式
├── background.js          # 后台脚本
├── icons/                 # 图标文件夹
│   ├── icon.svg          # SVG 源图标
│   ├── icon16.png        # 16x16 图标
│   ├── icon48.png        # 48x48 图标
│   ├── icon128.png       # 128x128 图标
│   └── README.md         # 图标说明
└── README.md             # 本文件
```

## 开发说明

### 技术栈
- Manifest V3
- 原生 JavaScript（无外部依赖）
- CSS3（现代浏览器特性）
- Chrome Extension APIs

### 权限说明
- `storage`：保存用户设置
- `activeTab`：获取当前活动标签页
- `<all_urls>`：在所有网页上注入内容脚本

### 自定义开发
如需修改或扩展功能，主要文件：
- `popup.js`：修改设置界面逻辑
- `content.js`：修改文字显示逻辑
- `background.js`：修改后台服务逻辑

## 版本历史

### v1.0.0
- 基础文字显示功能
- 透明度、大小、颜色调节
- 四个位置选择
- 快捷键支持
- 设置持久化

## 许可证

本项目仅供学习和个人使用。

## 支持

如有问题或建议，请查看故障排除部分或联系开发者。
