// Background service worker for Mood Mirror
chrome.runtime.onInstalled.addListener(() => {
    console.log('Mood Mirror installed');
    
    // Initialize storage
    chrome.storage.local.set({
        moodScore: 50,
        sessionsToday: 0,
        pagesAnalyzed: 0,
        lastAnalysis: null,
        installDate: Date.now()
    });
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'MOOD_ANALYSIS') {
        handleMoodAnalysis(request.data, sender).then(() => {
            sendResponse({ status: 'success' });
        }).catch((error) => {
            console.error('Error handling mood analysis:', error);
            sendResponse({ status: 'error', error: error.message });
        });
        return true; // Keep channel open for async response
    }
});

async function handleMoodAnalysis(data, sender) {
    try {
        // Get current stored data
        const result = await chrome.storage.local.get([
            'moodScore',
            'sessionsToday',
            'pagesAnalyzed',
            'moodHistory',
            'lastAnalysis'
        ]);
        
        const currentMoodScore = result.moodScore || 50;
        const sessionsToday = result.sessionsToday || 0;
        const pagesAnalyzed = result.pagesAnalyzed || 0;
        const moodHistory = result.moodHistory || [];
        
        // Calculate new mood score (weighted average)
        // Give more weight to recent analysis
        const weight = 0.3; // 30% new, 70% historical
        const newMoodScore = Math.round((data.score * weight) + (currentMoodScore * (1 - weight)));
        
        // Update history
        moodHistory.push({
            score: data.score,
            url: data.url,
            timestamp: data.timestamp
        });
        
        // Keep only last 50 entries
        if (moodHistory.length > 50) {
            moodHistory.shift();
        }
        
        // Increment counters
        const newSessionCount = sessionsToday + 1;
        const newPagesCount = pagesAnalyzed + 1;
        
        // Save updated data
        await chrome.storage.local.set({
            moodScore: newMoodScore,
            sessionsToday: newSessionCount,
            pagesAnalyzed: newPagesCount,
            moodHistory: moodHistory,
            lastAnalysis: {
                score: data.score,
                url: data.url,
                timestamp: data.timestamp
            }
        });
        
        // Update badge with mood indicator
        updateBadge(newMoodScore);
        
        console.log(`Mood Mirror: Updated score to ${newMoodScore}`);
        
    } catch (error) {
        console.error('Error in handleMoodAnalysis:', error);
        throw error;
    }
}

function updateBadge(score) {
    let color;
    let text;
    
    if (score >= 70) {
        color = '#10b981'; // Green
        text = '😊';
    } else if (score >= 55) {
        color = '#3b82f6'; // Blue
        text = '🙂';
    } else if (score >= 45) {
        color = '#6b7280'; // Gray
        text = '😐';
    } else if (score >= 30) {
        color = '#f59e0b'; // Orange
        text = '😔';
    } else {
        color = '#ef4444'; // Red
        text = '😢';
    }
    
    chrome.action.setBadgeText({ text: text });
    chrome.action.setBadgeBackgroundColor({ color: color });
}

// Reset daily stats at midnight
function scheduleReset() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeUntilMidnight = tomorrow - now;
    
    setTimeout(() => {
        chrome.storage.local.set({
            sessionsToday: 0,
            pagesAnalyzed: 0,
            moodScore: 50
        });
        
        console.log('Mood Mirror: Daily stats reset');
        
        // Schedule next reset
        scheduleReset();
    }, timeUntilMidnight);
}


// ===== v1.1 FEATURES: Auto-refresh & Notifications =====

// Get user's refresh interval preference (default 30 minutes)
async function getRefreshInterval() {
  const result = await chrome.storage.local.get('refreshInterval');
  return result.refreshInterval || 30; // Default 30 minutes
}

// Setup alarm for auto mood check
async function setupAutoRefresh() {
  const interval = await getRefreshInterval();
  
  // Clear any existing alarm
  chrome.alarms.clear('moodCheck');
  
  // Create new alarm
  chrome.alarms.create('moodCheck', {
    periodInMinutes: interval
  });
  
  console.log(`Mood Mirror: Auto-refresh set to ${interval} minutes`);
}

// Listen for alarm triggers
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'moodCheck') {
    performScheduledMoodCheck();
  }
});

// Perform scheduled mood check
async function performScheduledMoodCheck() {
  try {
    // Get current active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab) return;
    
    // Send message to content script to analyze current page
    chrome.tabs.sendMessage(tab.id, { type: 'ANALYZE_NOW' }, (response) => {
      if (chrome.runtime.lastError) {
        console.log('No content script on this page');
        return;
      }
      
      if (response && response.score !== undefined) {
        checkAndNotify(response.score);
      }
    });
  } catch (error) {
    console.error('Error in scheduled mood check:', error);
  }
}

// Check mood and send notification if concerning
async function checkAndNotify(moodScore) {
  const result = await chrome.storage.local.get(['lastNotificationScore', 'moodScore']);
  const previousScore = result.lastNotificationScore || 50;
  const currentScore = result.moodScore || 50;
  
  // Notify if mood drops below 50 or significant drop detected
  if (moodScore < 50 && previousScore >= 50) {
    sendMoodNotification('low', moodScore);
    await chrome.storage.local.set({ lastNotificationScore: moodScore });
  } else if (moodScore < 35 && previousScore >= 35) {
    sendMoodNotification('concerning', moodScore);
    await chrome.storage.local.set({ lastNotificationScore: moodScore });
  } else if (previousScore - moodScore >= 15) {
    sendMoodNotification('drop', moodScore);
    await chrome.storage.local.set({ lastNotificationScore: moodScore });
  }
}

// Send mood notification
function sendMoodNotification(type, score) {
  let title, message, iconUrl;
  
  if (type === 'concerning') {
    title = '😢 Mood Alert';
    message = `Your mood score is ${score}. Consider taking a break or reaching out to someone.`;
    iconUrl = 'icons/icon48.png';
  } else if (type === 'low') {
    title = '😔 Mood Check-in';
    message = `Your mood has dropped to ${score}. Time for some self-care?`;
    iconUrl = 'icons/icon48.png';
  } else if (type === 'drop') {
    title = '🔔 Mood Change Detected';
    message = `Significant mood change detected. Current score: ${score}`;
    iconUrl = 'icons/icon48.png';
  }
  
  chrome.notifications.create({
    type: 'basic',
    iconUrl: iconUrl,
    title: title,
    message: message,
    priority: 2
  });
}

// Listen for interval changes from settings
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.refreshInterval) {
    setupAutoRefresh();
  }
});

// Initialize auto-refresh on install/startup
chrome.runtime.onStartup.addListener(() => {
  setupAutoRefresh();
});

setupAutoRefresh();

// ===== END v1.1 FEATURES =====

// Start reset scheduler
scheduleReset();
