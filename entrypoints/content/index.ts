// 从两个组件中导入方法
import { 
  addOrUpdatePlayerButtons, 
  hidePlayerButtons, 
  showPlayerButtonsChecking, 
  showPlayerButtons404 
} from '../../components/PlayerButtons';
import { 
  addOrUpdateNavigationButtons, 
  hideNavigationButtons, 
  showNavigationButtonChecking, 
  showNavigationButton404 
} from '../../components/NavigationButtons';

const STORAGE_KEY = 'feature_enabled';
const VIDEO_SOURCE_KEY = 'video_source';

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
        // 获取用户选择的视频源
        const videoSource = await storage.getItem(`sync:${VIDEO_SOURCE_KEY}`) ?? 'missav';
        
        // 1. 先显示检查状态
        showNavigationButtonChecking(videoSource as string);
        showPlayerButtonsChecking();
        
        // 2. 检查目标页面是否存在
        const targetUrl = getTargetUrl(videoNumber, videoSource as string);
        const urlExists = await checkUrlExists(targetUrl);
        
        if (!urlExists) {
          // 3.1 目标页面不存在，显示404状态
          showNavigationButton404(videoSource as string);
          showPlayerButtons404();
          console.log('目标页面不存在:', targetUrl);
          return;
        }
        
        // 3.2 目标页面存在，显示正常的导航按钮
        addOrUpdateNavigationButtons(videoNumber, videoSource as string);
        
        // 4. 异步获取播放链接来显示播放器按钮
        const playUrl = await getPlayUrl(videoNumber, videoSource as string);
        if (playUrl) {
          addOrUpdatePlayerButtons(playUrl);
        } else {
          // 如果没有播放链接，显示404状态
          showPlayerButtons404();
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

// 获取目标URL
function getTargetUrl(videoNumber: string, videoSource: string): string {
  if (videoSource === 'jable') {
    return `https://jable.tv/videos/${videoNumber.toLowerCase()}/`;
  } else {
    // default to missav
    return `https://missav.ws/${videoNumber.toLowerCase()}`;
  }
}

// 检查URL是否存在
async function checkUrlExists(url: string): Promise<boolean> {
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'checkUrl',
      url: url
    });

    if (!response.success) {
      console.error('检查URL时出错:', response.error);
      return false;
    }

    return response.exists;
  } catch (error) {
    console.error('检查URL时出错:', error);
    return false;
  }
}

// 获取播放链接 (支持不同视频源)
async function getPlayUrl(videoNumber: string, videoSource: string): Promise<string> {
  if (videoSource === 'jable') {
    return await getJablePlayUrl(videoNumber);
  } else {
    // default to missav
    return await getMissavPlayUrl(videoNumber);
  }
}

// 获取 MissAV 播放链接
async function getMissavPlayUrl(videoNumber: string): Promise<string> {
  const lowerTargetNumber = videoNumber.toLowerCase();
  const targetUrl = `https://missav.ws/dm1/en/${lowerTargetNumber}`;

  try {
      const response = await chrome.runtime.sendMessage({
          type: 'fetchVideo',
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
                    console.log('MissAV uuidMatch', uuidMatch[1]);
                    return `https://surrit.com/${uuidMatch[1]}/playlist.m3u8`;
                  }
              }
          }
      }
      console.warn('未找到 MissAV uuid');
      return '';
  } catch (error) {
      console.error('获取或解析 MissAV 文档时出错:', error);
      return '';
  }
}

// 获取 Jable 播放链接
async function getJablePlayUrl(videoNumber: string): Promise<string> {
  const lowerTargetNumber = videoNumber.toLowerCase();
  const targetUrl = `https://jable.tv/videos/${lowerTargetNumber}/`;

  try {
      const response = await chrome.runtime.sendMessage({
          type: 'fetchVideo',
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
          // 查找 var hlsUrl 变量
          const hlsUrlMatch = content.match(/var\s+hlsUrl\s*=\s*['"](.*?)['"]/);
          if (hlsUrlMatch) {
              console.log('Jable hlsUrl', hlsUrlMatch[1]);
              return hlsUrlMatch[1];
          }
      }
      console.warn('未找到 Jable hlsUrl');
      return '';
  } catch (error) {
      console.error('获取或解析 Jable 文档时出错:', error);
      return '';
  }
}