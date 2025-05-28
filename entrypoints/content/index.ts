// 从两个组件中导入方法
import { addOrUpdatePlayerButtons, hidePlayerButtons } from '../../components/PlayerButtons';
import { addOrUpdateNavigationButtons, hideNavigationButtons } from '../../components/NavigationButtons';

const STORAGE_KEY = 'feature_enabled';

export default defineContentScript({
  matches: ['*://*.javdb.com/v/*', '*://*.javlibrary.com/*'],
  async main() {
    const isEnabled = await storage.getItem(`sync:${STORAGE_KEY}`) ?? true;

    if (!isEnabled) {
      console.log('❌ [JavDB Helper] 功能已禁用。');
      hidePlayerButtons();
      hideNavigationButtons(); // 同时隐藏导航按钮
      return;
    }

    console.log('🚀 [JavDB Helper] 功能已启用，正在运行脚本...');

    const processPage = async () => {
      const videoNumber = getVideoNumber();
      if (videoNumber) {
        // 只要有番号，就显示导航按钮
        addOrUpdateNavigationButtons(videoNumber);

        // 异步获取 UUID 来显示播放器按钮
        const missavUUID = await getMissavUUID(videoNumber);
        if (missavUUID) {
          addOrUpdatePlayerButtons(missavUUID);
        } else {
          // 如果没有 UUID，则只隐藏播放器按钮
          hidePlayerButtons();
        }
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

// 获取目标视频番号
function getVideoNumber(): string | undefined {
  const pathname = window.location.pathname;
  // javdb
  if (pathname.startsWith('/v/')) {
    const targetElement = document.querySelector('a.button.is-white.copy-to-clipboard');
    if (!targetElement) {
      console.log('未找到目标元素');
      return;
    }
    const targetNumber = targetElement.getAttribute('data-clipboard-text');
    if (!targetNumber) {
      console.log('无目标番号');
      return;
    }
    console.log('目标番号', targetNumber);
    return targetNumber;
  }
  // javlibrary
  const search = new URLSearchParams(window.location.search)
  const v = search.get('v')
  if (v) {
    const targetElement = document.querySelector('#video_id > table > tbody > tr > td.text');
    return targetElement?.textContent ?? undefined
  }
}

// 获取 missav UUID
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
