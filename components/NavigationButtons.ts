import './NavigationButtons.css';

/**
 * 创建或更新一个浮动导航按钮。
 * 此按钮在新标签页中打开链接。
 */
function createOrUpdateNavButton(id: string, name: string, iconClass: string, url: string, topPosition: string, isDisabled: boolean = false) {
    let button = document.getElementById(id) as HTMLAnchorElement | null;

    if (!button) {
        button = document.createElement('a');
        button.id = id;
        button.className = 'wxt-nav-button';
        
        // 关键：设置在新标签页打开
        button.target = '_blank';
        // 安全性最佳实践
        button.rel = 'noopener noreferrer';

        document.body.appendChild(button);
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
        button.style.backgroundColor = '#28a745'; // 原来的绿色
        button.style.cursor = 'pointer';
        button.style.opacity = '1';
        button.onclick = null; // 移除点击阻止
    }
}

function hideButton(id: string) {
    const button = document.getElementById(id);
    if (button) {
        button.style.display = 'none';
    }
}

const NAV_BUTTON_ID = 'wxt-nav-button';

/**
 * 显示检查状态的导航按钮
 * @param videoSource - 视频源 ('missav' 或 'jable')
 */
export function showNavigationButtonChecking(videoSource: string = 'missav') {
    const name = videoSource === 'jable' ? 'Jable' : 'MissAV';
    createOrUpdateNavButton(NAV_BUTTON_ID, `${name} Checking...`, 'icon-play', '#', '100px', true);
}

/**
 * 显示404状态的导航按钮
 * @param videoSource - 视频源 ('missav' 或 'jable')
 */
export function showNavigationButton404(videoSource: string = 'missav') {
    const name = videoSource === 'jable' ? 'Jable' : 'MissAV';
    createOrUpdateNavButton(NAV_BUTTON_ID, `${name} 404`, 'icon-play', '#', '100px', true);
}

/**
 * 添加或更新导航按钮。
 * @param videoNumber - 视频番号 (例如, 'IPX-811')。
 * @param videoSource - 视频源 ('missav' 或 'jable')。
 */
export function addOrUpdateNavigationButtons(videoNumber: string, videoSource: string = 'missav') {
    let url: string;
    let name: string;
    
    if (videoSource === 'jable') {
        url = `https://jable.tv/videos/${videoNumber.toLowerCase()}/`;
        name = 'Jable';
    } else {
        // default to missav
        url = `https://missav.ws/${videoNumber.toLowerCase()}`;
        name = 'MissAV';
    }
    
    createOrUpdateNavButton(NAV_BUTTON_ID, name, 'icon-play', url, '100px', false);
}

/**
 * 隐藏所有的导航按钮。
 */
export function hideNavigationButtons() {
    hideButton(NAV_BUTTON_ID);
}