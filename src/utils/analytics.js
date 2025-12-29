/**
 * Google Tag Manager / Google Analytics Event Tracking
 * 
 * Kullanım:
 * import { trackEvent, trackPageView } from '../utils/analytics';
 * 
 * trackEvent('game_start', { game_type: 'reflex' });
 * trackPageView('/games/reflex');
 */

/**
 * GTM/GA4 Event Tracking
 * @param {string} eventName - Event adı (örn: 'game_start', 'practice_complete')
 * @param {object} eventParams - Event parametreleri
 */
export const trackEvent = (eventName, eventParams = {}) => {
  if (typeof window === 'undefined') return;

  // Google Tag Manager dataLayer
  if (window.dataLayer) {
    window.dataLayer.push({
      event: eventName,
      ...eventParams
    });
  }

  // Google Analytics 4 (gtag) - eğer varsa
  if (window.gtag) {
    window.gtag('event', eventName, eventParams);
  }

  // Console'da görmek için (development)
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Analytics Event:', eventName, eventParams);
  }
};

/**
 * Page View Tracking
 * @param {string} path - Sayfa yolu
 */
export const trackPageView = (path) => {
  if (typeof window === 'undefined') return;

  // Google Tag Manager
  if (window.dataLayer) {
    window.dataLayer.push({
      event: 'page_view',
      page_path: path,
      page_title: document.title
    });
  }

  // Google Analytics 4
  if (window.gtag) {
    window.gtag('config', 'G-QJC0ZQ4JR8', {
      page_path: path,
      page_title: document.title
    });
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('📄 Page View:', path);
  }
};

/**
 * Oyun Event'leri için helper fonksiyonlar
 */

// Oyun başlatma
export const trackGameStart = (gameType, availableLetters = []) => {
  trackEvent('game_start', {
    game_type: gameType,
    available_letters_count: availableLetters.length,
    has_locked_letters: availableLetters.length > 0
  });
};

// Oyun bitirme
export const trackGameEnd = (gameType, score, duration, resultData = {}) => {
  trackEvent('game_end', {
    game_type: gameType,
    score: score,
    duration: duration, // saniye cinsinden
    result: resultData.result || 'completed', // 'win', 'lose', 'quit', 'completed', 'timeout', 'game_over'
    ...resultData, // Diğer ekstra veriler (answered_count, accuracy, vb.)
    timestamp: new Date().toISOString()
  });
};

// Oyun cevabı
export const trackGameAnswer = (gameType, isCorrect, combo = 0) => {
  trackEvent('game_answer', {
    game_type: gameType,
    is_correct: isCorrect,
    combo: combo
  });
};

// Oyun seviye atlama
export const trackGameLevelUp = (gameType, level) => {
  trackEvent('game_level_up', {
    game_type: gameType,
    level: level
  });
};

// Oyun can kaybı
export const trackGameLifeLost = (gameType, remainingLives) => {
  trackEvent('game_life_lost', {
    game_type: gameType,
    remaining_lives: remainingLives
  });
};

