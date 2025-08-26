console.log('Tomato Timer background script loaded');

// 监听扩展安装
chrome.runtime.onInstalled.addListener(() => {
  console.log('Tomato Timer installed');
  
  // 初始化存储数据
  chrome.storage.local.set({
    completedSessions: 0,
    totalFocusTime: 0,
    lastSessionDate: new Date().toDateString()
  });

  // 请求通知权限
  requestNotificationPermission();
});

// 请求通知权限
async function requestNotificationPermission() {
  try {
    const permission = await chrome.notifications.getPermissionLevel();
    console.log('Current notification permission:', permission);
    
    if (permission === 'denied') {
      console.warn('Notifications are denied. Please enable them in Chrome settings.');
    }
  } catch (error) {
    console.error('Error checking notification permission:', error);
  }
}

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Received message:', message);
  
  switch (message.type) {
    case 'START_TIMER':
      startTimer(message.duration, message.phase);
      sendResponse({ success: true });
      break;
      
    case 'STOP_TIMER':
      stopTimer();
      sendResponse({ success: true });
      break;
      
    case 'SESSION_COMPLETED':
      handleSessionCompleted(message.phase);
      sendResponse({ success: true });
      break;
      
    case 'GET_STATS':
      getStats().then(stats => sendResponse(stats));
      return true; // 保持消息通道开放
      
    default:
      sendResponse({ error: 'Unknown message type' });
  }
});

// 启动计时器
function startTimer(duration, phase) {
  const alarmName = `timer_${phase}_${Date.now()}`;
  
  // 清除现有的闹钟
  chrome.alarms.clearAll();
  
  // 创建新的闹钟 - 注意：duration是秒，但alarms需要分钟
  const delayInMinutes = duration / 60;
  chrome.alarms.create(alarmName, {
    delayInMinutes: delayInMinutes
  });
  
  console.log(`Timer started: ${phase} for ${duration} seconds (${delayInMinutes} minutes), alarm: ${alarmName}`);
  
  // 立即验证闹钟是否创建成功
  chrome.alarms.get(alarmName, (alarm) => {
    if (alarm) {
      console.log('Alarm created successfully:', alarm);
    } else {
      console.error('Failed to create alarm!');
    }
  });
}

// 停止计时器
function stopTimer() {
  chrome.alarms.clearAll();
  console.log('All timers stopped');
}

// 处理会话完成
async function handleSessionCompleted(phase) {
  // 显示通知
  showNotification(phase);
  
  // 更新统计数据
  if (phase === 'work') {
    await updateStats();
  }
  
  // 播放提示音（如果可能的话）
  playNotificationSound();
}

// 显示通知
async function showNotification(phase) {
  const isWorkSession = phase === 'work';
  const title = isWorkSession ? '🎉 Work Session Completed!' : '✨ Break Time Over!';
  const message = isWorkSession 
    ? 'Great job! Time for a well-deserved break.' 
    : 'Break time is over. Ready to get back to work?';

  try {
    // 首先检查权限
    const permission = await chrome.notifications.getPermissionLevel();
    console.log('Notification permission level:', permission);

    if (permission === 'denied') {
      console.warn('Notifications are denied');
      return;
    }

    const notificationId = `timer_${phase}_${Date.now()}`;
    
    chrome.notifications.create(notificationId, {
      type: 'basic',
      iconUrl: '/icons/icon48.png', // 使用绝对路径
      title: title,
      message: message,
      priority: 2,
      requireInteraction: true // 让通知保持显示直到用户点击
    }, (notificationId) => {
      if (chrome.runtime.lastError) {
        console.error('Notification creation error:', chrome.runtime.lastError);
        // 如果图标路径有问题，尝试不使用图标
        chrome.notifications.create({
          type: 'basic',
          title: title,
          message: message,
          priority: 2
        });
      } else {
        console.log('Notification created successfully:', notificationId);
      }
    });
  } catch (error) {
    console.error('Error showing notification:', error);
  }
}

// 播放提示音
function playNotificationSound() {
  // 尝试播放系统提示音
  try {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.executeScript(tabs[0].id, {
          code: `
            try {
              const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYeBjiS0/LNeSsFJHTG8N6QQAoUXrTp66hVFApGn+DyvmYeBjiS0/LNeSsFJHTG8N6QQAoUXrTp66hVFApGn+DyvmYeBjiS0/LNeSsFJHTG8N6QQAoUXrTp66hVFApGn+DyvmYeBjiS0/LNeSsFJHTG8N6QQAoUXrTp66hVFApGn+DyvmYe');
              audio.play().catch(() => {});
            } catch(e) {}
          `
        });
      }
    });
  } catch (error) {
    console.log('Could not play notification sound:', error);
  }
}

// 更新统计数据
async function updateStats() {
  const today = new Date().toDateString();
  
  try {
    const result = await chrome.storage.local.get(['completedSessions', 'totalFocusTime', 'lastSessionDate']);
    
    let completedSessions = result.completedSessions || 0;
    let totalFocusTime = result.totalFocusTime || 0;
    
    // 如果是新的一天，重置计数
    if (result.lastSessionDate !== today) {
      completedSessions = 0;
    }
    
    completedSessions++;
    totalFocusTime += 25; // 25分钟
    
    await chrome.storage.local.set({
      completedSessions: completedSessions,
      totalFocusTime: totalFocusTime,
      lastSessionDate: today
    });
    
    console.log(`Stats updated: ${completedSessions} sessions, ${totalFocusTime} minutes total`);
  } catch (error) {
    console.error('Error updating stats:', error);
  }
}

// 获取统计数据
async function getStats() {
  try {
    const result = await chrome.storage.local.get(['completedSessions', 'totalFocusTime', 'lastSessionDate']);
    const today = new Date().toDateString();
    
    // 如果是新的一天，返回0
    const completedSessions = result.lastSessionDate === today ? (result.completedSessions || 0) : 0;
    
    return {
      completedSessions: completedSessions,
      totalFocusTime: result.totalFocusTime || 0
    };
  } catch (error) {
    console.error('Error getting stats:', error);
    return { completedSessions: 0, totalFocusTime: 0 };
  }
}

// 监听闹钟
chrome.alarms.onAlarm.addListener(async (alarm) => {
  console.log('🔔 Alarm triggered:', alarm.name, 'at', new Date().toLocaleTimeString());
  
  if (alarm.name.includes('timer_')) {
    const phase = alarm.name.split('_')[1];
    console.log('Processing timer completion for phase:', phase);
    
    // 处理会话完成
    await handleSessionCompleted(phase);
    
    // 通知popup计时器完成
    try {
      chrome.runtime.sendMessage({
        type: 'TIMER_COMPLETED',
        phase: phase
      });
    } catch (error) {
      // popup可能已关闭，这是正常的
      console.log('Popup not available to receive timer completion message');
    }
  }
});

// 为了调试，监听所有的闹钟
chrome.alarms.onAlarm.addListener((alarm) => {
  console.log('All alarms debug - Alarm name:', alarm.name, 'Scheduled time:', new Date(alarm.scheduledTime));
});

// 监听通知点击
chrome.notifications.onClicked.addListener((notificationId) => {
  // 关闭通知
  chrome.notifications.clear(notificationId);
  
  // 尝试打开popup（如果可能）
  try {
    chrome.action.openPopup();
  } catch (error) {
    console.log('Could not open popup:', error);
  }
});