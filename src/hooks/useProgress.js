import { useState, useEffect, useRef } from 'react';

const STORAGE_KEY = 'kiril-progress';

const getDefaultProgress = () => ({
  streak: 0,
  lastPracticeDate: null,
  todayWords: 0,
  todayCorrect: 0,
  todayTime: 0, // seconds
  totalWords: 0,
  totalCorrect: 0,
  totalTime: 0, // seconds
  learnedLetters: [],
  history: [] // [{ date: '2023-10-27', words: 10, correct: 8, time: 120 }]
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

  // Accumulate time in a ref to avoid re-renders every second
  // State update will happen periodically
  const sessionTimeRef = useRef(0);
  
  // Track visibility to only count active time
  useEffect(() => {
    let interval;
    const handleVisibilityChange = () => {
        if (document.hidden) {
            // Save accumulated time when tab is hidden
            if (sessionTimeRef.current > 0) {
                syncTime();
            }
        }
    };

    const tick = () => {
        if (!document.hidden) {
            sessionTimeRef.current += 1;
            // Sync every 30 seconds automatically
            if (sessionTimeRef.current % 30 === 0) {
                syncTime();
            }
        }
    };

    interval = setInterval(tick, 1000);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
        clearInterval(interval);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        // Sync on unmount
        if (sessionTimeRef.current > 0) syncTime();
    };
  }, []); // Run once on mount

  const syncTime = () => {
    if (sessionTimeRef.current === 0) return;
    
    const timeToAdd = sessionTimeRef.current;
    sessionTimeRef.current = 0; // Reset ref

    const today = new Date().toDateString();

    setProgress(prev => {
        // Find history for today to update
        let newHistory = [...(prev.history || [])];
        const todayIndex = newHistory.findIndex(h => h.date === today);

        if (todayIndex >= 0) {
            newHistory[todayIndex] = {
                ...newHistory[todayIndex],
                time: (newHistory[todayIndex].time || 0) + timeToAdd
            };
        } else {
             // If sync happens before any practice (rare but possible if just viewing),
             // we create entry or wait for practice? 
             // Better to create entry to track "study time" even if no words practiced
             newHistory.push({
                 date: today,
                 words: 0,
                 correct: 0,
                 time: timeToAdd
             });
        }
        
        if (newHistory.length > 30) {
             newHistory = newHistory.slice(newHistory.length - 30);
        }

        return {
            ...prev,
            todayTime: (prev.todayTime || 0) + timeToAdd,
            totalTime: (prev.totalTime || 0) + timeToAdd,
            history: newHistory
        };
    });
  };


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
        todayTime: 0, // Reset today time
        streak: diffDays === 1 ? prev.streak : 0, // Streak devam mı yoksa sıfırlandı mı
        lastPracticeDate: today
      }));
    }
  }, [progress.lastPracticeDate]);

  const recordPractice = (isCorrect) => {
    const today = new Date().toDateString(); // "Mon Oct 27 2025" formatı yeterli
    
    // Also sync time when recording practice so data is fresh
    const storedTime = sessionTimeRef.current;
    sessionTimeRef.current = 0;

    setProgress(prev => {
      const isNewDay = prev.lastPracticeDate !== today;
      const newStreak = isNewDay 
        ? (prev.lastPracticeDate && (new Date(today) - new Date(prev.lastPracticeDate)) / (1000 * 60 * 60 * 24) === 1 
            ? prev.streak + 1 
            : 1)
        : prev.streak || 1;

      // History update
      let newHistory = [...(prev.history || [])];
      
      // Eğer bugün için kayıt varsa güncelle, yoksa ekle
      const todayIndex = newHistory.findIndex(h => h.date === today);
      
      if (todayIndex >= 0) {
        newHistory[todayIndex] = {
          ...newHistory[todayIndex],
          words: newHistory[todayIndex].words + 1,
          correct: newHistory[todayIndex].correct + (isCorrect ? 1 : 0),
          time: (newHistory[todayIndex].time || 0) + storedTime
        };
      } else {
        // Yeni gün, history'ye ekle
        newHistory.push({
          date: today,
          words: 1,
          correct: isCorrect ? 1 : 0,
          time: storedTime
        });
      }
      
      // Son 30 günü tut (isteğe bağlı, performans için)
      if (newHistory.length > 30) {
        newHistory = newHistory.slice(newHistory.length - 30);
      }

      return {
        ...prev,
        lastPracticeDate: today,
        streak: Math.max(newStreak, prev.streak),
        todayWords: (isNewDay ? 0 : prev.todayWords) + 1,
        todayCorrect: (isNewDay ? 0 : prev.todayCorrect) + (isCorrect ? 1 : 0),
        todayTime: (isNewDay ? 0 : (prev.todayTime || 0)) + storedTime,
        totalWords: prev.totalWords + 1,
        totalCorrect: prev.totalCorrect + (isCorrect ? 1 : 0),
        totalTime: (prev.totalTime || 0) + storedTime,
        history: newHistory
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
