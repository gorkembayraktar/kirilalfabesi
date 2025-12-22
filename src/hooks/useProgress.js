import { useState, useEffect } from 'react';

const STORAGE_KEY = 'kiril-progress';

const getDefaultProgress = () => ({
  streak: 0,
  lastPracticeDate: null,
  todayWords: 0,
  todayCorrect: 0,
  totalWords: 0,
  totalCorrect: 0,
  learnedLetters: []
});

export function useProgress() {
  const [progress, setProgress] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...getDefaultProgress(), ...parsed };
      }
    } catch (e) {
      console.error('Progress yüklenemedi:', e);
    }
    return getDefaultProgress();
  });

  // localStorage'a kaydet
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      console.error('Progress kaydedilemedi:', e);
    }
  }, [progress]);

  // Günlük sıfırlama kontrolü
  useEffect(() => {
    const today = new Date().toDateString();
    if (progress.lastPracticeDate && progress.lastPracticeDate !== today) {
      // Yeni gün başladı
      const lastDate = new Date(progress.lastPracticeDate);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));

      setProgress(prev => ({
        ...prev,
        todayWords: 0,
        todayCorrect: 0,
        streak: diffDays === 1 ? prev.streak : 0, // Streak devam mı yoksa sıfırlandı mı
        lastPracticeDate: today
      }));
    }
  }, [progress.lastPracticeDate]);

  const recordPractice = (isCorrect) => {
    const today = new Date().toDateString();
    
    setProgress(prev => {
      const isNewDay = prev.lastPracticeDate !== today;
      const newStreak = isNewDay 
        ? (prev.lastPracticeDate && (new Date(today) - new Date(prev.lastPracticeDate)) / (1000 * 60 * 60 * 24) === 1 
            ? prev.streak + 1 
            : 1)
        : prev.streak || 1;

      return {
        ...prev,
        lastPracticeDate: today,
        streak: Math.max(newStreak, prev.streak),
        todayWords: (isNewDay ? 0 : prev.todayWords) + 1,
        todayCorrect: (isNewDay ? 0 : prev.todayCorrect) + (isCorrect ? 1 : 0),
        totalWords: prev.totalWords + 1,
        totalCorrect: prev.totalCorrect + (isCorrect ? 1 : 0)
      };
    });
  };

  const addLearnedLetter = (letter) => {
    setProgress(prev => {
      if (prev.learnedLetters.includes(letter)) return prev;
      return {
        ...prev,
        learnedLetters: [...prev.learnedLetters, letter]
      };
    });
  };

  const resetProgress = () => {
    setProgress(getDefaultProgress());
  };

  return {
    progress,
    recordPractice,
    addLearnedLetter,
    resetProgress
  };
}
