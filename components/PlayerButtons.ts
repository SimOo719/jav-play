import './PlayerButtons.css';

/**
 * 创建或更新一个浮动播放器按钮。
 */
function createOrUpdateButton(id: string, name: string, iconClass: string, url: string, topPosition: string, isDisabled: boolean = false) {
  let button = document.getElementById(id) as HTMLAnchorElement | null;

  if (!button) {
    button = document.createElement('a');
    button.id = id;
    button.className = 'wxt-player-button';
    document.body.appendChild(button);

    // 只在按钮未禁用时添加点击事件
    if (!isDisabled) {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = button!.href;
      });
    }
  }

  // 无论是新创建还是更新，都要设置innerHTML
  button.innerHTML = `
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        >
        <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21ZM12 23C18.0751 23 23 18.0751 23 12C23 5.92487 18.0751 1 12 1C5.92487 1 1 5.92487 1 12C1 18.0751 5.92487 23 12 23Z"
            fill="currentColor"
        />
        <path d="M16 12L10 16.3301V7.66987L16 12Z" fill="currentColor" />
    </svg>
    <span>${name}</span>
  `;

  button.href = url;
  button.style.top = topPosition;
  button.style.display = 'flex';

  // 根据是否禁用来设置样式和行为
  if (isDisabled) {
    button.style.backgroundColor = '#6c757d'; // 灰色
    button.style.cursor = 'not-allowed';
    button.style.opacity = '0.6';
    
    // 阻止点击事件
    button.onclick = (e) => {
      e.preventDefault();
      return false;
    };
  } else {
    button.style.backgroundColor = '#3173dc'; // 原来的蓝色
    button.style.cursor = 'pointer';
    button.style.opacity = '1';
    
    // 恢复正常点击行为
    button.onclick = (e) => {
      e.preventDefault();
      window.location.href = button.href;
    };
  }
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
 * 显示检查状态的播放器按钮
 */
export function showPlayerButtonsChecking() {
  createOrUpdateButton(IINA_BUTTON_ID, 'IINA', 'icon-play', '#', '140px', true);
  createOrUpdateButton(POTPLAYER_BUTTON_ID, 'PotPlayer', 'icon-play', '#', '180px', true);
}

/**
 * 显示404状态的播放器按钮
 */
export function showPlayerButtons404() {
  createOrUpdateButton(IINA_BUTTON_ID, 'IINA', 'icon-play', '#', '140px', true);
  createOrUpdateButton(POTPLAYER_BUTTON_ID, 'PotPlayer', 'icon-play', '#', '180px', true);
}

/**
 * 添加或更新播放器按钮。
 * @param playlistUrl - 直接的播放链接。
 */
export function addOrUpdatePlayerButtons(playlistUrl: string) {
  // IINA 按钮
  const iinaUrl = `iina://weblink?url=${playlistUrl}`;
  createOrUpdateButton(IINA_BUTTON_ID, 'IINA', 'icon-play', iinaUrl, '140px', false);

  // PotPlayer 按钮
  const potplayerUrl = `potplayer://${playlistUrl}`;
  createOrUpdateButton(POTPLAYER_BUTTON_ID, 'PotPlayer', 'icon-play', potplayerUrl, '180px', false);
}

/**
 * 隐藏所有的播放器按钮。
 */
export function hidePlayerButtons() {
  hideButton(IINA_BUTTON_ID);
  hideButton(POTPLAYER_BUTTON_ID);
}