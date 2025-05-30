import './style.css';

const featureToggle = document.querySelector<HTMLInputElement>('#feature-toggle');
const videoSourceSelect = document.querySelector<HTMLSelectElement>('#video-source');

// storage keys, define as constants, for easy use in multiple places
const STORAGE_KEY = 'feature_enabled';
const VIDEO_SOURCE_KEY = 'video_source';

// 1. when popup is opened, load and set the initial state of the switch and select
// WXT provided storage API is a wrapper of chrome.storage, usage is basically the same
storage.getItem(`sync:${STORAGE_KEY}`).then((result) => {
  // if there is no value in the storage, we default to true
  // '??' is the nullish coalescing operator
  const isEnabled = (result as boolean | null) ?? true;
  if (featureToggle) {
    featureToggle.checked = isEnabled;
  }
});

storage.getItem(`sync:${VIDEO_SOURCE_KEY}`).then((result) => {
  // default to missav if no value in storage
  const videoSource = (result as string | null) ?? 'missav';
  if (videoSourceSelect) {
    videoSourceSelect.value = videoSource;
  }
});

// 2. listen for the change of the switch state, and save the new setting
featureToggle?.addEventListener('change', () => {
  const isEnabled = featureToggle.checked;
  storage.setItem(`sync:${STORAGE_KEY}`, isEnabled);
});

// 3. listen for the change of the video source selection, and save the new setting
videoSourceSelect?.addEventListener('change', () => {
  const videoSource = videoSourceSelect.value;
  storage.setItem(`sync:${VIDEO_SOURCE_KEY}`, videoSource);
});