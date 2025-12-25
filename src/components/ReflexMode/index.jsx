import { useState, useEffect, useMemo } from 'react';
import { RotateCcw, Lock, Brain, PartyPopper, AlertTriangle } from 'lucide-react';
import { reflexData } from '../../data/reflexData';
import { useProgress } from '../../hooks/useProgress';
import CodingStage from './CodingStage';
import LockingStage from './LockingStage';

const MAX_UNLOCKED_LETTERS = 6;

export default function ReflexMode() {
    const { progress, updateReflexStatus, resetReflexProgress } = useProgress();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [stage, setStage] = useState('coding'); // 'coding' or 'locking'
    const [showResetModal, setShowResetModal] = useState(false);

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
                <h3 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <AlertTriangle size={20} /> İlerlemeyi Sıfırla
                </h3>
                <p>Tüm kilitli harfler sıfırlanacak ve baştan başlayacaksın.</p>
                <p className="modal-warning">Bu işlem geri alınamaz!</p>
                <div className="modal-buttons">
                    <button
                        className="modal-btn cancel"
                        onClick={() => setShowResetModal(false)}
                    >
                        İptal
                    </button>
                    <button
                        className="modal-btn confirm"
                        onClick={handleReset}
                    >
                        Sıfırla
                    </button>
                </div>
            </div>
        </div>
    );

    // If all letters are locked
    if (lockedCount === reflexData.length) {
        return (
            <div className="reflex-container completed">
                <h2><PartyPopper size={24} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '0.5rem' }} /> Tebrikler!</h2>
                <p>Tüm harfleri başarıyla kilitledin!</p>
                <div className="reflex-stats">
                    {reflexData.map(l => (
                        <div key={l.id} className="stat-badge locked">
                            {l.cyrillic} = {l.turkish}
                        </div>
                    ))}
                </div>
                <p>Artık oyun modunda reflekslerini hızlandırabilirsin.</p>
                <button
                    className="reflex-reset-btn"
                    onClick={() => setShowResetModal(true)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <RotateCcw size={16} /> Sıfırla
                </button>
                {showResetModal && <ResetModal />}
            </div>
        );
    }

    // If no available letters in current batch (shouldn't happen normally)
    if (availableLetters.length === 0) {
        return (
            <div className="reflex-container">
                <p>Harfler yükleniyor...</p>
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
        // Move to next letter in available set
        if (currentIndex < availableLetters.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setStage('coding');
        } else {
            // Check if there are more letters to unlock
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
        // Reset to coding stage for this letter
        setStage('coding');
    };

    if (stage === 'completed') {
        return (
            <div className="reflex-container completed">
                <h2><PartyPopper size={24} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '0.5rem' }} /> Harika!</h2>
                <p>Bu seti başarıyla kilitledin!</p>
                <div className="reflex-stats">
                    {reflexData.filter(l => progress.reflexStatus?.[l.cyrillic]?.locked).map(l => (
                        <div key={l.id} className="stat-badge locked">
                            {l.cyrillic} = {l.turkish}
                        </div>
                    ))}
                </div>
                <button
                    className="reflex-next-btn"
                    onClick={() => {
                        setCurrentIndex(0);
                        setStage('coding');
                    }}
                >
                    Devam Et ({reflexData.length - lockedCount} harf kaldı)
                </button>
            </div>
        );
    }

    return (
        <div className="reflex-container">
            <div className="reflex-header">
                <span className="reflex-progress">
                    Harf {currentIndex + 1} / {availableLetters.length}
                    <span className="reflex-total"> ({lockedCount}/{reflexData.length} kilitli)</span>
                </span>
                <div className="reflex-header-actions">
                    <button
                        className="reflex-reset-icon"
                        onClick={() => setShowResetModal(true)}
                        title="Sıfırla"
                    >
                        <RotateCcw size={16} />
                    </button>
                    <div className="reflex-mode-badge" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {stage === 'coding' ? <><Brain size={14} /> Kodlama</> : <><Lock size={14} /> Kilitle</>}
                    </div>
                </div>
            </div>

            {stage === 'coding' && (
                <CodingStage
                    data={currentLetter}
                    onComplete={handleCodingComplete}
                />
            )}

            {stage === 'locking' && (
                <LockingStage
                    data={currentLetter}
                    onLock={handleLockSuccess}
                    onFail={handleLockFail}
                />
            )}

            {showResetModal && <ResetModal />}
        </div>
    );
}
