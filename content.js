// 扩展状态和配置
let extensionState = {
  enabled: false,
  text: '',
  opacity: 0.5,
  fontSize: 16,
  textColor: '#333333',
  position: 'top-right'
};

// DOM 元素
let textOverlay = null;
const OVERLAY_ID = 'text-overlay-extension-element';

// 初始化
async function initialize() {
  try {
    // 加载保存的设置
    const settings = await chrome.storage.sync.get({
      enabled: false,
      text: '',
      opacity: 0.5,
      fontSize: 16,
      textColor: '#333333',
      position: 'top-right'
    });
    
    extensionState = settings;
    
    // 创建或更新文字覆盖层
    if (extensionState.enabled && extensionState.text) {
      createOrUpdateOverlay();
    }
  } catch (error) {
    console.error('初始化文字覆盖层失败:', error);
  }
}

// 创建或更新文字覆盖层
function createOrUpdateOverlay() {
  // 移除现有的覆盖层
  removeOverlay();
  
  // 如果没有文字内容或未启用，不创建覆盖层
  if (!extensionState.enabled || !extensionState.text.trim()) {
    return;
  }
  
  // 创建新的覆盖层元素
  textOverlay = document.createElement('div');
  textOverlay.id = OVERLAY_ID;
  textOverlay.className = 'text-overlay-extension';
  
  // 设置文字内容
  textOverlay.textContent = extensionState.text;
  
  // 应用样式
  applyStyles();
  
  // 添加位置类
  textOverlay.classList.add(`position-${extensionState.position}`);
  
  // 添加到页面
  document.body.appendChild(textOverlay);
  
  // 添加防冲突保护
  protectOverlay();
}

// 应用样式到覆盖层
function applyStyles() {
  if (!textOverlay) return;
  
  const styles = {
    opacity: extensionState.opacity.toString(),
    fontSize: extensionState.fontSize + 'px',
    color: extensionState.textColor
  };
  
  // 应用所有样式
  Object.assign(textOverlay.style, styles);
}

// 移除文字覆盖层
function removeOverlay() {
  const existingOverlay = document.getElementById(OVERLAY_ID);
  if (existingOverlay) {
    existingOverlay.remove();
  }
  textOverlay = null;
}

// 保护覆盖层不被页面脚本影响
function protectOverlay() {
  if (!textOverlay) return;
  
  // 使用 MutationObserver 监控覆盖层是否被删除或修改
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        // 检查覆盖层是否被删除
        if (!document.getElementById(OVERLAY_ID) && extensionState.enabled && extensionState.text) {
          createOrUpdateOverlay();
        }
      } else if (mutation.type === 'attributes' && mutation.target === textOverlay) {
        // 如果覆盖层的属性被修改，重新应用样式
        applyStyles();
      }
    });
  });
  
  // 开始观察
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class']
  });
  
  // 定期检查覆盖层是否存在
  const checkInterval = setInterval(() => {
    if (!document.getElementById(OVERLAY_ID) && extensionState.enabled && extensionState.text) {
      createOrUpdateOverlay();
    }
    
    // 如果扩展被禁用，清除检查
    if (!extensionState.enabled) {
      clearInterval(checkInterval);
    }
  }, 5000);
}

// 切换显示状态
function toggleDisplay() {
  extensionState.enabled = !extensionState.enabled;
  
  if (extensionState.enabled) {
    createOrUpdateOverlay();
  } else {
    removeOverlay();
  }
  
  // 保存状态
  chrome.storage.sync.set({ enabled: extensionState.enabled });
}

// 监听来自弹出窗口和后台脚本的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  try {
    switch (message.action) {
      case 'updateSettings':
        extensionState = { ...extensionState, ...message.settings };
        createOrUpdateOverlay();
        sendResponse({ success: true });
        break;
        
      case 'enable':
        extensionState.enabled = true;
        createOrUpdateOverlay();
        sendResponse({ success: true });
        break;
        
      case 'disable':
        extensionState.enabled = false;
        removeOverlay();
        sendResponse({ success: true });
        break;
        
      case 'toggle':
        toggleDisplay();
        sendResponse({ success: true, enabled: extensionState.enabled });
        break;
        
      case 'getState':
        sendResponse({ state: extensionState });
        break;
        
      default:
        sendResponse({ success: false, error: 'Unknown action' });
    }
  } catch (error) {
    console.error('处理消息失败:', error);
    sendResponse({ success: false, error: error.message });
  }
  
  return true; // 保持消息通道开放
});

// 监听存储变化
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync') {
    let needsUpdate = false;
    
    for (const key in changes) {
      if (extensionState.hasOwnProperty(key)) {
        extensionState[key] = changes[key].newValue;
        needsUpdate = true;
      }
    }
    
    if (needsUpdate) {
      createOrUpdateOverlay();
    }
  }
});

// 处理页面可见性变化
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && extensionState.enabled && extensionState.text) {
    // 页面变为可见时，确保覆盖层存在
    if (!document.getElementById(OVERLAY_ID)) {
      createOrUpdateOverlay();
    }
  }
});

// 处理页面动态内容变化
const documentObserver = new MutationObserver((mutations) => {
  // 如果页面结构发生重大变化，重新创建覆盖层
  if (extensionState.enabled && extensionState.text && !document.getElementById(OVERLAY_ID)) {
    createOrUpdateOverlay();
  }
});

// 开始观察文档变化
documentObserver.observe(document.body, {
  childList: true,
  subtree: true
});

// 页面加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

// 防止内存泄漏，页面卸载时清理
window.addEventListener('beforeunload', () => {
  removeOverlay();
  documentObserver.disconnect();
});
