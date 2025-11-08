// Mood Mirror - Constants and Configuration
// Single source of truth for all mood thresholds and categories

/**
 * Mood category thresholds
 * These values determine the boundaries for each mood category
 */
export const MOOD_THRESHOLDS = {
  EXCELLENT: 80,
  GOOD: 65,
  NEUTRAL: 50,
  LOW: 35,
  CONCERNING: 10,
  CRITICAL: 0
};

/**
 * Mood categories with metadata
 * Used for consistent labeling and emoji display across the extension
 */
export const MOOD_CATEGORIES = {
  EXCELLENT: {
    min: 80,
    max: 100,
    label: 'Excellent',
    emoji: '🟢', // 🟢
    color: '#4caf50'
  },
  GOOD: {
    min: 65,
    max: 79,
    label: 'Good',
    emoji: '🟢', // 🟢
    color: '#8bc34a'
  },
  NEUTRAL: {
    min: 50,
    max: 64,
    label: 'Neutral',
    emoji: '🟡', // 🟡
    color: '#ffeb3b'
  },
  LOW: {
    min: 35,
    max: 49,
    label: 'Low',
    emoji: '🟠', // 🟠
    color: '#ff9800'
  },
  CONCERNING: {
    min: 10,
    max: 34,
    label: 'Concerning',
    emoji: '🟠', // 🟠
    color: '#ff5722'
  },
  CRITICAL: {
    min: 0,
    max: 9,
    label: 'Critical',
    emoji: '🔴', // 🔴
    color: '#f44336'
  }
};

/**
 * Crisis helpline information
 */
export const HELPLINES = {
  INDIA: {
    name: 'TeleMANAS',
    numbers: ['14416', '1800-891-4416'],
    displayText: 'TeleMANAS: 14416 or 1800-891-4416'
  },
  USA: {
    name: '988 Suicide & Crisis Lifeline',
    numbers: ['988'],
    displayText: '988 (USA): Free crisis support'
  },
  INTERNATIONAL: {
    name: 'Find A Helpline',
    url: 'https://findahelpline.com',
    displayText: 'International: findahelpline.com'
  }
};

/**
 * Extension configuration
 */
export const CONFIG = {
  DEFAULT_MOOD_SCORE: 50,
  UPDATE_INTERVAL_MS: 5000, // 5 seconds
  MIN_TEXT_LENGTH: 50,
  AUTO_REFRESH_OPTIONS: [30, 60, 180, 300, 720, 1440], // minutes
  VERSION: '1.1.0'
};
