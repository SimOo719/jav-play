/**
 * 创建或更新一个浮动播放器按钮。
 * @param id - 按钮元素的 ID。
 * @param name - 按钮上显示的文本。
 * @param iconClass - 按钮图标的 CSS 类。
 * @param url - 按钮点击后跳转的 URL。
 * @param topPosition - 按钮的 CSS 'top' 属性值。
 */
function createOrUpdateButton(id: string, name:string, iconClass: string, url: string, topPosition: string) {
    let button = document.getElementById(id) as HTMLAnchorElement | null;
  
    if (!button) {
      button = document.createElement('a');
      button.id = id;
      button.className = 'wxt-player-button'; // 为所有播放器按钮使用一个通用类名
      button.innerHTML = `
        <i class="${iconClass}"></i>
        <span>${name}</span>
      `;
      document.body.appendChild(button);
  
      // 添加点击事件监听器
      button.addEventListener('click', (e) => {
        e.preventDefault(); // 阻止 <a> 标签的默认跳转行为
        window.location.href = button!.href;
      });
    }
  
    // 更新按钮的链接和位置
    button.href = url;
    button.style.top = topPosition;
    button.style.display = 'flex'; // 确保按钮可见
  }
  
  /**
   * 隐藏指定的播放器按钮。
   * @param id - 要隐藏的按钮的 ID。
   */
  function hideButton(id: string) {
    const button = document.getElementById(id);
    if (button) {
      button.style.display = 'none';
    }
  }
  
  // 定义按钮的常量 ID
  const IINA_BUTTON_ID = 'wxt-iina-floating-button';
  const POTPLAYER_BUTTON_ID = 'wxt-potplayer-floating-button';
  
  /**
   * 添加或更新 IINA 和 PotPlayer 的浮动按钮。
   * @param missavUUID - 用于生成播放链接的 UUID。
   */
  export function addOrUpdatePlayerButtons(missavUUID: string) {
    const playlistUrl = `https://surrit.com/${missavUUID}/playlist.m3u8`;
    
    // IINA 按钮
    const iinaUrl = `iina://weblink?url=${playlistUrl}`;
    createOrUpdateButton(IINA_BUTTON_ID, 'IINA', 'icon-play', iinaUrl, '100px');
  
    // PotPlayer 按钮
    const potplayerUrl = `potplayer://${playlistUrl}`;
    createOrUpdateButton(POTPLAYER_BUTTON_ID, 'PotPlayer', 'icon-play', potplayerUrl, '150px');
  }
  
  /**
   * 隐藏所有的播放器按钮。
   */
  export function hidePlayerButtons() {
    hideButton(IINA_BUTTON_ID);
    hideButton(POTPLAYER_BUTTON_ID);
  }