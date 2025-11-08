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

// ===== v1.1 FEATURES: Actionables & Settings =====

// Generate actionables based on mood score
function getActionables(moodScore) {
    const actionables = [];
    
    if (moodScore >= 80) {
        actionables.push({ icon: '🎉', text: 'You\'re doing great! Keep spreading positivity' });
        actionables.push({ icon: '✨', text: 'Share something that made you smile today' });
    } else if (moodScore >= 65) {
        actionables.push({ icon: '💪', text: 'Stay strong! Take a gratitude break' });
        actionables.push({ icon: '📖', text: 'Read something inspiring or uplifting' });
    } else if (moodScore >= 50) {
        actionables.push({ icon: '🧘', text: 'Try a 2-minute breathing exercise' });
        actionables.push({ icon: '🎵', text: 'Listen to your favorite upbeat music' });
        actionables.push({ icon: '🚶', text: 'Take a short walk or stretch' });
    } else if (moodScore >= 35) {
        actionables.push({ icon: '😂', text: 'Watch something funny on YouTube' });
        actionables.push({ icon: '☕', text: 'Make yourself a warm drink and relax' });
        actionables.push({ icon: '📞', text: 'Call a friend or family member' });
    } else {
        actionables.push({ icon: '🤝', text: 'Please reach out - call a friend or family' });
        actionables.push({ icon: '🌈', text: 'TeleMANAS (India): 14416 or 1800-891-4416' });
        actionables.push({ icon: '❤️', text: '988 (USA): Free 24/7 support available' });
        actionables.push({ icon: '💚', text: 'You matter. Help is available anytime.' });
    }
    
    return actionables;
}

// Display actionables
function displayActionables(moodScore) {
    const actionablesList = document.getElementById('actionablesList');
    const actionablesSection = document.getElementById('actionables');
    
    if (!actionablesList || !actionablesSection) return;
    
    const actionables = getActionables(moodScore);
    
    // Clear existing actionables
    actionablesList.innerHTML = '';
    
    // Highlight if mood is concerning
    if (moodScore < 50) {
        actionablesSection.classList.add('highlighted');
    } else {
        actionablesSection.classList.remove('highlighted');
    }
    
    // Add actionable items
    actionables.forEach(item => {
        const div = document.createElement('div');
        div.className = 'actionable-item';
        div.innerHTML = `
            <span class="actionable-icon">${item.icon}</span>
            <span>${item.text}</span>
        `;
        actionablesList.appendChild(div);
    });
}

// Load and apply refresh interval setting
async function loadSettings() {
    const result = await chrome.storage.local.get('refreshInterval');
    const interval = result.refreshInterval || 30;
    
    const select = document.getElementById('refreshInterval');
    if (select) {
        select.value = interval.toString();
    }
}

// Save refresh interval setting
async function saveRefreshInterval(minutes) {
    await chrome.storage.local.set({ refreshInterval: parseInt(minutes) });
    console.log(`Mood Mirror: Refresh interval updated to ${minutes} minutes`);
}

// Initialize v1.1 features
document.addEventListener('DOMContentLoaded', async () => {
    // Load settings
    await loadSettings();
    
    // Setup interval selector
    const intervalSelect = document.getElementById('refreshInterval');
    if (intervalSelect) {
        intervalSelect.addEventListener('change', (e) => {
            saveRefreshInterval(e.target.value);
        });
    }
    
    // Display actionables based on current mood
    const result = await chrome.storage.local.get('moodScore');
    const moodScore = result.moodScore || 50;
    displayActionables(moodScore);
    
    // Update actionables when mood changes
    setInterval(async () => {
        const result = await chrome.storage.local.get('moodScore');
        const moodScore = result.moodScore || 50;
        displayActionables(moodScore);
    }, 5000); // Check every 5 seconds
});

// ===== END v1.1 FEATURES =====
