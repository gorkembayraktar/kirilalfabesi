import { useState, useEffect, useRef, useCallback } from 'react';
import { GraduationCap, PartyPopper, Check, X, ArrowRight, CheckCircle2, XCircle, Play, RotateCcw, Trophy, Target, TrendingUp } from 'lucide-react';
import { transliterate, getRandomWords, checkAnswer } from '../utils/transliteration';
import CyrillicKeyboard from './CyrillicKeyboard';

export default function LearningMode({ onRecordPractice }) {
    const [words, setWords] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [feedback, setFeedback] = useState(null); // null, 'correct', 'incorrect'
    const [stats, setStats] = useState({ correct: 0, total: 0 });
    const [isStarted, setIsStarted] = useState(false);
    const inputRef = useRef(null);

    const startSession = () => {
        const newWords = getRandomWords(10);
        setWords(newWords);
        setCurrentIndex(0);
        setUserAnswer('');
        setFeedback(null);
        setStats({ correct: 0, total: 0 });
        setIsStarted(true);
    };

    const nextWord = useCallback(() => {
        setCurrentIndex(prev => {
            if (prev < words.length - 1) {
                return prev + 1;
            } else {
                // Session bitti
                setIsStarted(false);
                return prev;
            }
        });
        setUserAnswer('');
        setFeedback(null);
    }, [words.length]);

    useEffect(() => {
        if (isStarted && inputRef.current && feedback === null) {
            inputRef.current.focus();
        }
    }, [currentIndex, isStarted, feedback]);

    // Listen for Enter key to proceed when feedback is shown
    useEffect(() => {
        const handleGlobalKeyDown = (e) => {
            if (e.key === 'Enter' && feedback !== null) {
                e.preventDefault();
                nextWord();
            }
        };

        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [feedback, nextWord]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (feedback !== null || !userAnswer.trim()) return;

        const currentWord = words[currentIndex];
        const isCorrect = checkAnswer(userAnswer, currentWord.turkish);

        setFeedback(isCorrect ? 'correct' : 'incorrect');
        setStats(prev => ({
            correct: prev.correct + (isCorrect ? 1 : 0),
            total: prev.total + 1
        }));

        if (onRecordPractice) {
            onRecordPractice(isCorrect);
        }
    };

    const handleKeyboardInput = (key) => {
        if (key === 'ENTER') {
            if (feedback === null && userAnswer.trim()) {
                handleSubmit({ preventDefault: () => { } });
            } else if (feedback !== null) {
                nextWord();
            }
            return;
        }

        if (feedback !== null) return;

        if (key === 'BACKSPACE') {
            setUserAnswer(prev => prev.slice(0, -1));
        } else {
            setUserAnswer(prev => prev + key);
        }

        // Input'a focus ver
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    if (!isStarted) {
        const successRate = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
        const getPerformanceMessage = () => {
            if (successRate >= 90) return { text: 'Mükemmel! 🌟', color: 'excellent' };
            if (successRate >= 70) return { text: 'Harika! 🎉', color: 'great' };
            if (successRate >= 50) return { text: 'İyi! 👍', color: 'good' };
            return { text: 'Devam Et! 💪', color: 'keep-going' };
        };
        const performance = stats.total > 0 ? getPerformanceMessage() : null;

        return (
            <div className="learning-mode">
                <div className="learning-start-card">
                    {stats.total > 0 ? (
                        <>
                            <div className="result-header">
                                <div className="result-icon-wrapper">
                                    <Trophy size={40} className="result-icon" />
                                </div>
                                <h2 className="result-title">{performance?.text || 'Tebrikler!'}</h2>
                                <p className="result-subtitle">Seans tamamlandı</p>
                            </div>

                            <div className="result-stats-grid-2">
                                <div className="result-stat-card">
                                    <div className="result-stat-icon">
                                        <CheckCircle2 size={24} />
                                    </div>
                                    <div className="result-stat-content">
                                        <div className="result-stat-value">{stats.correct}</div>
                                        <div className="result-stat-label">Doğru</div>
                                    </div>
                                </div>
                                
                                <div className="result-stat-card">
                                    <div className="result-stat-icon error">
                                        <XCircle size={24} />
                                    </div>
                                    <div className="result-stat-content">
                                        <div className="result-stat-value">{stats.total - stats.correct}</div>
                                        <div className="result-stat-label">Yanlış</div>
                                    </div>
                                </div>
                                
                                <div className="result-stat-card highlight">
                                    <div className="result-stat-icon success">
                                        <TrendingUp size={24} />
                                    </div>
                                    <div className="result-stat-content">
                                        <div className="result-stat-value">{successRate}%</div>
                                        <div className="result-stat-label">Başarı</div>
                                    </div>
                                </div>
                            </div>

                            <div className="result-progress-section">
                                <div className="result-progress-bar">
                                    <div 
                                        className="result-progress-fill" 
                                        style={{ width: `${successRate}%` }}
                                    />
                                </div>
                                <div className="result-progress-text">
                                    <span>{stats.correct} / {stats.total} kelime doğru</span>
                                </div>
                            </div>

                            <button className="start-btn" onClick={startSession}>
                                <RotateCcw size={18} />
                                <span>Tekrar Başla</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="start-icon-wrapper">
                                <GraduationCap size={48} className="start-icon" />
                            </div>
                            <h2 className="start-title">Öğrenme Modu</h2>
                            <p className="start-description">
                                Size Türkçe kelimeler göstereceğiz. Her kelimenin Kiril karşılığını yazın.
                                Ekrandaki klavyeyi kullanabilir veya kendi klavyenizle yazabilirsiniz!
                            </p>
                            <button className="start-btn primary" onClick={startSession}>
                                <Play size={18} />
                                <span>Başla</span>
                            </button>
                        </>
                    )}
                </div>
            </div>
        );
    }

    const currentWord = words[currentIndex];
    const progressPercent = ((currentIndex) / words.length) * 100;

    const successRate = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;

    return (
        <div className="learning-mode">
            <div className="learning-card fade-in">
                {/* Progress Section */}
                <div className="learning-header">
                    <div className="progress-section">
                        <div className="progress-info">
                            <span className="progress-label">İlerleme</span>
                            <span className="progress-text">{currentIndex + 1} / {words.length}</span>
                        </div>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
                        </div>
                    </div>
                    <div className="learning-stats-compact">
                        <div className="stat-badge">
                            <CheckCircle2 size={16} />
                            <span>{stats.correct}</span>
                        </div>
                        <div className="stat-badge success">
                            <TrendingUp size={16} />
                            <span>{successRate}%</span>
                        </div>
                    </div>
                </div>

                {/* Word Display */}
                <div className="word-section">
                    <div className="word-display">{currentWord.turkish}</div>
                    <div className="word-hint">Bu kelimenin Kiril karşılığını yazın</div>
                </div>

                {/* Input Section */}
                <form onSubmit={handleSubmit} className="input-section">
                    <div className="input-wrapper">
                        <input
                            ref={inputRef}
                            type="text"
                            className={`answer-input ${feedback || ''}`}
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            placeholder="Kiril ile yazın..."
                            disabled={feedback !== null}
                            autoComplete="off"
                        />
                        {!feedback && userAnswer.trim() && (
                            <button 
                                type="submit" 
                                className="submit-btn"
                                disabled={!userAnswer.trim()}
                            >
                                <Check size={18} />
                            </button>
                        )}
                    </div>
                </form>

                {/* Feedback Section */}
                {feedback && (
                    <div className={`feedback-container ${feedback} fade-in`}>
                        {feedback === 'correct' ? (
                            <>
                                <div className="feedback-message correct">
                                    <CheckCircle2 size={20} />
                                    <span>Doğru!</span>
                                </div>
                                <button className="learning-next-btn" onClick={nextWord}>
                                    {currentIndex < words.length - 1 ? (
                                        <>
                                            <span>Sonraki</span>
                                            <ArrowRight size={18} />
                                        </>
                                    ) : (
                                        <>
                                            <Trophy size={18} />
                                            <span>Bitir</span>
                                        </>
                                    )}
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="feedback-message incorrect">
                                    <XCircle size={20} />
                                    <span>Yanlış</span>
                                </div>
                                <div className="learning-correct-answer">
                                    <span className="learning-correct-label">Doğru cevap:</span>
                                    <span className="learning-correct-text">{transliterate(currentWord.turkish)}</span>
                                </div>
                                <button className="learning-next-btn" onClick={nextWord}>
                                    {currentIndex < words.length - 1 ? (
                                        <>
                                            <span>Sonraki</span>
                                            <ArrowRight size={18} />
                                        </>
                                    ) : (
                                        <>
                                            <Trophy size={18} />
                                            <span>Bitir</span>
                                        </>
                                    )}
                                </button>
                            </>
                        )}
                    </div>
                )}

                {/* Keyboard */}
                {!feedback && (
                    <div className="keyboard-section">
                        <CyrillicKeyboard
                            onKeyPress={handleKeyboardInput}
                            disabled={feedback !== null}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

