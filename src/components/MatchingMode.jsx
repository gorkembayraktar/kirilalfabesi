import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, PartyPopper, ThumbsUp, Award, ArrowRight, Check, RotateCcw } from 'lucide-react';
import { getLetterMapping } from '../utils/transliteration';

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

export default function MatchingMode({ onRecordPractice }) {
    const [isStarted, setIsStarted] = useState(false);
    const [cyrillicLetters, setCyrillicLetters] = useState([]);
    const [turkishLetters, setTurkishLetters] = useState([]);
    const [connections, setConnections] = useState({});
    const [dragging, setDragging] = useState(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [result, setResult] = useState(null);
    const containerRef = useRef(null);
    const cyrillicRefs = useRef([]);
    const turkishRefs = useRef([]);
    const cyrillicHandleRefs = useRef([]);
    const turkishHandleRefs = useRef([]);

    const startSession = () => {
        const mapping = getLetterMapping();
        const selected = shuffleArray(mapping).slice(0, 5);

        setCyrillicLetters(selected.map((item, idx) => ({
            id: idx,
            letter: item.cyrillic,
            correctTurkish: item.turkish.toLowerCase()
        })));

        setTurkishLetters(shuffleArray(selected.map((item, idx) => ({
            id: idx,
            letter: item.turkish.toLowerCase(),
            originalCyrillicId: idx
        }))));

        setConnections({});
        setResult(null);
        setIsStarted(true);
    };

    const getElementCenter = (element) => {
        if (!element || !containerRef.current) return { x: 0, y: 0 };
        const rect = element.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        return {
            x: rect.left + rect.width / 2 - containerRect.left,
            y: rect.top + rect.height / 2 - containerRect.top
        };
    };

    const updateMousePos = useCallback((e) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        setMousePos({
            x: clientX - rect.left,
            y: clientY - rect.top
        });
    }, []);

    const handleDragEnd = useCallback((e) => {
        if (!dragging) return;

        const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
        const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;

        for (let i = 0; i < turkishRefs.current.length; i++) {
            const ref = turkishRefs.current[i];
            if (ref) {
                const rect = ref.getBoundingClientRect();
                if (
                    clientX >= rect.left &&
                    clientX <= rect.right &&
                    clientY >= rect.top &&
                    clientY <= rect.bottom
                ) {
                    const newConnections = { ...connections };
                    for (const [key, value] of Object.entries(newConnections)) {
                        if (value === i) {
                            delete newConnections[key];
                        }
                    }
                    newConnections[dragging.cyrillicIndex] = i;
                    setConnections(newConnections);
                    break;
                }
            }
        }

        setDragging(null);
    }, [dragging, connections]);

    useEffect(() => {
        if (dragging) {
            const handleMove = (e) => {
                e.preventDefault();
                updateMousePos(e);
            };

            window.addEventListener('mousemove', handleMove);
            window.addEventListener('mouseup', handleDragEnd);
            window.addEventListener('touchmove', handleMove, { passive: false });
            window.addEventListener('touchend', handleDragEnd);

            return () => {
                window.removeEventListener('mousemove', handleMove);
                window.removeEventListener('mouseup', handleDragEnd);
                window.removeEventListener('touchmove', handleMove);
                window.removeEventListener('touchend', handleDragEnd);
            };
        }
    }, [dragging, updateMousePos, handleDragEnd]);

    const handleDragStart = (cyrillicIndex, e) => {
        e.preventDefault();

        // Mevcut bağlantıyı kaldır
        if (connections[cyrillicIndex] !== undefined) {
            const newConnections = { ...connections };
            delete newConnections[cyrillicIndex];
            setConnections(newConnections);
        }

        setDragging({ cyrillicIndex });
        updateMousePos(e);
    };

    const checkAnswers = () => {
        let correct = 0;
        let incorrect = 0;

        cyrillicLetters.forEach((cyrillic, cyrillicIdx) => {
            const connectedTurkishIdx = connections[cyrillicIdx];
            if (connectedTurkishIdx !== undefined) {
                const connectedTurkish = turkishLetters[connectedTurkishIdx];
                if (connectedTurkish.originalCyrillicId === cyrillicIdx) {
                    correct++;
                } else {
                    incorrect++;
                }
            }
        });

        const total = cyrillicLetters.length;
        setResult({ correct, incorrect, total, notConnected: total - correct - incorrect });

        if (onRecordPractice) {
            for (let i = 0; i < correct; i++) {
                onRecordPractice(true);
            }
            for (let i = 0; i < incorrect; i++) {
                onRecordPractice(false);
            }
        }
    };

    // Yerçekimli ip eğrisi hesaplama
    const getRopePath = (start, end, sag = 0.15) => {
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Orta nokta
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2;

        // Yerçekimi etkisi - mesafeye göre sarkma
        const gravity = distance * sag;
        const controlY = midY + gravity;

        return `M ${start.x} ${start.y} Q ${midX} ${controlY} ${end.x} ${end.y}`;
    };

    // Sarkan ip (bağlı değilken)
    const getDanglingRopePath = (start, length = 40) => {
        const endX = start.x + 15;
        const endY = start.y + length;
        const controlX = start.x + 25;
        const controlY = start.y + length * 0.7;

        return `M ${start.x} ${start.y} Q ${controlX} ${controlY} ${endX} ${endY}`;
    };

    const renderConnections = () => {
        const paths = [];

        // Bağlı olmayan Kiril harflerden sarkan ipler
        cyrillicLetters.forEach((item, idx) => {
            const isConnected = connections[idx] !== undefined;
            const isDragging = dragging?.cyrillicIndex === idx;

            if (!isConnected && !isDragging && !result) {
                const handleEl = cyrillicHandleRefs.current[idx];
                if (handleEl) {
                    const start = getElementCenter(handleEl);
                    paths.push(
                        <path
                            key={`dangling-${idx}`}
                            d={getDanglingRopePath(start, 35)}
                            className="match-rope dangling"
                        />
                    );
                }
            }
        });

        // Bağlı ipler
        Object.entries(connections).forEach(([cyrillicIdx, turkishIdx]) => {
            const cyrillicHandleEl = cyrillicHandleRefs.current[cyrillicIdx];
            const turkishHandleEl = turkishHandleRefs.current[turkishIdx];

            if (cyrillicHandleEl && turkishHandleEl) {
                const start = getElementCenter(cyrillicHandleEl);
                const end = getElementCenter(turkishHandleEl);

                let pathClass = 'match-rope';
                if (result) {
                    const turkish = turkishLetters[turkishIdx];
                    if (turkish.originalCyrillicId === parseInt(cyrillicIdx)) {
                        pathClass += ' correct';
                    } else {
                        pathClass += ' incorrect';
                    }
                }

                paths.push(
                    <path
                        key={`connection-${cyrillicIdx}`}
                        d={getRopePath(start, end, 0.2)}
                        className={pathClass}
                    />
                );
            }
        });

        // Sürüklenen ip
        if (dragging) {
            const handleEl = cyrillicHandleRefs.current[dragging.cyrillicIndex];
            if (handleEl) {
                const start = getElementCenter(handleEl);
                paths.push(
                    <path
                        key="dragging-rope"
                        d={getRopePath(start, mousePos, 0.25)}
                        className="match-rope dragging"
                    />
                );
            }
        }

        return paths;
    };

    if (!isStarted) {
        return (
            <div className="match-mode">
                <div className="match-intro">
                    {result ? (
                        <>
                            <div className="match-result-icon">
                                {result.correct === result.total ? <PartyPopper size={64} style={{ color: 'var(--primary)' }} /> : result.correct > result.total / 2 ? <ThumbsUp size={64} color="#3b82f6" /> : <Award size={64} color="#f59e0b" />}
                            </div>
                            <h2>{result.correct === result.total ? 'Mükemmel!' : 'Sonuçlar'}</h2>
                            <div className="match-result-grid">
                                <div className="match-result-stat success">
                                    <span className="num">{result.correct}</span>
                                    <span className="label">Doğru</span>
                                </div>
                                <div className="match-result-stat danger">
                                    <span className="num">{result.incorrect}</span>
                                    <span className="label">Yanlış</span>
                                </div>
                                <div className="match-result-stat muted">
                                    <span className="num">{result.notConnected}</span>
                                    <span className="label">Boş</span>
                                </div>
                            </div>
                            <div className="match-score">%{Math.round((result.correct / result.total) * 100)} Başarı</div>

                            {/* Yanlış cevapların doğruları */}
                            {(result.incorrect > 0 || result.notConnected > 0) && (
                                <div className="match-corrections">
                                    <div className="corrections-title">Doğru Eşleşmeler:</div>
                                    <div className="corrections-list">
                                        {cyrillicLetters.map((cyrillic, idx) => {
                                            const connectedTurkishIdx = connections[idx];
                                            const isWrong = connectedTurkishIdx !== undefined &&
                                                turkishLetters[connectedTurkishIdx].originalCyrillicId !== idx;
                                            const isNotConnected = connectedTurkishIdx === undefined;

                                            if (isWrong || isNotConnected) {
                                                return (
                                                    <div key={idx} className={`correction-item ${isWrong ? 'wrong' : 'missed'}`}>
                                                        <span className="correction-cyrillic">{cyrillic.letter}</span>
                                                        <span className="correction-arrow"><ArrowRight size={16} /></span>
                                                        <span className="correction-turkish">{cyrillic.correctTurkish}</span>
                                                        {isWrong && (
                                                            <span className="correction-wrong">
                                                                (yazdığınız: {turkishLetters[connectedTurkishIdx].letter})
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })}
                                    </div>
                                </div>
                            )}

                            <button className="match-btn primary" onClick={startSession}>
                                Tekrar Dene
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="match-intro-icon"><Link size={64} style={{ color: 'var(--primary)' }} /></div>
                            <h2>Eşleştirme Modu</h2>
                            <p>Kiril harfleri doğru Türkçe karşılıklarıyla eşleştirin.</p>
                            <div className="match-how">
                                <div className="how-step">
                                    <span className="step-num">1</span>
                                    <span>Kiril harfin yanındaki noktayı basılı tutun</span>
                                </div>
                                <div className="how-step">
                                    <span className="step-num">2</span>
                                    <span>Sürükleyip Türkçe harfe bırakın</span>
                                </div>
                                <div className="how-step">
                                    <span className="step-num">3</span>
                                    <span>Tümünü bağlayıp doğrulayın</span>
                                </div>
                            </div>
                            <button className="match-btn primary" onClick={startSession}>
                                Başla
                            </button>
                        </>
                    )}
                </div>
            </div>
        );
    }

    const connectedCount = Object.keys(connections).length;
    const totalCount = cyrillicLetters.length;

    return (
        <div className="match-mode">
            <div className="match-game" ref={containerRef}>
                <svg className="match-svg">
                    {renderConnections()}
                </svg>

                <div className="match-column left">
                    <div className="match-column-header">Kiril</div>
                    {cyrillicLetters.map((item, idx) => {
                        const isConnected = connections[idx] !== undefined;
                        const isDragging = dragging?.cyrillicIndex === idx;
                        let stateClass = '';
                        if (result && isConnected) {
                            const turkish = turkishLetters[connections[idx]];
                            stateClass = turkish.originalCyrillicId === idx ? 'correct' : 'incorrect';
                        }
                        return (
                            <div
                                key={item.id}
                                className={`match-item cyrillic ${isConnected ? 'connected' : ''} ${isDragging ? 'dragging' : ''} ${stateClass}`}
                                ref={(el) => (cyrillicRefs.current[idx] = el)}
                            >
                                <span className="match-letter">{item.letter}</span>
                                <div
                                    className={`match-handle ${isConnected ? 'connected' : ''} ${isDragging ? 'active' : ''}`}
                                    ref={(el) => (cyrillicHandleRefs.current[idx] = el)}
                                    onMouseDown={(e) => !result && handleDragStart(idx, e)}
                                    onTouchStart={(e) => !result && handleDragStart(idx, e)}
                                >
                                    <span className="handle-dot"></span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="match-column right">
                    <div className="match-column-header">Türkçe</div>
                    {turkishLetters.map((item, idx) => {
                        const isConnected = Object.values(connections).includes(idx);
                        let stateClass = '';
                        if (result && isConnected) {
                            const isCorrect = Object.entries(connections).some(([cIdx, tIdx]) =>
                                tIdx === idx && turkishLetters[tIdx].originalCyrillicId === parseInt(cIdx)
                            );
                            stateClass = isCorrect ? 'correct' : 'incorrect';
                        }
                        return (
                            <div
                                key={item.id}
                                className={`match-item turkish ${isConnected ? 'connected' : ''} ${dragging ? 'target' : ''} ${stateClass}`}
                                ref={(el) => (turkishRefs.current[idx] = el)}
                            >
                                <div
                                    className={`match-handle ${isConnected ? 'connected' : ''}`}
                                    ref={(el) => (turkishHandleRefs.current[idx] = el)}
                                >
                                    <span className="handle-dot"></span>
                                </div>
                                <span className="match-letter">{item.letter}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="match-footer">
                <div className="match-progress">
                    <div className="match-progress-bar">
                        <div
                            className="match-progress-fill"
                            style={{ width: `${(connectedCount / totalCount) * 100}%` }}
                        />
                    </div>
                    <span className="match-progress-text">{connectedCount}/{totalCount}</span>
                </div>

                <div className="match-actions">
                    {!result ? (
                        <>
                            <button
                                className="match-btn secondary"
                                onClick={() => setConnections({})}
                                disabled={connectedCount === 0}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}
                            >
                                <RotateCcw size={16} /> Sıfırla
                            </button>
                            <button
                                className="match-btn primary"
                                onClick={checkAnswers}
                                disabled={connectedCount < totalCount}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}
                            >
                                Doğrula <Check size={18} />
                            </button>
                        </>
                    ) : (
                        <>
                            <button className="match-btn secondary" onClick={() => { setResult(null); setConnections({}); }}>
                                Tekrar
                            </button>
                            <button className="match-btn primary" onClick={() => setIsStarted(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                                Bitir <ArrowRight size={18} />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
