// 默认设置
const DEFAULT_SETTINGS = {
  enabled: false,
  text: '',
  opacity: 0.5,
  fontSize: 16,
  textColor: '#333333',
  position: 'top-right'
};

// DOM 元素
let elements = {};

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
  initializeElements();
  await loadSettings();
  setupEventListeners();
  updatePreview();
});

// 初始化 DOM 元素引用
function initializeElements() {
  elements = {
    enableToggle: document.getElementById('enableToggle'),
    textInput: document.getElementById('textInput'),
    opacity: document.getElementById('opacity'),
    opacityValue: document.getElementById('opacityValue'),
    fontSize: document.getElementById('fontSize'),
    fontSizeValue: document.getElementById('fontSizeValue'),
    textColor: document.getElementById('textColor'),
    position: document.getElementById('position'),
    preview: document.getElementById('preview'),
    saveBtn: document.getElementById('saveBtn'),
    clearBtn: document.getElementById('clearBtn')
  };
}

// 加载保存的设置
async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get(DEFAULT_SETTINGS);
    
    elements.enableToggle.checked = result.enabled;
    elements.textInput.value = result.text;
    elements.opacity.value = result.opacity;
    elements.opacityValue.textContent = result.opacity;
    elements.fontSize.value = result.fontSize;
    elements.fontSizeValue.textContent = result.fontSize + 'px';
    elements.textColor.value = result.textColor;
    elements.position.value = result.position;
  } catch (error) {
    console.error('加载设置失败:', error);
  }
}

// 设置事件监听器
function setupEventListeners() {
  // 开关切换
  elements.enableToggle.addEventListener('change', handleToggleChange);
  
  // 文字输入
  elements.textInput.addEventListener('input', updatePreview);
  
  // 透明度调节
  elements.opacity.addEventListener('input', (e) => {
    elements.opacityValue.textContent = e.target.value;
    updatePreview();
  });
  
  // 字体大小调节
  elements.fontSize.addEventListener('input', (e) => {
    elements.fontSizeValue.textContent = e.target.value + 'px';
    updatePreview();
  });
  
  // 颜色和位置变化
  elements.textColor.addEventListener('change', updatePreview);
  elements.position.addEventListener('change', updatePreview);
  
  // 按钮事件
  elements.saveBtn.addEventListener('click', saveSettings);
  elements.clearBtn.addEventListener('click', clearText);
}

// 处理开关切换
async function handleToggleChange() {
  const enabled = elements.enableToggle.checked;
  await saveSettings();
  
  // 发送消息到内容脚本
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.tabs.sendMessage(tab.id, {
      action: enabled ? 'enable' : 'disable'
    });
  } catch (error) {
    console.error('发送消息失败:', error);
  }
}

// 更新预览
function updatePreview() {
  const text = elements.textInput.value || '这里是预览效果';
  const opacity = elements.opacity.value;
  const fontSize = elements.fontSize.value;
  const textColor = elements.textColor.value;
  
  elements.preview.textContent = text;
  elements.preview.style.opacity = opacity;
  elements.preview.style.fontSize = fontSize + 'px';
  elements.preview.style.color = textColor;
}

// 保存设置
async function saveSettings() {
  const settings = {
    enabled: elements.enableToggle.checked,
    text: elements.textInput.value,
    opacity: parseFloat(elements.opacity.value),
    fontSize: parseInt(elements.fontSize.value),
    textColor: elements.textColor.value,
    position: elements.position.value
  };
  
  try {
    await chrome.storage.sync.set(settings);
    
    // 发送更新消息到所有标签页
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      try {
        await chrome.tabs.sendMessage(tab.id, {
          action: 'updateSettings',
          settings: settings
        });
      } catch (error) {
        // 忽略无法发送消息的标签页（如 chrome:// 页面）
      }
    }
    
    // 显示保存成功提示
    showNotification('设置已保存');
  } catch (error) {
    console.error('保存设置失败:', error);
    showNotification('保存失败');
  }
}

// 清空文字
async function clearText() {
  elements.textInput.value = '';
  updatePreview();
  await saveSettings();
}

// 显示通知
function showNotification(message) {
  const btn = elements.saveBtn;
  const originalText = btn.textContent;
  btn.textContent = message;
  btn.style.background = '#28a745';
  
  setTimeout(() => {
    btn.textContent = originalText;
    btn.style.background = '#007bff';
  }, 1000);
}
