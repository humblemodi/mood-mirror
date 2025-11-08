/**
 * Mood Mirror Error Handler
 * Provides centralized error handling and user-friendly error messages
 * @version 1.1.1
 */

/**
 * Custom error class for Mood Mirror
 */
class MoodMirrorError extends Error {
  constructor(message, context = 'general', originalError = null) {
    super(message);
    this.name = 'MoodMirrorError';
    this.context = context;
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();
  }

  /**
   * Handle and log errors appropriately
   * @param {Error} error - The error to handle
   * @param {string} context - Context where error occurred
   */
  static handle(error, context = 'general') {
    const moodError = error instanceof MoodMirrorError 
      ? error 
      : new MoodMirrorError(error.message, context, error);

    // Log to console for debugging
    console.error('[Mood Mirror Error]', {
      context: moodError.context,
      message: moodError.message,
      timestamp: moodError.timestamp,
      originalError: moodError.originalError
    });

    // Store error in local storage for debugging (keep last 50 errors)
    this.logError(moodError);

    // Return user-friendly message
    return this.getUserFriendlyMessage(moodError);
  }

  /**
   * Store error in local storage for debugging
   * @param {MoodMirrorError} error - The error to log
   */
  static logError(error) {
    try {
      chrome.storage.local.get(['errorLog'], (result) => {
        const errorLog = result.errorLog || [];
        
        errorLog.push({
          context: error.context,
          message: error.message,
          timestamp: error.timestamp
        });

        // Keep only last 50 errors
        const trimmedLog = errorLog.slice(-50);
        
        chrome.storage.local.set({ errorLog: trimmedLog });
      });
    } catch (logError) {
      console.error('[Mood Mirror] Failed to log error:', logError);
    }
  }

  /**
   * Get user-friendly error message based on context
   * @param {MoodMirrorError} error - The error object
   * @returns {string} User-friendly error message
   */
  static getUserFriendlyMessage(error) {
    const contextMessages = {
      'mood-analysis': 'Unable to analyze mood data. Please try analyzing your mood again.',
      'storage': 'Unable to access mood history. Please check your browser storage permissions.',
      'network': 'Network error occurred. Please check your internet connection.',
      'data-retrieval': 'Unable to load mood data. Please refresh and try again.',
      'export': 'Unable to export mood report. Please try again.',
      'notification': 'Unable to send notification. Please check notification permissions.',
      'alarm': 'Unable to set reminder. Please check alarm permissions.',
      'general': 'Something went wrong. Please try again.'
    };

    return contextMessages[error.context] || contextMessages['general'];
  }

  /**
   * Show user-friendly error in UI
   * @param {string} elementId - ID of element to show error in
   * @param {string} message - Error message to display
   */
  static showUserFriendlyError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = `
        <div style="padding: 15px; background-color: #fff3cd; border-left: 4px solid #ffc107; color: #856404; border-radius: 4px; margin: 10px 0;">
          <strong>⚠️ Notice:</strong> ${message}
        </div>
      `;
    }
  }
}

// Export for use in other files
export { MoodMirrorError };
