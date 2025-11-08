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

// Start reset scheduler
scheduleReset();
