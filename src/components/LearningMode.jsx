import { useState, useEffect, useRef } from 'react';
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
    }, [feedback]);

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

    const nextWord = () => {
        if (currentIndex < words.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setUserAnswer('');
            setFeedback(null);
        } else {
            // Session bitti
            setIsStarted(false);
        }
    };

    if (!isStarted) {
        return (
            <div className="learning-mode">
                <div className="learning-card">
                    {stats.total > 0 ? (
                        <>
                            <div className="start-icon">🎉</div>
                            <h2 className="start-title">Tebrikler!</h2>
                            <p className="start-description">
                                {stats.total} kelimeden {stats.correct} tanesini doğru yazdınız.
                                Başarı oranınız: %{Math.round((stats.correct / stats.total) * 100)}
                            </p>
                            <button className="start-btn" onClick={startSession}>
                                Tekrar Başla
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="start-icon">🎓</div>
                            <h2 className="start-title">Öğrenme Modu</h2>
                            <p className="start-description">
                                Size Türkçe kelimeler göstereceğiz. Her kelimenin Kiril karşılığını yazın.
                                Ekrandaki klavyeyi kullanabilir veya kendi klavyenizle yazabilirsiniz!
                            </p>
                            <button className="start-btn" onClick={startSession}>
                                Başla
                            </button>
                        </>
                    )}
                </div>
            </div>
        );
    }

    const currentWord = words[currentIndex];
    const progressPercent = ((currentIndex) / words.length) * 100;

    return (
        <div className="learning-mode">
            <div className="learning-card fade-in">
                <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
                </div>

                <div className="word-display">{currentWord.turkish}</div>
                <div className="word-hint">Bu kelimenin Kiril karşılığını yazın</div>

                <form onSubmit={handleSubmit}>
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
                </form>

                <CyrillicKeyboard
                    onKeyPress={handleKeyboardInput}
                    disabled={feedback !== null}
                />

                {feedback && (
                    <div className={`feedback ${feedback} fade-in`}>
                        {feedback === 'correct' ? (
                            <>✅ Doğru!</>
                        ) : (
                            <>❌ Yanlış</>
                        )}
                    </div>
                )}

                {feedback === 'incorrect' && (
                    <div className="correct-answer fade-in">
                        Doğru cevap: {transliterate(currentWord.turkish)}
                    </div>
                )}

                {feedback && (
                    <button className="next-btn fade-in" onClick={nextWord}>
                        {currentIndex < words.length - 1 ? 'Sonraki Kelime →' : 'Bitir'}
                    </button>
                )}

                <div className="stats">
                    <div className="stat">
                        <div className="stat-value">{currentIndex + 1}/{words.length}</div>
                        <div className="stat-label">Kelime</div>
                    </div>
                    <div className="stat">
                        <div className="stat-value">{stats.correct}</div>
                        <div className="stat-label">Doğru</div>
                    </div>
                    <div className="stat">
                        <div className="stat-value">
                            {stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}%
                        </div>
                        <div className="stat-label">Başarı</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

