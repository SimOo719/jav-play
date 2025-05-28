import './PlayerButtons.css';

/**
 * 创建或更新一个浮动播放器按钮。
 */
function createOrUpdateButton(id: string, name:string, iconClass: string, url: string, topPosition: string) {
  let button = document.getElementById(id) as HTMLAnchorElement | null;

  if (!button) {
    button = document.createElement('a');
    button.id = id;
    button.className = 'wxt-player-button';
    button.innerHTML = `
      <i class="${iconClass}"></i>
      <span>${name}</span>
    `;
    document.body.appendChild(button);

    button.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = button!.href;
    });
  }

  button.href = url;
  button.style.top = topPosition;
  button.style.display = 'flex';
}

/**
 * 隐藏指定的播放器按钮。
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
 * 添加或更新播放器按钮。
 * @param missavUUID - 用于生成播放链接的 UUID。
 */
export function addOrUpdatePlayerButtons(missavUUID: string) {
  const playlistUrl = `https://surrit.com/${missavUUID}/playlist.m3u8`;
  
  // IINA 按钮
  const iinaUrl = `iina://weblink?url=${playlistUrl}`;
  createOrUpdateButton(IINA_BUTTON_ID, 'IINA', 'icon-play', iinaUrl, '100px');

  // PotPlayer 按钮
  const potplayerUrl = `potplayer://${playlistUrl}`;
  createOrUpdateButton(POTPLAYER_BUTTON_ID, 'PotPlayer', 'icon-play', potplayerUrl, '140px');
}

/**
 * 隐藏所有的播放器按钮。
 */
export function hidePlayerButtons() {
  hideButton(IINA_BUTTON_ID);
  hideButton(POTPLAYER_BUTTON_ID);
}