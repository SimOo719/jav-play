interface FetchMissavRequest {
  type: 'fetchMissav'
  url: string
}

export default defineBackground({
  main() {
    chrome.runtime.onMessage.addListener((
      request: FetchMissavRequest,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response: any) => void
    ) => {
      if (request.type === 'fetchMissav') {
        console.log('fetchMissav', request.url)
        fetch(request.url, {
          redirect: 'follow',
          // Add headers to mimic a browser request
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        })
          .then(response => {
            console.log('response', response)
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`)
            }
            return response.text()
          })
          .then(html => {
            console.log('html', html)
            sendResponse({ success: true, html })
          })
          .catch(error => {
            sendResponse({ success: false, error: error.message })
          })
        return true // Keep the message channel open for the async response
      }
    })
  }
})