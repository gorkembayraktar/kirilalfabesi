import { useState, useEffect, useMemo } from 'react';
import { RotateCcw, Lock, Brain, PartyPopper, AlertTriangle, Trophy, Zap, Target, ChevronRight, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { reflexData } from '../../data/reflexData';
import { useProgress } from '../../hooks/useProgress';
import CodingStage from './CodingStage';
import LockingStage from './LockingStage';

const MAX_UNLOCKED_LETTERS = 6;

// Speech synthesis helper
const speak = (text, lang = 'ru-RU') => {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 0.8;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
    }
};

export default function ReflexMode({ theme }) {
    const { progress, updateReflexStatus, resetReflexProgress } = useProgress();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [stage, setStage] = useState('coding');
    const [showResetModal, setShowResetModal] = useState(false);
    const [audioEnabled, setAudioEnabled] = useState(() => {
        const saved = localStorage.getItem('reflexAudioEnabled');
        return saved !== null ? JSON.parse(saved) : true;
    });

    // Save audio preference
    useEffect(() => {
        localStorage.setItem('reflexAudioEnabled', JSON.stringify(audioEnabled));
    }, [audioEnabled]);

    // Filter unlocked letters (max 6 at a time)
    const availableLetters = useMemo(() => {
        const unlockedLetters = reflexData.filter(letter => {
            const status = progress.reflexStatus?.[letter.cyrillic];
            return !status?.locked;
        });
        return unlockedLetters.slice(0, MAX_UNLOCKED_LETTERS);
    }, [progress.reflexStatus]);

    // Reset index when available letters change
    useEffect(() => {
        if (currentIndex >= availableLetters.length) {
            setCurrentIndex(0);
        }
    }, [availableLetters.length, currentIndex]);

    // Count locked letters
    const lockedCount = useMemo(() => {
        return reflexData.filter(letter => {
            const status = progress.reflexStatus?.[letter.cyrillic];
            return status?.locked;
        }).length;
    }, [progress.reflexStatus]);

    const handleReset = () => {
        resetReflexProgress();
        setCurrentIndex(0);
        setStage('coding');
        setShowResetModal(false);
    };

    // Reset Modal Component
    const ResetModal = () => (
        <div className="reflex-modal-overlay" onClick={() => setShowResetModal(false)}>
            <div className="reflex-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-icon-wrap">
                    <AlertTriangle size={28} />
                </div>
                <h3>İlerlemeyi Sıfırla</h3>
                <p>Tüm kilitli harfler sıfırlanacak ve baştan başlayacaksın.</p>
                <p className="modal-warning">Bu işlem geri alınamaz!</p>
                <div className="modal-buttons">
                    <button className="modal-btn cancel" onClick={() => setShowResetModal(false)}>
                        İptal
                    </button>
                    <button className="modal-btn confirm" onClick={handleReset}>
                        <RotateCcw size={16} /> Sıfırla
                    </button>
                </div>
            </div>
        </div>
    );

    // If all letters are locked
    if (lockedCount === reflexData.length) {
        return (
            <div className="reflex-wrapper">
                <div className="reflex-container reflex-completed">
                    <div className="completed-celebration">
                        <div className="celebration-icon">
                            <Trophy size={48} />
                        </div>
                        <h2>Tebrikler! 🎉</h2>
                        <p className="completed-subtitle">Tüm harfleri başarıyla kilitledin!</p>
                    </div>

                    <div className="completed-stats">
                        <div className="stat-card">
                            <span className="stat-number">{reflexData.length}</span>
                            <span className="stat-label">Harf</span>
                        </div>
                        <div className="stat-card accent">
                            <span className="stat-number">100%</span>
                            <span className="stat-label">Tamamlandı</span>
                        </div>
                    </div>

                    <div className="completed-letters-grid">
                        {reflexData.map(l => (
                            <div key={l.id} className="completed-letter-chip">
                                <span className="chip-cyrillic">{l.cyrillic}</span>
                                <span className="chip-turkish">{l.turkish}</span>
                            </div>
                        ))}
                    </div>

                    <p className="completed-hint">
                        <Zap size={16} /> Oyun modunda reflekslerini hızlandırabilirsin
                    </p>

                    <button className="reflex-reset-btn" onClick={() => setShowResetModal(true)}>
                        <RotateCcw size={16} /> Sıfırla ve Tekrarla
                    </button>
                    {showResetModal && <ResetModal />}
                </div>
            </div>
        );
    }

    // If no available letters in current batch
    if (availableLetters.length === 0) {
        return (
            <div className="reflex-wrapper">
                <div className="reflex-container">
                    <div className="reflex-loading">
                        <Sparkles size={32} className="spin" />
                        <p>Harfler yükleniyor...</p>
                    </div>
                </div>
            </div>
        );
    }

    const currentLetter = availableLetters[currentIndex];
    const letterStatus = progress.reflexStatus?.[currentLetter.cyrillic] || { coded: false, locked: false };

    const handleCodingComplete = () => {
        updateReflexStatus(currentLetter.cyrillic, { coded: true });
        setStage('locking');
    };

    const handleLockSuccess = () => {
        updateReflexStatus(currentLetter.cyrillic, { locked: true, coded: true });
        if (currentIndex < availableLetters.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setStage('coding');
        } else {
            const remainingUnlocked = reflexData.filter(letter => {
                const status = progress.reflexStatus?.[letter.cyrillic];
                return !status?.locked && letter.cyrillic !== currentLetter.cyrillic;
            });
            if (remainingUnlocked.length > 0) {
                setCurrentIndex(0);
                setStage('coding');
            } else {
                setStage('completed');
            }
        }
    };

    const handleLockFail = () => {
        setStage('coding');
    };

    if (stage === 'completed') {
        return (
            <div className="reflex-wrapper">
                <div className="reflex-container reflex-completed">
                    <div className="completed-celebration mini">
                        <div className="celebration-icon">
                            <PartyPopper size={36} />
                        </div>
                        <h2>Harika!</h2>
                        <p>Bu seti başarıyla kilitledin!</p>
                    </div>

                    <div className="completed-letters-grid compact">
                        {reflexData.filter(l => progress.reflexStatus?.[l.cyrillic]?.locked).map(l => (
                            <div key={l.id} className="completed-letter-chip">
                                <span className="chip-cyrillic">{l.cyrillic}</span>
                                <span className="chip-turkish">{l.turkish}</span>
                            </div>
                        ))}
                    </div>

                    <button
                        className="reflex-continue-btn"
                        onClick={() => {
                            setCurrentIndex(0);
                            setStage('coding');
                        }}
                    >
                        <span>Devam Et</span>
                        <span className="btn-badge">{reflexData.length - lockedCount} harf kaldı</span>
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        );
    }

    const progressPercent = (lockedCount / reflexData.length) * 100;

    return (
        <div className="reflex-wrapper">
            {/* Top Progress Bar */}
            <div className="reflex-global-progress">
                <div className="progress-bar-container">
                    <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
                </div>
                <div className="progress-text">
                    <Lock size={12} /> {lockedCount}/{reflexData.length}
                </div>
            </div>

            <div className="reflex-container">
                {/* Header */}
                <div className="reflex-header">
                    <div className="reflex-header-left">
                        <div className="letter-counter">
                            <Target size={16} />
                            <span>{currentIndex + 1}</span>
                            <span className="counter-divider">/</span>
                            <span className="counter-total">{availableLetters.length}</span>
                        </div>
                    </div>

                    <div className="reflex-header-right">
                        <button
                            className={`reflex-audio-toggle ${audioEnabled ? 'active' : ''}`}
                            onClick={() => setAudioEnabled(!audioEnabled)}
                            title={audioEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
                        >
                            {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                        </button>
                        <button
                            className="reflex-reset-icon-btn"
                            onClick={() => setShowResetModal(true)}
                            title="Sıfırla"
                        >
                            <RotateCcw size={16} />
                        </button>
                    </div>
                </div>

                {/* Main Layout: Sidebar + Content */}
                <div className="reflex-main">
                    {/* Vertical Stage Tabs */}
                    <div className="reflex-sidebar">
                        <div className={`stage-tab ${stage === 'coding' ? 'active' : ''} ${letterStatus.coded ? 'done' : ''}`}>
                            <div className="tab-icon"><Brain size={18} /></div>
                            <span>Kodla</span>
                        </div>
                        <div className="tab-connector" />
                        <div className={`stage-tab ${stage === 'locking' ? 'active' : ''}`}>
                            <div className="tab-icon"><Lock size={18} /></div>
                            <span>Kilitle</span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="reflex-content">
                        {stage === 'coding' && (
                            <CodingStage
                                data={currentLetter}
                                onComplete={handleCodingComplete}
                                audioEnabled={audioEnabled}
                                speak={speak}
                            />
                        )}

                        {stage === 'locking' && (
                            <LockingStage
                                data={currentLetter}
                                onLock={handleLockSuccess}
                                onFail={handleLockFail}
                                audioEnabled={audioEnabled}
                                speak={speak}
                            />
                        )}
                    </div>
                </div>
            </div>

            {showResetModal && <ResetModal />}
        </div>
    );
}
