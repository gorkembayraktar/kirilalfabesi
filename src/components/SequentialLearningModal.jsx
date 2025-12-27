import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, X, RotateCcw, CheckCircle2 } from 'lucide-react';
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
    const autoPlayTimeoutRef = useRef(null);
    const autoAdvanceTimeoutRef = useRef(null);

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
            // Clear any existing timeouts
            if (autoPlayTimeoutRef.current) clearTimeout(autoPlayTimeoutRef.current);
            if (autoAdvanceTimeoutRef.current) clearTimeout(autoAdvanceTimeoutRef.current);

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
                const advanceTimer = setTimeout(() => {
                    setCurrentIndex(prev => prev + 1);
                }, 3000);

                autoAdvanceTimeoutRef.current = advanceTimer;
            }

            return () => {
                if (autoPlayTimeoutRef.current) clearTimeout(autoPlayTimeoutRef.current);
                if (autoAdvanceTimeoutRef.current) clearTimeout(autoAdvanceTimeoutRef.current);
            };
        }
    }, [currentIndex, isOpen, audioEnabled, currentLetter, autoAdvance, letters.length]);

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
            setCurrentIndex(0);
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
        setCurrentIndex(0);
        if (autoAdvanceTimeoutRef.current) {
            clearTimeout(autoAdvanceTimeoutRef.current);
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
                        <button
                            className={`sequential-control-btn ${autoAdvance ? 'active' : ''}`}
                            onClick={() => setAutoAdvance(!autoAdvance)}
                            title={autoAdvance ? 'Otomatik Geçişi Kapat' : 'Otomatik Geçişi Aç'}
                        >
                            <Play size={16} style={{ transform: autoAdvance ? 'none' : 'rotate(-90deg)' }} />
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
                                <span className="sequential-cyrillic-large">{currentLetter.cyrillic}</span>
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
                            <div className="sequential-info-card">
                                <div className="info-label">Şekil Çağrışımı</div>
                                <div className="info-value">{currentLetter.association}</div>
                            </div>

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

