/**
 * Mood Categories Unit Tests
 * Tests for mood threshold boundary conditions
 * Ensures mood categorization is accurate for mental health tracking
 */

import { describe, test, expect } from '@jest/globals';
import { MOOD_THRESHOLDS, MOOD_CATEGORIES } from '../constants.js';

/**
 * Helper function to categorize mood based on score
 * Mimics the logic used in popup.js getMoodLabel()
 */
function getMoodCategory(score) {
  if (score >= MOOD_THRESHOLDS.EXCELLENT) return 'Excellent';
  if (score >= MOOD_THRESHOLDS.GOOD) return 'Good';
  if (score >= MOOD_THRESHOLDS.NEUTRAL) return 'Neutral';
  if (score >= MOOD_THRESHOLDS.LOW) return 'Low';
  if (score >= MOOD_THRESHOLDS.CONCERNING) return 'Concerning';
  return 'Critical';
}

describe('Mood Category Thresholds', () => {
  test('MOOD_THRESHOLDS should have correct values', () => {
    expect(MOOD_THRESHOLDS.EXCELLENT).toBe(80);
    expect(MOOD_THRESHOLDS.GOOD).toBe(65);
    expect(MOOD_THRESHOLDS.NEUTRAL).toBe(50);
    expect(MOOD_THRESHOLDS.LOW).toBe(35);
    expect(MOOD_THRESHOLDS.CONCERNING).toBe(10);
  });

  test('MOOD_CATEGORIES should have all 6 categories', () => {
    const categories = Object.keys(MOOD_CATEGORIES);
    expect(categories).toHaveLength(6);
    expect(categories).toContain('EXCELLENT');
    expect(categories).toContain('GOOD');
    expect(categories).toContain('NEUTRAL');
    expect(categories).toContain('LOW');
    expect(categories).toContain('CONCERNING');
    expect(categories).toContain('CRITICAL');
  });
});

describe('Mood Categorization - Boundary Conditions', () => {
  // Excellent category: 80-100
  test('score 100 should be Excellent', () => {
    expect(getMoodCategory(100)).toBe('Excellent');
  });

  test('score 80 should be Excellent (lower boundary)', () => {
    expect(getMoodCategory(80)).toBe('Excellent');
  });

  test('score 79 should be Good (just below Excellent)', () => {
    expect(getMoodCategory(79)).toBe('Good');
  });

  // Good category: 65-79
  test('score 65 should be Good (lower boundary)', () => {
    expect(getMoodCategory(65)).toBe('Good');
  });

  test('score 70 should be Good', () => {
    expect(getMoodCategory(70)).toBe('Good');
  });

  test('score 64 should be Neutral (just below Good)', () => {
    expect(getMoodCategory(64)).toBe('Neutral');
  });

  // Neutral category: 50-64
  test('score 50 should be Neutral (lower boundary)', () => {
    expect(getMoodCategory(50)).toBe('Neutral');
  });

  test('score 55 should be Neutral', () => {
    expect(getMoodCategory(55)).toBe('Neutral');
  });

  test('score 49 should be Low (just below Neutral)', () => {
    expect(getMoodCategory(49)).toBe('Low');
  });

  // Low category: 35-49
  test('score 35 should be Low (lower boundary)', () => {
    expect(getMoodCategory(35)).toBe('Low');
  });

  test('score 40 should be Low', () => {
    expect(getMoodCategory(40)).toBe('Low');
  });

  test('score 34 should be Concerning (just below Low)', () => {
    expect(getMoodCategory(34)).toBe('Concerning');
  });

  // Concerning category: 10-34
  test('score 10 should be Concerning (lower boundary)', () => {
    expect(getMoodCategory(10)).toBe('Concerning');
  });

  test('score 20 should be Concerning', () => {
    expect(getMoodCategory(20)).toBe('Concerning');
  });

  test('score 9 should be Critical (just below Concerning)', () => {
    expect(getMoodCategory(9)).toBe('Critical');
  });

  // Critical category: 0-9
  test('score 0 should be Critical', () => {
    expect(getMoodCategory(0)).toBe('Critical');
  });

  test('score 5 should be Critical', () => {
    expect(getMoodCategory(5)).toBe('Critical');
  });
});

describe('Mood Categories Metadata', () => {
  test('each category should have required metadata', () => {
    Object.values(MOOD_CATEGORIES).forEach(category => {
      expect(category).toHaveProperty('min');
      expect(category).toHaveProperty('max');
      expect(category).toHaveProperty('label');
      expect(category).toHaveProperty('emoji');
      expect(category).toHaveProperty('color');
    });
  });

  test('category ranges should not overlap', () => {
    expect(MOOD_CATEGORIES.EXCELLENT.min).toBe(80);
    expect(MOOD_CATEGORIES.GOOD.max).toBe(79);
    expect(MOOD_CATEGORIES.GOOD.min).toBe(65);
    expect(MOOD_CATEGORIES.NEUTRAL.max).toBe(64);
    expect(MOOD_CATEGORIES.NEUTRAL.min).toBe(50);
    expect(MOOD_CATEGORIES.LOW.max).toBe(49);
    expect(MOOD_CATEGORIES.LOW.min).toBe(35);
    expect(MOOD_CATEGORIES.CONCERNING.max).toBe(34);
    expect(MOOD_CATEGORIES.CONCERNING.min).toBe(10);
    expect(MOOD_CATEGORIES.CRITICAL.max).toBe(9);
    expect(MOOD_CATEGORIES.CRITICAL.min).toBe(0);
  });
});
