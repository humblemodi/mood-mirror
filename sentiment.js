// Advanced sentiment analysis with multiple parameters
const SentimentAnalyzer = {
    // Word lists with weights
    positiveWords: [
        'happy', 'joy', 'love', 'excellent', 'amazing', 'wonderful', 'fantastic', 'great', 'awesome',
        'beautiful', 'perfect', 'best', 'good', 'nice', 'fun', 'exciting', 'smile', 'laugh', 'celebrate',
        'success', 'win', 'victory', 'achievement', 'hope', 'inspire', 'motivate', 'positive', 'blessed',
        'grateful', 'thanks', 'appreciate', 'kind', 'helpful', 'caring', 'friendly', 'lol', 'haha',
        'funny', 'hilarious', 'adorable', 'cute', 'sweet', 'delightful', 'pleasant', 'enjoy', 'entertaining',
        '😊', '😄', '😃', '❤️', '👍', '🎉', '✨', '🌟', '😍', '🥰', '😂', '🤣', '👏', '🙌', '💪'
    ],
    
    negativeWords: [
        'sad', 'depressed', 'anxiety', 'fear', 'hate', 'angry', 'terrible', 'awful', 'horrible', 'bad',
        'worst', 'fail', 'failure', 'loss', 'death', 'died', 'kill', 'murder', 'suicide', 'hopeless',
        'lonely', 'alone', 'scared', 'worry', 'stress', 'pain', 'hurt', 'cry', 'tears', 'miserable',
        'disaster', 'tragedy', 'crisis', 'problem', 'issue', 'difficult', 'struggle', 'suffer', 'victim',
        'violence', 'war', 'attack', 'abuse', 'toxic', 'negative', 'depressing', 'devastating', 'heartbreak',
        '😢', '😭', '😔', '😞', '😩', '😫', '😖', '😣', '💔', '😡', '😠', '😤', '🤬', '😰', '😱'
    ],
    
    neutralWords: [
        'is', 'are', 'was', 'were', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
        'could', 'should', 'may', 'might', 'must', 'can', 'the', 'a', 'an', 'and', 'or', 'but'
    ],

    analyze(text) {
        if (!text || text.length < 10) {
            return { score: 50, confidence: 0 };
        }

        const lowerText = text.toLowerCase();
        const words = lowerText.split(/\s+/);
        
        // Multi-parameter analysis
        const wordCount = words.length;
        let positiveCount = 0;
        let negativeCount = 0;
        let neutralCount = 0;
        let capsCount = 0;
        let exclamationCount = 0;
        let questionCount = 0;
        
        // Count sentiment words
        words.forEach(word => {
            if (this.positiveWords.includes(word)) positiveCount++;
            if (this.negativeWords.includes(word)) negativeCount++;
            if (this.neutralWords.includes(word)) neutralCount++;
        });
        
        // Analyze emojis separately
        const emojiMatches = text.match(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu) || [];
        emojiMatches.forEach(emoji => {
            if (this.positiveWords.includes(emoji)) positiveCount += 2; // Emojis have higher weight
            if (this.negativeWords.includes(emoji)) negativeCount += 2;
        });
        
        // Analyze text patterns
        capsCount = (text.match(/[A-Z]/g) || []).length;
        exclamationCount = (text.match(/!/g) || []).length;
        questionCount = (text.match(/\?/g) || []).length;
        
        // Calculate intensity factors
        const capsRatio = capsCount / text.length;
        const exclamationRatio = exclamationCount / wordCount;
        
        // Base score calculation
        const positiveRatio = positiveCount / wordCount;
        const negativeRatio = negativeCount / wordCount;
        
        let baseScore = 50;
        
        // Apply positive influence
        baseScore += (positiveRatio * 100);
        
        // Apply negative influence
        baseScore -= (negativeRatio * 100);
        
        // Intensity modifiers
        if (capsRatio > 0.3) {
            // High caps usage often indicates strong emotion
            if (positiveCount > negativeCount) {
                baseScore += 5; // Excited positive
            } else if (negativeCount > positiveCount) {
                baseScore -= 10; // Angry negative
            }
        }
        
        if (exclamationRatio > 0.2) {
            // Multiple exclamations
            if (positiveCount > negativeCount) {
                baseScore += 5;
            }
        }
        
        // Question marks might indicate uncertainty
        if (questionCount > 2) {
            baseScore -= 3;
        }
        
        // Normalize score to 0-100 range
        let finalScore = Math.max(0, Math.min(100, baseScore));
        
        // Calculate confidence based on text length and sentiment word density
        const sentimentDensity = (positiveCount + negativeCount) / wordCount;
        let confidence = Math.min(1, (wordCount / 50) * sentimentDensity);
        
        return {
            score: Math.round(finalScore),
            confidence: confidence,
            details: {
                positiveCount,
                negativeCount,
                wordCount,
                capsRatio,
                exclamationCount
            }
        };
    },

    analyzePage(pageText) {
        // Split into sections and analyze each
        const sections = pageText.split(/\n\n+/);
        const analyses = sections.map(section => this.analyze(section));
        
        // Weighted average based on confidence
        let totalWeight = 0;
        let weightedSum = 0;
        
        analyses.forEach(analysis => {
            const weight = analysis.confidence || 0.1;
            weightedSum += analysis.score * weight;
            totalWeight += weight;
        });
        
        const averageScore = totalWeight > 0 ? weightedSum / totalWeight : 50;
        
        return {
            score: Math.round(averageScore),
            sectionCount: analyses.length,
            averageConfidence: totalWeight / analyses.length
        };
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SentimentAnalyzer;
}
