// 扩展安装时的初始化
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('透明文字显示工具已安装');
  
  // 设置默认配置
  const defaultSettings = {
    enabled: false,
    text: '',
    opacity: 0.5,
    fontSize: 16,
    textColor: '#333333',
    position: 'top-right'
  };
  
  try {
    // 只在首次安装时设置默认值
    if (details.reason === 'install') {
      await chrome.storage.sync.set(defaultSettings);
    }
  } catch (error) {
    console.error('初始化设置失败:', error);
  }
});

// 处理快捷键命令
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'toggle-display') {
    try {
      // 获取当前活动标签页
      const [activeTab] = await chrome.tabs.query({ 
        active: true, 
        currentWindow: true 
      });
      
      if (activeTab && activeTab.id) {
        // 发送切换命令到内容脚本
        const response = await chrome.tabs.sendMessage(activeTab.id, {
          action: 'toggle'
        });
        
        if (response && response.success) {
          // 更新存储中的启用状态
          await chrome.storage.sync.set({ enabled: response.enabled });
          
          // 显示通知（可选）
          if (response.enabled) {
            showNotification('文字显示已启用');
          } else {
            showNotification('文字显示已禁用');
          }
        }
      }
    } catch (error) {
      console.error('执行快捷键命令失败:', error);
      // 如果内容脚本未加载，尝试重新注入
      try {
        const [activeTab] = await chrome.tabs.query({ 
          active: true, 
          currentWindow: true 
        });
        
        if (activeTab && activeTab.id) {
          await chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            files: ['content.js']
          });
        }
      } catch (injectionError) {
        console.error('重新注入内容脚本失败:', injectionError);
      }
    }
  }
});

// 处理来自内容脚本和弹出窗口的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  try {
    switch (message.action) {
      case 'getSettings':
        // 获取当前设置
        chrome.storage.sync.get({
          enabled: false,
          text: '',
          opacity: 0.5,
          fontSize: 16,
          textColor: '#333333',
          position: 'top-right'
        }).then(settings => {
          sendResponse({ success: true, settings });
        }).catch(error => {
          sendResponse({ success: false, error: error.message });
        });
        return true; // 保持消息通道开放
        
      case 'updateAllTabs':
        // 更新所有标签页
        updateAllTabs(message.settings).then(() => {
          sendResponse({ success: true });
        }).catch(error => {
          sendResponse({ success: false, error: error.message });
        });
        return true;
        
      default:
        sendResponse({ success: false, error: 'Unknown action' });
    }
  } catch (error) {
    console.error('处理消息失败:', error);
    sendResponse({ success: false, error: error.message });
  }
});

// 更新所有标签页的设置
async function updateAllTabs(settings) {
  try {
    const tabs = await chrome.tabs.query({});
    const updatePromises = tabs.map(async (tab) => {
      try {
        // 跳过特殊页面（chrome://、edge://等）
        if (tab.url.startsWith('chrome://') || 
            tab.url.startsWith('edge://') || 
            tab.url.startsWith('moz-extension://') ||
            tab.url.startsWith('chrome-extension://')) {
          return;
        }
        
        await chrome.tabs.sendMessage(tab.id, {
          action: 'updateSettings',
          settings: settings
        });
      } catch (error) {
        // 忽略无法发送消息的标签页
        console.log(`无法更新标签页 ${tab.id}:`, error.message);
      }
    });
    
    await Promise.allSettled(updatePromises);
  } catch (error) {
    console.error('更新所有标签页失败:', error);
    throw error;
  }
}

// 显示通知
function showNotification(message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon48.png',
    title: '透明文字显示工具',
    message: message
  });
}

// 监听标签页更新
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // 当标签页完成加载时，如果扩展已启用，则发送设置
  if (changeInfo.status === 'complete' && tab.url) {
    try {
      // 跳过特殊页面
      if (tab.url.startsWith('chrome://') || 
          tab.url.startsWith('edge://') || 
          tab.url.startsWith('moz-extension://') ||
          tab.url.startsWith('chrome-extension://')) {
        return;
      }
      
      // 获取当前设置
      const settings = await chrome.storage.sync.get({
        enabled: false,
        text: '',
        opacity: 0.5,
        fontSize: 16,
        textColor: '#333333',
        position: 'top-right'
      });
      
      // 如果启用了显示，发送设置到新加载的页面
      if (settings.enabled && settings.text) {
        setTimeout(async () => {
          try {
            await chrome.tabs.sendMessage(tabId, {
              action: 'updateSettings',
              settings: settings
            });
          } catch (error) {
            // 内容脚本可能还未加载完成，忽略错误
          }
        }, 1000);
      }
    } catch (error) {
      console.error('处理标签页更新失败:', error);
    }
  }
});

// 监听存储变化，同步到所有标签页
chrome.storage.onChanged.addListener(async (changes, namespace) => {
  if (namespace === 'sync') {
    try {
      // 获取完整的当前设置
      const settings = await chrome.storage.sync.get({
        enabled: false,
        text: '',
        opacity: 0.5,
        fontSize: 16,
        textColor: '#333333',
        position: 'top-right'
      });
      
      // 更新所有标签页
      await updateAllTabs(settings);
    } catch (error) {
      console.error('同步设置到所有标签页失败:', error);
    }
  }
});
