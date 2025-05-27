import './style.css';

const featureToggle = document.querySelector<HTMLInputElement>('#feature-toggle');

// storage key, define as constant, for easy use in multiple places
const STORAGE_KEY = 'feature_enabled';

// 1. when popup is opened, load and set the initial state of the switch
// WXT provided storage API is a wrapper of chrome.storage, usage is basically the same
storage.getItem(`sync:${STORAGE_KEY}`).then((result) => {
  // if there is no value in the storage, we default to true
  // '??' is the nullish coalescing operator
  const isEnabled = (result as boolean | null) ?? true;
  if (featureToggle) {
    featureToggle.checked = isEnabled;
  }
});

// 2. listen for the change of the switch state, and save the new setting
featureToggle?.addEventListener('change', () => {
  const isEnabled = featureToggle.checked;
  storage.setItem(`sync:${STORAGE_KEY}`, isEnabled);
});