// Content script that analyzes page content
(function() {
    'use strict';
    
    // Wait for page to load completely
    setTimeout(() => {
        analyzePage();
    }, 2000);
    
    function analyzePage() {
        try {
            // Extract text from page
            const pageText = extractPageText();
            
            if (!pageText || pageText.length < 50) {
                console.log('Mood Mirror: Not enough text to analyze');
                return;
            }
            
            // Analyze sentiment
            const analysis = SentimentAnalyzer.analyzePage(pageText);
            
            // Send results to background script
            chrome.runtime.sendMessage({
                type: 'MOOD_ANALYSIS',
                data: {
                    score: analysis.score,
                    url: window.location.href,
                    timestamp: Date.now(),
                    textLength: pageText.length
                }
            }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error('Mood Mirror Error:', chrome.runtime.lastError);
                } else {
                    console.log('Mood Mirror: Analysis sent', response);
                }
            });
            
        } catch (error) {
            console.error('Mood Mirror Analysis Error:', error);
        }
    }
    
    function extractPageText() {
        // Remove scripts, styles, and other non-content elements
        const clone = document.body.cloneNode(true);
        
        // Remove unwanted elements
        const unwanted = clone.querySelectorAll('script, style, noscript, iframe, svg, nav, footer, header');
        unwanted.forEach(el => el.remove());
        
        // Get text content
        let text = clone.textContent || clone.innerText || '';
        
        // Clean up text
        text = text.replace(/\s+/g, ' ').trim();
        
        return text;
    }
    
    // Listen for dynamic content changes (for SPAs)
    let lastAnalysisTime = Date.now();
    const observer = new MutationObserver(() => {
        const now = Date.now();
        // Only re-analyze if 10 seconds have passed
        if (now - lastAnalysisTime > 10000) {
            lastAnalysisTime = now;
            analyzePage();
        }
    });
    
    // Observe changes to body
    if (document.body) {
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

        // ===== v1.1: Listen for manual analysis requests from background =====
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.type === 'ANALYZE_NOW') {
            try {
                const pageText = extractPageText();
                
                if (!pageText || pageText.length < 50) {
                    sendResponse({ score: 50, error: 'Not enough text' });
                    return;
                }
                
                const analysis = SentimentAnalyzer.analyzePage(pageText);
                sendResponse({ score: analysis.score });
                
            } catch (error) {
                console.error('Mood Mirror: Manual analysis error:', error);
                sendResponse({ score: 50, error: error.message });
            }
        }
        return true; // Keep channel open for async response
    });
})();
