import './style.css'

// same storage key as popup
const STORAGE_KEY = 'feature_enabled';

export default defineContentScript({
  matches: ['*://*.javdb.com/v/*'],
  async main() {
    // check if the feature is enabled
    const isEnabled = await storage.getItem(`sync:${STORAGE_KEY}`) ?? true;
    
    if (!isEnabled) {
      console.log('❌ [JavDB Helper] Feature is disabled.');
      hideFloatingButton();
      return;
    }
  
    console.log('🚀 [JavDB Helper] Feature is enabled, running script...');

    // core logic, now includes the control of button visibility
    const processPage = async () => {
      // check if the path is the one we care about
      if (window.location.pathname.startsWith('/v/')) {
        const videoNumber = getVideoNumber();
        if (videoNumber) {
          const missavUUID = await getMissavUUID(videoNumber);
          if (missavUUID) {
            // if the UUID is successfully fetched, create or update the button
            addOrUpdateFloatingButton(missavUUID);
          } else {
            // if the UUID is not fetched, hide the button
            hideFloatingButton();
          }
        }
      } else {
        // if not in the video detail page, hide the button
        hideFloatingButton();
      }
    };

    // listen for URL path change
    let lastPathname = window.location.pathname;
    new MutationObserver(() => {
      const currentPathname = window.location.pathname;
      if (currentPathname !== lastPathname) {
        lastPathname = currentPathname;
        processPage();
      }
    }).observe(document.body, { childList: true, subtree: true });

    // execute once when page is loaded
    processPage();
  }
});

// get target video number
function getVideoNumber(): string {
    // get target video number
    const targetElement = document.querySelector('a.button.is-white.copy-to-clipboard')
    if (!targetElement) {
      console.log('not found target element')
      return ''
    }

    const targetNumber = targetElement.getAttribute('data-clipboard-text')
    if (!targetNumber) {
      console.log('no target number')
      return ''
    }

    console.log('targetNumber', targetNumber)
    return targetNumber
}

// get missav UUID
async function getMissavUUID(videoNumber: string): Promise<string> {
  const lowerTargetNumber = videoNumber.toLowerCase()
  const targetUrl = `https://missav.ws/dm1/en/${lowerTargetNumber}`

  try {
      // 'response' here is the object { success: boolean, html?: string, error?: string }
      // sent from your background script. It is NOT a Fetch API Response object.
      const response = await chrome.runtime.sendMessage({
          type: 'fetchMissav',
          url: targetUrl
      })

      if (!response.success) {
          throw new Error(response.error)
      }
      
      // Directly use the 'html' property which is already a string.
      // DO NOT try to call response.text().
      const parser = new DOMParser()
      const doc = parser.parseFromString(response.html, 'text/html')
      
      const scripts = doc.getElementsByTagName('script')
      // console.log('scripts', scripts)

      for (const script of scripts) {
          const content = script.textContent || ''
          if (content.includes('thumbnail')) {
              const urlsMatch = content.match(/urls:\s*\[(.*?)\]/s)
              if (urlsMatch) {
                  const firstUrl = urlsMatch[1].split(',')[0].trim().replace(/"/g, '').replace(/\\/g, '')
                  const uuidMatch = firstUrl.match(/\/([0-9a-f-]+)\/seek\//i)
                  if (uuidMatch) {
                    console.log('uuidMatch', uuidMatch[1])
                    return uuidMatch[1]
                  }
              }
          }
      }
      console.warn('uuid not found')
      return ''
  } catch (error) {
      // This is where your error was being caught.
      console.error('fetch or parse document error:', error)
      return ''
  }
}

/**
 * create a new floating button, or update the existing button's link
 * @param missavUUID - the UUID used to generate the playback link
 */
function addOrUpdateFloatingButton(missavUUID: string) {
  const BUTTON_ID = 'wxt-iina-floating-button';
  const iinaUrl = `iina://weblink?url=https://surrit.com/${missavUUID}/playlist.m3u8`;
  console.log('Playlist URL:', iinaUrl);

  // check if the button already exists
  let iinaButton = document.getElementById(BUTTON_ID) as HTMLAnchorElement | null;

  if (!iinaButton) {
    // if the button does not exist, create it
    iinaButton = document.createElement('a');
    iinaButton.id = BUTTON_ID;
    iinaButton.className = 'wxt-iina-button'; // use class name to apply style
    iinaButton.innerHTML = `
      <i class="icon-play"></i>
      <span>IINA</span>
    `;
    
    // add the button to the body
    document.body.appendChild(iinaButton);
    
    // click event (since we use the a tag's href directly, we can omit this, but it's better to add it to prevent default behavior)
    iinaButton.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = iinaButton!.href;
    });
  }

  // update the href property of the button and ensure it is visible
  iinaButton.href = iinaUrl;
  iinaButton.style.display = 'flex';
}

/**
 * hide the floating button
 */
function hideFloatingButton() {
  const BUTTON_ID = 'wxt-iina-floating-button';
  const iinaButton = document.getElementById(BUTTON_ID);
  if (iinaButton) {
    iinaButton.style.display = 'none';
  }
}