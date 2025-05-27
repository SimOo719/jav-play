import './style.css'
// 导入新的组件方法
import { addOrUpdatePlayerButtons, hidePlayerButtons } from '../../components/PlayerButtons';

// storage key, 与 popup 中保持一致
const STORAGE_KEY = 'feature_enabled';

export default defineContentScript({
  matches: ['*://*.javdb.com/v/*'],
  async main() {
    // 检查功能是否启用
    const isEnabled = await storage.getItem(`sync:${STORAGE_KEY}`) ?? true;
    
    if (!isEnabled) {
      console.log('❌ [JavDB Helper] 功能已禁用。');
      hidePlayerButtons(); // 使用新的方法隐藏按钮
      return;
    }
  
    console.log('🚀 [JavDB Helper] 功能已启用，正在运行脚本...');

    const processPage = async () => {
      if (window.location.pathname.startsWith('/v/')) {
        const videoNumber = getVideoNumber();
        if (videoNumber) {
          const missavUUID = await getMissavUUID(videoNumber);
          if (missavUUID) {
            // 成功获取 UUID，创建或更新按钮
            addOrUpdatePlayerButtons(missavUUID); // 使用新的方法更新按钮
          } else {
            // 未获取到 UUID，隐藏按钮
            hidePlayerButtons();
          }
        }
      } else {
        // 如果不在视频详情页，隐藏按钮
        hidePlayerButtons();
      }
    };

    // 监听 URL 路径变化
    let lastPathname = window.location.pathname;
    new MutationObserver(() => {
      const currentPathname = window.location.pathname;
      if (currentPathname !== lastPathname) {
        lastPathname = currentPathname;
        processPage();
      }
    }).observe(document.body, { childList: true, subtree: true });

    // 页面加载时执行一次
    processPage();
  }
});

// 获取目标视频番号 (此函数保持不变)
function getVideoNumber(): string {
    const targetElement = document.querySelector('a.button.is-white.copy-to-clipboard');
    if (!targetElement) {
      console.log('未找到目标元素');
      return '';
    }
    const targetNumber = targetElement.getAttribute('data-clipboard-text');
    if (!targetNumber) {
      console.log('无目标番号');
      return '';
    }
    console.log('目标番号', targetNumber);
    return targetNumber;
}

// 获取 missav UUID (此函数保持不变)
async function getMissavUUID(videoNumber: string): Promise<string> {
  const lowerTargetNumber = videoNumber.toLowerCase();
  const targetUrl = `https://missav.ws/dm1/en/${lowerTargetNumber}`;

  try {
      const response = await chrome.runtime.sendMessage({
          type: 'fetchMissav',
          url: targetUrl
      });

      if (!response.success) {
          throw new Error(response.error);
      }
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(response.html, 'text/html');
      
      const scripts = doc.getElementsByTagName('script');

      for (const script of scripts) {
          const content = script.textContent || '';
          if (content.includes('thumbnail')) {
              const urlsMatch = content.match(/urls:\s*\[(.*?)\]/s);
              if (urlsMatch) {
                  const firstUrl = urlsMatch[1].split(',')[0].trim().replace(/"/g, '').replace(/\\/g, '');
                  const uuidMatch = firstUrl.match(/\/([0-9a-f-]+)\/seek\//i);
                  if (uuidMatch) {
                    console.log('uuidMatch', uuidMatch[1]);
                    return uuidMatch[1];
                  }
              }
          }
      }
      console.warn('未找到 uuid');
      return '';
  } catch (error) {
      console.error('获取或解析文档时出错:', error);
      return '';
  }
}