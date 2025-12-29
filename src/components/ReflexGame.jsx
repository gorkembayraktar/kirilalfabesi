import { useState, useEffect, useRef } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { ArrowLeft, Gamepad2, Zap, FastForward, ArrowRight, Clock, Target, Trophy, TrendingUp, Play, RotateCcw, Home, CheckCircle, XCircle } from 'lucide-react';
import { getLetterMapping } from '../utils/transliteration';
import TurkishKeyboard from './TurkishKeyboard';
import { trackGameStart, trackGameEnd, trackGameAnswer } from '../utils/analytics';

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

export default function ReflexGame() {
    const navigate = useNavigate();
    const { onRecordPractice, availableLetters } = useOutletContext();
    const onExit = () => navigate('/games');
    const [gameState, setGameState] = useState('intro');
    const [queue, setQueue] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [lastResult, setLastResult] = useState(null);
    const [mistakes, setMistakes] = useState([]);
    const [answeredCount, setAnsweredCount] = useState(0);

    const mapRef = useRef([]);
    const timerRef = useRef(null);
    const gameStartTimeRef = useRef(null);

    useEffect(() => {
        const fullMapping = getLetterMapping();
        if (availableLetters && availableLetters.length > 0) {
            mapRef.current = fullMapping.filter(item =>
                availableLetters.includes(item.cyrillic.charAt(0))
            );
        } else {
            mapRef.current = fullMapping;
        }
    }, [availableLetters]);

    const startGame = () => {
        const fullList = mapRef.current;
        if (fullList.length === 0) return;

        let deck = shuffleArray(fullList);
        if (deck.length < 40) {
            const extra = shuffleArray(fullList);
            deck = [...deck, ...extra];
        }

        const selectedItems = deck.slice(0, 40);
        const newQueue = selectedItems.map((item, i) => ({
            id: i,
            cyrillic: item.cyrillic.charAt(0),
            turkish: item.turkish.charAt(0).toLowerCase()
        }));

        setQueue(newQueue);
        setActiveIndex(0);
        setScore(0);
        setCombo(0);
        setMistakes([]);
        setAnsweredCount(0);
        setTimeLeft(60);
        setGameState('playing');
        setLastResult(null);
        gameStartTimeRef.current = Date.now();

        // Track game start
        trackGameStart('reflex', availableLetters);

        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    endGame();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const endGame = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        setGameState('finished');
        
        // Calculate game duration
        const duration = gameStartTimeRef.current 
            ? Math.round((Date.now() - gameStartTimeRef.current) / 1000) 
            : 60;
        
        const correctCount = answeredCount - mistakes.length;
        const accuracy = answeredCount > 0 ? (correctCount / answeredCount) * 100 : 0;
        
        // Track game end
        trackGameEnd('reflex', score, duration, {
            result: timeLeft > 0 ? 'completed' : 'timeout',
            answered_count: answeredCount,
            correct_count: correctCount,
            accuracy: Math.round(accuracy),
            max_combo: combo
        });
        
        if (onRecordPractice && answeredCount > 0) {
            onRecordPractice(answeredCount - mistakes.length, answeredCount);
        }
    };

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const handleKeyPress = (key) => {
        if (gameState !== 'playing') return;
        if (lastResult) return;

        const currentItem = queue[activeIndex];
        const input = key.toLowerCase();

        const isCorrect = input === currentItem.turkish;
        
        if (isCorrect) {
            setScore(prev => prev + 10 + (combo * 2));
            setCombo(prev => prev + 1);
            setLastResult('correct');
            setQueue(prev => prev.map((q, i) => i === activeIndex ? { ...q, result: 'correct' } : q));
        } else {
            setCombo(0);
            setLastResult('incorrect');
            setMistakes(prev => [...prev, {
                cyrillic: currentItem.cyrillic,
                correct: currentItem.turkish,
                actual: input
            }]);
            setQueue(prev => prev.map((q, i) => i === activeIndex ? { ...q, result: 'incorrect' } : q));
        }

        // Track answer
        trackGameAnswer('reflex', isCorrect, isCorrect ? combo + 1 : 0);

        setAnsweredCount(prev => prev + 1);

        setTimeout(() => {
            if (activeIndex < queue.length - 1) {
                setActiveIndex(prev => prev + 1);
            } else {
                if ((answeredCount - mistakes.length) > 0) {
                    setScore(prev => prev + Math.round(Math.random() * 100));
                }
                endGame();
            }
            setLastResult(null);
        }, 300);
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (gameState !== 'playing') return;
            if (e.metaKey || e.ctrlKey || e.altKey) return;

            if (e.key.length === 1) {
                handleKeyPress(e.key);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameState, activeIndex, queue, lastResult, combo]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    if (gameState === 'intro') {
        return (
            <div className="reflex-game-wrapper">
                <button className="game-back-btn-modern" onClick={onExit}>
                    <ArrowLeft size={18} />
                    <span>Geri</span>
                </button>

                <div className="reflex-game-intro">
                    <div className="intro-icon-wrapper">
                        <div className="intro-icon-bg" />
                        <Gamepad2 size={64} className="intro-icon" />
                    </div>

                    <h1 className="intro-title">Refleks Oyunu</h1>
                    <p className="intro-description">
                        Yukarıda çıkan Kiril harflerini klavyedeki Türkçe sesleriyle eşleştir!
                    </p>

                    <div className="intro-rules">
                        <div className="intro-rule-card">
                            <div className="rule-icon-wrapper">
                                <Zap size={24} />
                            </div>
                            <div className="rule-content">
                                <h3>Hızlı Ol</h3>
                                <p>Zamana karşı yarış</p>
                            </div>
                        </div>
                        <div className="intro-rule-card">
                            <div className="rule-icon-wrapper">
                                <Target size={24} />
                            </div>
                            <div className="rule-content">
                                <h3>Doğru Eşleştir</h3>
                                <p>Her doğru cevap puan kazandırır</p>
                            </div>
                        </div>
                        <div className="intro-rule-card">
                            <div className="rule-icon-wrapper">
                                <TrendingUp size={24} />
                            </div>
                            <div className="rule-content">
                                <h3>Combo Yap</h3>
                                <p>Ardışık doğrular bonus puan</p>
                            </div>
                        </div>
                    </div>

                    <button className="intro-start-btn" onClick={startGame}>
                        <Play size={20} />
                        <span>Oyuna Başla</span>
                    </button>
                </div>
            </div>
        );
    }

    if (gameState === 'finished') {
        const correctCount = answeredCount - mistakes.length;
        const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

        return (
            <div className="reflex-game-wrapper">
                <div className="reflex-game-result">
                    <div className="result-header">
                        <div className="result-icon-wrapper">
                            <Trophy size={48} />
                        </div>
                        <h2>Oyun Bitti!</h2>
                    </div>

                    <div className="result-score-section">
                        <div className="final-score-display">{score}</div>
                        <p className="final-score-label">TOPLAM PUAN</p>
                    </div>

                    <div className="result-stats-grid">
                        <div className="result-stat-card">
                            <div className="stat-card-icon">
                                <Target size={20} />
                            </div>
                            <div className="stat-card-value">{answeredCount}</div>
                            <div className="stat-card-label">Soru</div>
                        </div>
                        <div className="result-stat-card success">
                            <div className="stat-card-icon">
                                <CheckCircle size={20} />
                            </div>
                            <div className="stat-card-value">{correctCount}</div>
                            <div className="stat-card-label">Doğru</div>
                        </div>
                        <div className="result-stat-card error">
                            <div className="stat-card-icon">
                                <XCircle size={20} />
                            </div>
                            <div className="stat-card-value">{mistakes.length}</div>
                            <div className="stat-card-label">Yanlış</div>
                        </div>
                        <div className="result-stat-card accent">
                            <div className="stat-card-icon">
                                <TrendingUp size={20} />
                            </div>
                            <div className="stat-card-value">%{accuracy}</div>
                            <div className="stat-card-label">İsabet</div>
                        </div>
                    </div>

                    {mistakes.length > 0 && (
                        <div className="result-mistakes">
                            <h3 className="mistakes-title">Hataların</h3>
                            <div className="mistakes-grid">
                                {mistakes.map((m, i) => (
                                    <div key={i} className="mistake-card">
                                        <div className="mistake-cyrillic">{m.cyrillic}</div>
                                        <ArrowRight size={16} className="mistake-arrow" />
                                        <div className="mistake-correct">{m.correct.toUpperCase()}</div>
                                        <span className="mistake-vs">vs</span>
                                        <div className="mistake-wrong">{m.actual.toUpperCase()}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="result-actions">
                        <button className="result-btn-primary" onClick={startGame}>
                            <RotateCcw size={18} />
                            <span>Tekrar Oyna</span>
                        </button>
                        <button className="result-btn-secondary" onClick={onExit}>
                            <Home size={18} />
                            <span>Menüye Dön</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="reflex-game-playing">
            {/* Header Stats */}
            <div className="playing-header">
                <div className="playing-stat">
                    <Clock size={18} />
                    <span className="stat-value">{formatTime(timeLeft)}</span>
                </div>
                <div className="playing-stat">
                    <Trophy size={18} />
                    <span className="stat-value">{score}</span>
                </div>
                {combo > 1 && (
                    <div className="playing-stat combo">
                        <Zap size={18} />
                        <span className="stat-value">x{combo}</span>
                    </div>
                )}
            </div>

            {/* Queue */}
            <div className="playing-queue">
                {queue.map((item, idx) => {
                    if (idx < activeIndex - 2 || idx > activeIndex + 4) return null;

                    let status = 'upcoming';
                    if (item.result) status = item.result;
                    else if (idx === activeIndex) status = 'active';

                    return (
                        <div key={item.id} className={`queue-bubble ${status}`}>
                            {item.cyrillic}
                        </div>
                    );
                })}
            </div>

            {/* Active Letter */}
            <div className="playing-main">
                <div className={`active-letter-display ${lastResult || ''}`}>
                    <div className="letter-glow" />
                    <span className="letter-char">{queue[activeIndex]?.cyrillic}</span>
                </div>
            </div>

            {/* Keyboard */}
            <div className="playing-keyboard">
                <TurkishKeyboard onKeyPress={handleKeyPress} disabled={!!lastResult} />
            </div>
        </div>
    );
}
