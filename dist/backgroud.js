console.log('Tomato Clock background script loaded');

// 监听扩展安装
chrome.runtime.onInstalled.addListener(() => {
  console.log('Tomato Clock installed');
});