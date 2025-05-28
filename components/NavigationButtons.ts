import './NavigationButtons.css';

/**
 * 创建或更新一个浮动导航按钮。
 * 此按钮在新标签页中打开链接。
 */
function createOrUpdateNavButton(id: string, name: string, iconClass: string, url: string, topPosition: string) {
    let button = document.getElementById(id) as HTMLAnchorElement | null;

    if (!button) {
        button = document.createElement('a');
        button.id = id;
        button.className = 'wxt-nav-button';
        button.innerHTML = `
          <i class="${iconClass}"></i>
          <span>${name}</span>
        `;
        
        // 关键：设置在新标签页打开
        button.target = '_blank';
        // 安全性最佳实践
        button.rel = 'noopener noreferrer';

        document.body.appendChild(button);
    }

    button.href = url;
    button.style.top = topPosition;
    button.style.display = 'flex';
}

function hideButton(id: string) {
    const button = document.getElementById(id);
    if (button) {
        button.style.display = 'none';
    }
}

const MISSAV_BUTTON_ID = 'wxt-missav-nav-button';

/**
 * 添加或更新 MissAV 导航按钮。
 * @param videoNumber - 视频番号 (例如, 'IPX-811')。
 */
export function addOrUpdateNavigationButtons(videoNumber: string) {
    const missavUrl = `https://missav.ws/${videoNumber.toLowerCase()}`;
    createOrUpdateNavButton(MISSAV_BUTTON_ID, 'MissAV', 'icon-play', missavUrl, '200px');
}

/**
 * 隐藏所有的导航按钮。
 */
export function hideNavigationButtons() {
    hideButton(MISSAV_BUTTON_ID);
}