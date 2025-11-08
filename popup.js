// Initialize popup with stored data
document.addEventListener('DOMContentLoaded', async () => {
    await updateDisplay();
    
    // Update display every 5 seconds if tab is active
    setInterval(updateDisplay, 5000);
    
    // Button event listeners
    document.getElementById('viewReport').addEventListener('click', viewDailyReport);
    document.getElementById('resetData').addEventListener('click', resetTodayData);
});

async function updateDisplay() {
    const result = await chrome.storage.local.get([
        'moodScore',
        'sessionsToday',
        'pagesAnalyzed',
        'lastAnalysis'
    ]);
    
    const moodScore = result.moodScore || 50;
    const sessionsToday = result.sessionsToday || 0;
    const pagesAnalyzed = result.pagesAnalyzed || 0;
    
    // Update mood score display
    document.getElementById('moodValue').textContent = moodScore;
    document.getElementById('moodBar').style.width = `${moodScore}%`;
    
    // Update mood label
    const moodLabel = getMoodLabel(moodScore);
    document.getElementById('moodLabel').textContent = moodLabel;
    
    // Update stats
    document.getElementById('sessionsToday').textContent = sessionsToday;
    document.getElementById('pagesAnalyzed').textContent = pagesAnalyzed;
    
    // Update insights
    updateInsights(moodScore, result.lastAnalysis);
}

function getMoodLabel(score) {
    if (score >= 70) return 'Positive';
    if (score >= 55) return 'Good';
    if (score >= 45) return 'Neutral';
    if (score >= 30) return 'Low';
    return 'Concerning';
}

function updateInsights(moodScore, lastAnalysis) {
    const insightsDiv = document.getElementById('insights');
    
    if (!lastAnalysis) {
        insightsDiv.innerHTML = '<p>Start browsing to track your mood...</p>';
        return;
    }
    
    let message = '';
    
    if (moodScore >= 70) {
        message = '🌟 You\'re browsing positive content! Keep it up.';
    } else if (moodScore >= 55) {
        message = '😊 Your mood looks good. Balanced content consumption.';
    } else if (moodScore >= 45) {
        message = '😐 Neutral mood detected. Consider some uplifting content.';
    } else if (moodScore >= 30) {
        message = '😔 Your mood seems low. Maybe take a break or watch something cheerful?';
    } else {
        message = '⚠️ Mood is concerning. Please take a break and consider talking to someone.';
    }
    
    insightsDiv.innerHTML = `<p>${message}</p>`;
}

function viewDailyReport() {
    chrome.storage.local.get([
        'moodScore',
        'sessionsToday',
        'pagesAnalyzed',
        'moodHistory'
    ], (result) => {
        const report = generateReport(result);
        alert(report);
    });
}

function generateReport(data) {
    const moodScore = data.moodScore || 50;
    const sessions = data.sessionsToday || 0;
    const pages = data.pagesAnalyzed || 0;
    
    let report = '📊 DAILY MOOD REPORT\n\n';
    report += `Current Mood Score: ${moodScore}/100\n`;
    report += `Sessions Today: ${sessions}\n`;
    report += `Pages Analyzed: ${pages}\n\n`;
    
    if (moodScore >= 70) {
        report += '✅ Your browsing patterns suggest a positive mental state!\n';
        report += 'Keep engaging with content that makes you happy.';
    } else if (moodScore >= 50) {
        report += '✅ You\'re doing well! Balanced content consumption.\n';
        report += 'Continue maintaining this healthy browsing pattern.';
    } else if (moodScore >= 30) {
        report += '⚠️ Your mood seems lower than usual.\n';
        report += 'Consider: Taking breaks, watching uplifting content, or talking to someone.';
    } else {
        report += '🚨 Your browsing suggests you might be struggling.\n';
        report += 'Please consider reaching out to a friend, family member, or mental health professional.';
    }
    
    return report;
}

function resetTodayData() {
    if (confirm('Reset today\'s mood data? This cannot be undone.')) {
        chrome.storage.local.set({
            moodScore: 50,
            sessionsToday: 0,
            pagesAnalyzed: 0,
            lastAnalysis: null
        }, () => {
            updateDisplay();
            alert('Today\'s data has been reset.');
        });
    }
}
