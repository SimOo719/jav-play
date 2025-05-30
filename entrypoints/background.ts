interface FetchVideoRequest {
  type: 'fetchVideo'
  url: string
}

interface CheckUrlRequest {
  type: 'checkUrl'
  url: string
}

type BackgroundRequest = FetchVideoRequest | CheckUrlRequest;

export default defineBackground({
  main() {
    chrome.runtime.onMessage.addListener((
      request: BackgroundRequest,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response: any) => void
    ) => {
      if (request.type === 'fetchVideo') {
        console.log('fetchVideo', request.url)
        fetch(request.url, {
          redirect: 'follow',
          // Add headers to mimic a browser request
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        })
          .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`)
            }
            return response.text()
          })
          .then(html => {
            sendResponse({ success: true, html })
          })
          .catch(error => {
            sendResponse({ success: false, error: error.message })
          })
        return true // Keep the message channel open for the async response
      }
      
      if (request.type === 'checkUrl') {
        console.log('checkUrl', request.url)
        fetch(request.url, {
          method: 'HEAD', // 只检查头部，不下载完整内容
          redirect: 'follow',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        })
          .then(response => {
            console.log('checkUrl response', response.status)
            sendResponse({ 
              success: true, 
              exists: response.ok,
              status: response.status 
            })
          })
          .catch(error => {
            console.log('checkUrl error', error)
            sendResponse({ 
              success: true, 
              exists: false,
              status: 0,
              error: error.message 
            })
          })
        return true // Keep the message channel open for the async response
      }
    })
  }
})