import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, X, RotateCcw, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { reflexData } from '../data/reflexData';
import { useSequentialLearning } from '../contexts/SequentialLearningContext';

// Kiril harfini seslendir
const speakCyrillic = (text, lang = 'ru-RU') => {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 0.8;
        utterance.pitch = 1;
        utterance.volume = 1;
        window.speechSynthesis.speak(utterance);
    }
};

export default function SequentialLearningModal() {
    const { isOpen, closeModal } = useSequentialLearning();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [isAutoPlaying, setIsAutoPlaying] = useState(false);
    const [autoAdvance, setAutoAdvance] = useState(true);
    const [advanceProgress, setAdvanceProgress] = useState(0);
    const autoPlayTimeoutRef = useRef(null);
    const autoAdvanceTimeoutRef = useRef(null);
    const progressIntervalRef = useRef(null);

    // Prepare sequential learning data (use reflexData for detailed info)
    const letters = reflexData.map(item => ({
        cyrillic: item.cyrillic,
        turkish: item.turkish,
        pronunciation: item.pronunciation,
        association: item.association,
        exampleWord: item.exampleWord,
        examplePronunciation: item.examplePronunciation,
        exampleTranslation: item.exampleTranslation
    }));

    const currentLetter = letters[currentIndex];
    const progress = ((currentIndex + 1) / letters.length) * 100;

    // Track which letters have been spoken
    const spokenLettersRef = useRef(new Set());

    // Auto-play and auto-advance when index changes
    useEffect(() => {
        if (isOpen && currentLetter) {
            // Clear any existing timeouts and intervals
            if (autoPlayTimeoutRef.current) clearTimeout(autoPlayTimeoutRef.current);
            if (autoAdvanceTimeoutRef.current) clearTimeout(autoAdvanceTimeoutRef.current);
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

            // Reset progress
            setAdvanceProgress(0);

            // Auto-play audio only once per letter
            if (audioEnabled && !spokenLettersRef.current.has(currentIndex)) {
                const playTimer = setTimeout(() => {
                    speakCyrillic(currentLetter.cyrillic);
                    setIsAutoPlaying(true);
                    setTimeout(() => setIsAutoPlaying(false), 1000);
                    spokenLettersRef.current.add(currentIndex);
                }, 300);

                autoPlayTimeoutRef.current = playTimer;
            }

            // Auto-advance to next letter after 3 seconds
            if (autoAdvance && currentIndex < letters.length - 1) {
                // Start progress animation (3 seconds = 3000ms)
                const startTime = Date.now();
                const duration = 3000;
                const updateInterval = 16; // ~60fps

                progressIntervalRef.current = setInterval(() => {
                    const elapsed = Date.now() - startTime;
                    const progress = Math.min((elapsed / duration) * 100, 100);
                    setAdvanceProgress(progress);

                    if (progress >= 100) {
                        clearInterval(progressIntervalRef.current);
                    }
                }, updateInterval);

                const advanceTimer = setTimeout(() => {
                    setCurrentIndex(prev => prev + 1);
                }, duration);

                autoAdvanceTimeoutRef.current = advanceTimer;
            }

            return () => {
                if (autoPlayTimeoutRef.current) clearTimeout(autoPlayTimeoutRef.current);
                if (autoAdvanceTimeoutRef.current) clearTimeout(autoAdvanceTimeoutRef.current);
                if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
            };
        }
    }, [currentIndex, isOpen, audioEnabled, autoAdvance]);

    // Cleanup on close
    useEffect(() => {
        if (!isOpen) {
            window.speechSynthesis.cancel();
            if (autoPlayTimeoutRef.current) {
                clearTimeout(autoPlayTimeoutRef.current);
            }
            if (autoAdvanceTimeoutRef.current) {
                clearTimeout(autoAdvanceTimeoutRef.current);
            }
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
            }
            setCurrentIndex(0);
            setAdvanceProgress(0);
            spokenLettersRef.current.clear(); // Reset spoken letters when modal closes
        }
    }, [isOpen]);

    const handleManualSpeak = () => {
        if (currentLetter) {
            speakCyrillic(currentLetter.cyrillic);
            setIsAutoPlaying(true);
            setTimeout(() => setIsAutoPlaying(false), 1000);
        }
    };

    const handleRestart = () => {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();
        
        // Clear all timeouts and intervals
        if (autoPlayTimeoutRef.current) {
            clearTimeout(autoPlayTimeoutRef.current);
        }
        if (autoAdvanceTimeoutRef.current) {
            clearTimeout(autoAdvanceTimeoutRef.current);
        }
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
        }
        
        // Reset spoken letters tracking
        spokenLettersRef.current.clear();
        
        // Reset progress
        setAdvanceProgress(0);
        
        // Reset to first letter
        setCurrentIndex(0);
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();
            
            // Clear all timeouts and intervals
            if (autoPlayTimeoutRef.current) {
                clearTimeout(autoPlayTimeoutRef.current);
            }
            if (autoAdvanceTimeoutRef.current) {
                clearTimeout(autoAdvanceTimeoutRef.current);
            }
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
            }
            
            // Reset progress
            setAdvanceProgress(0);
            
            // Remove current index from spoken set so it will play again
            spokenLettersRef.current.delete(currentIndex - 1);
            
            setCurrentIndex(prev => prev - 1);
        }
    };

    const handleNext = () => {
        if (currentIndex < letters.length - 1) {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();
            
            // Clear all timeouts and intervals
            if (autoPlayTimeoutRef.current) {
                clearTimeout(autoPlayTimeoutRef.current);
            }
            if (autoAdvanceTimeoutRef.current) {
                clearTimeout(autoAdvanceTimeoutRef.current);
            }
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
            }
            
            // Reset progress
            setAdvanceProgress(0);
            
            setCurrentIndex(prev => prev + 1);
        }
    };

    const isCompleted = currentIndex === letters.length - 1 && progress === 100;

    if (!isOpen || !currentLetter) return null;

    return (
        <div className="sequential-modal-overlay" onClick={closeModal}>
            <div className="sequential-modal" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="sequential-modal-header">
                    <div className="sequential-header-left">
                        <h3>Sıralı Öğren</h3>
                        <span className="sequential-progress-text">
                            {currentIndex + 1} / {letters.length}
                        </span>
                    </div>
                    <div className="sequential-header-right">
                    {/* 
                        <button
                            className="sequential-nav-btn"
                            onClick={handleRestart}
                            title="Yeniden Başlat"
                        >
                            <RotateCcw size={16} />
                        </button>
                        */}
                        <button
                            className="sequential-nav-btn"
                            onClick={handlePrev}
                            disabled={currentIndex === 0}
                            title="Önceki Harf"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            className="sequential-nav-btn"
                            onClick={handleNext}
                            disabled={currentIndex === letters.length - 1}
                            title="Sonraki Harf"
                        >
                            <ChevronRight size={16} />
                        </button>
                        <button
                            className={`sequential-control-btn ${autoAdvance ? 'active' : ''}`}
                            onClick={() => setAutoAdvance(!autoAdvance)}
                            title={autoAdvance ? 'Otomatik Geçişi Durdur' : 'Otomatik Geçişi Başlat'}
                        >
                            {autoAdvance ? <Pause size={16} /> : <Play size={16} />}
                        </button>
                        <button
                            className={`sequential-audio-btn ${audioEnabled ? 'active' : ''}`}
                            onClick={() => setAudioEnabled(!audioEnabled)}
                            title={audioEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
                        >
                            {audioEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                        </button>
                        <button
                            className="sequential-close-btn"
                            onClick={closeModal}
                            title="Kapat"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="sequential-progress-bar">
                    <div 
                        className="sequential-progress-fill" 
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Letter Display */}
                {!isCompleted && (
                    <>
                        <div className="sequential-letter-display">
                            <div className="sequential-letter-main">
                                <div className="sequential-letter-glow" />
                                <span 
                                    className="sequential-cyrillic-large"
                                    style={autoAdvance && currentIndex < letters.length - 1 && advanceProgress > 0 ? {
                                        backgroundImage: `linear-gradient(to top, var(--accent-primary) 0%, var(--accent-primary) ${advanceProgress}%, var(--text-primary) ${advanceProgress}%, var(--text-primary) 100%)`,
                                        WebkitBackgroundClip: 'text',
                                        backgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent'
                                    } : undefined}
                                >
                                    {currentLetter.cyrillic}
                                </span>
                                <button
                                    className={`sequential-speak-btn ${isAutoPlaying ? 'playing' : ''}`}
                                    onClick={handleManualSpeak}
                                    title="Tekrar Dinle"
                                >
                                    <Volume2 size={20} />
                                </button>
                            </div>

                            <div className="sequential-equals">=</div>

                            <div className="sequential-turkish-section">
                                <span className="sequential-turkish">{currentLetter.turkish}</span>
                                <span className="sequential-pronunciation">/{currentLetter.pronunciation}/</span>
                            </div>
                        </div>

                        {/* Letter Info */}
                        <div className="sequential-letter-info">
                            {/*
                             <div className="sequential-info-card">
                                <div className="info-label">Şekil Çağrışımı</div>
                                <div className="info-value">{currentLetter.association}</div>
                            </div>

                            */}
                           
                            {currentLetter.exampleWord && (
                                <div className="sequential-example-section">
                                    <div className="example-cyrillic-word">{currentLetter.exampleWord}</div>
                                    <div className="example-details">
                                        <span className="example-pronunciation">{currentLetter.examplePronunciation}</span>
                                        <span className="example-separator">•</span>
                                        <span className="example-translation">"{currentLetter.exampleTranslation}"</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Completion Message */}
                {isCompleted && (
                    <div className="sequential-completion">
                        <div className="completion-icon">
                            <CheckCircle2 size={48} />
                        </div>
                        <h3 className="completion-title">Tebrikler! Tüm harfleri tamamladınız.</h3>
                        <p className="completion-message">Yeniden başlamak ister misiniz?</p>
                        <button className="completion-restart-btn" onClick={handleRestart}>
                            <RotateCcw size={20} />
                            <span>Yeniden Başlat</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

