import { useState, useEffect, useRef } from 'react';
import { getLetterMapping } from '../utils/transliteration';
import TurkishKeyboard from './TurkishKeyboard';

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

export default function ReflexGame({ onExit, availableLetters }) {
    const [gameState, setGameState] = useState('intro'); // intro, playing, finished
    const [queue, setQueue] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [lastResult, setLastResult] = useState(null); // 'correct', 'incorrect', null
    const [mistakes, setMistakes] = useState([]); // [{ cyrillic, correct, actual }]
    const [answeredCount, setAnsweredCount] = useState(0); // Track total answered questions

    const mapRef = useRef([]);
    const timerRef = useRef(null);

    // Initialize letter mapping
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

        // Shuffle full list to get unique items random order
        let deck = shuffleArray(fullList);

        // If we want a longer game (e.g. 40 items) but alphabet is ~33,
        // we add a second shuffled deck to fill the rest.
        if (deck.length < 40) {
            const extra = shuffleArray(fullList);
            deck = [...deck, ...extra];
        }

        // Take first 40 (or however many)
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

        // Start Timer
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
    };

    // Cleanup timer
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const handleKeyPress = (key) => {
        if (gameState !== 'playing') return;

        // Prevent spamming
        if (lastResult) return;

        const currentItem = queue[activeIndex];
        const input = key.toLowerCase();

        if (input === currentItem.turkish) {
            // Correct
            setScore(prev => prev + 10 + (combo * 2));
            setCombo(prev => prev + 1);
            setLastResult('correct');
            // Mark as correct in queue
            setQueue(prev => prev.map((q, i) => i === activeIndex ? { ...q, result: 'correct' } : q));
        } else {
            // Incorrect
            setCombo(0);
            setLastResult('incorrect');
            setMistakes(prev => [...prev, {
                cyrillic: currentItem.cyrillic,
                correct: currentItem.turkish,
                actual: input
            }]);
            // Mark as incorrect in queue
            setQueue(prev => prev.map((q, i) => i === activeIndex ? { ...q, result: 'incorrect' } : q));
        }

        // Increment answered count
        setAnsweredCount(prev => prev + 1);

        // Always move to next item (Wait slightly for visual feedback)
        setTimeout(() => {
            if (activeIndex < queue.length - 1) {
                setActiveIndex(prev => prev + 1);
            } else {
                if ((answeredCount - mistakes.length) > 0) {
                    setScore(prev => prev + Math.round(Math.random() * 100)); // Bonus for finishing
                }
                endGame();
            }
            setLastResult(null);
        }, 300);
    };

    // Handle physical keyboard input
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (gameState !== 'playing') return;
            // Ignore modifiers
            if (e.metaKey || e.ctrlKey || e.altKey) return;

            if (e.key.length === 1) {
                handleKeyPress(e.key);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameState, activeIndex, queue, lastResult]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    if (gameState === 'intro') {
        return (
            <div className="game-intro">
                <button className="game-back-btn" onClick={onExit}>← Geri</button>
                <div className="game-icon">🎮</div>
                <h2>Refleks Oyunu</h2>
                <p>Yukarıda çıkan Kiril harfeleriye klavyedeki Türkçe sesleri eşleştir!</p>
                <div className="game-rules">
                    <div className="rule">
                        <span className="rule-icon">⚡</span>
                        <span>Hızlı Ol</span>
                    </div>
                    <div className="rule">
                        <span className="rule-icon">⏩</span>
                        <span>Yanlışta Geçer</span>
                    </div>
                </div>
                <button className="game-btn-start" onClick={startGame}>Oyuna Başla</button>
            </div>
        );
    }

    if (gameState === 'finished') {
        const correctCount = answeredCount - mistakes.length;
        const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

        return (
            <div className="game-result">
                <h2>Oyun Bitti!</h2>
                <div className="final-score">{score}</div>
                <p className="final-label">TOPLAM PUAN</p>

                <div className="result-stats-row">
                    <div className="result-stat-item">
                        <div className="stat-val">{answeredCount}</div>
                        <div className="stat-lbl">Soru</div>
                    </div>
                    <div className="result-stat-item">
                        <div className="stat-val" style={{ color: 'var(--success)' }}>{correctCount}</div>
                        <div className="stat-lbl">Doğru</div>
                    </div>
                    <div className="result-stat-item">
                        <div className="stat-val" style={{ color: 'var(--error)' }}>{mistakes.length}</div>
                        <div className="stat-lbl">Yanlış</div>
                    </div>
                    <div className="result-stat-item">
                        <div className="stat-val">%{accuracy}</div>
                        <div className="stat-lbl">İsabet</div>
                    </div>
                </div>

                {mistakes.length > 0 && (
                    <div className="mistakes-section">
                        <h3>Hataların</h3>
                        <div className="mistakes-list">
                            {mistakes.map((m, i) => (
                                <div key={i} className="mistake-item">
                                    <div className="mistake-char cyrillic">{m.cyrillic}</div>
                                    <div className="mistake-arrow">→</div>
                                    <div className="mistake-char correct" title="Olması Gereken">{m.correct.toUpperCase()}</div>
                                    <div className="mistake-sep">vs</div>
                                    <div className="mistake-char incorrect" title="Senin Yanıtın">{m.actual.toUpperCase()}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="game-actions">
                    <button className="game-btn-restart" onClick={startGame}>Tekrar Oyna</button>
                    <button className="game-btn-secondary" onClick={onExit} style={{ marginTop: '1rem' }}>Menüye Dön</button>
                </div>
            </div>
        );
    }

    return (
        <div className="game-container">
            {/* Top Section: Queue Bubbles */}
            <div className="game-queue">
                {queue.map((item, idx) => {
                    // Show window
                    if (idx < activeIndex - 2 || idx > activeIndex + 4) return null;

                    let status = 'upcoming';
                    if (item.result) status = item.result;
                    else if (idx === activeIndex) status = 'active';

                    return (
                        <div key={item.id} className={`game-bubble ${status}`}>
                            {item.cyrillic}
                        </div>
                    );
                })}
            </div>

            {/* Middle Section: Active Letter & Timer */}
            <div className="game-middle">
                <div className="game-timer">{formatTime(timeLeft)}</div>

                <div className={`game-active-letter ${lastResult ? lastResult : ''}`}>
                    {queue[activeIndex]?.cyrillic}
                </div>

                <div className="game-stats">
                    <span>Puan: {score}</span>
                    {combo > 1 && <span className="game-combo">x{combo}</span>}
                </div>
            </div>

            {/* Bottom: Keyboard */}
            <div className="game-bottom">
                <TurkishKeyboard onKeyPress={handleKeyPress} disabled={!!lastResult} />
            </div>
        </div>
    );
}
