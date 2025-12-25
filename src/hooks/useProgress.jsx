import { useState, useEffect, useRef, createContext, useContext } from 'react';

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
  history: [], // [{ date: '2023-10-27', words: 10, correct: 8, time: 120 }]
  reflexStatus: {} // { [letter]: { coded: boolean, locked: boolean, streak: 0 } }
});

// Create Context
const ProgressContext = createContext(null);

// Provider Component
export function ProgressProvider({ children }) {
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

  // Günlük sıfırlama kontrolü (Sadece state güncellemesi, yazma yok)
  useEffect(() => {
    const today = new Date().toDateString();

    // Eğer son pratik tarihi bugün değilse, günlük sayaçları sıfırla
    // Ama lastPracticeDate'i hemen GÜNCELLEME. Bunu pratik yapınca güncelleyeceğiz.
    // Sadece streak'in bozulup bozulmadığını kontrol et.
    if (progress.lastPracticeDate && progress.lastPracticeDate !== today) {
      // Son pratikten beri kaç gün geçmiş?
      const lastDate = new Date(progress.lastPracticeDate);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));

      // Eğer 1 günden fazla geçmişse streak sıfırlanmalı
      // Ama bunu sadece display için yapıyoruz, kalıcı olarak pratik yapınca işlenir
      if (diffDays > 1 && progress.streak > 0) {
        setProgress(prev => ({
          ...prev,
          streak: 0,
          // Diğer günlük istatistikleri de sıfırla
          todayWords: 0,
          todayCorrect: 0,
          todayTime: 0
        }));
      } else if (progress.todayWords > 0) {
        // Yeni gün ama henüz pratik yapılmadıysa günlükleri sıfırla
        setProgress(prev => ({
          ...prev,
          todayWords: 0,
          todayCorrect: 0,
          todayTime: 0
        }));
      }
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

  const updateReflexStatus = (letter, updates) => {
    setProgress(prev => {
      const current = prev.reflexStatus?.[letter] || { coded: false, locked: false, streak: 0 };
      return {
        ...prev,
        reflexStatus: {
          ...prev.reflexStatus,
          [letter]: { ...current, ...updates }
        }
      };
    });
  };

  const getLockedLetters = () => {
    if (!progress.reflexStatus) return [];
    return Object.keys(progress.reflexStatus).filter(l => progress.reflexStatus[l].locked);
  };

  const resetProgress = () => {
    setProgress(getDefaultProgress());
  };

  const resetReflexProgress = () => {
    setProgress(prev => ({
      ...prev,
      reflexStatus: {}
    }));
  };

  const value = {
    progress,
    recordPractice,
    addLearnedLetter,
    updateReflexStatus,
    getLockedLetters,
    resetProgress,
    resetReflexProgress
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

// Hook to use progress
export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}
