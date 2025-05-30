import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    name: 'Jav Play',
    description: 'Play video directly in JAVDB',
    permissions: [
      'storage',
      'scripting'
    ],
    // Explicitly grant permission for the background script to access this host.
    host_permissions: [
        '*://*.javdb.com/*',
        '*://*.javlibrary.com/*',
        '*://*.missav.ws/*',
        '*://*.jable.tv/*'
    ],
  },
});