import { useState, useRef, useEffect, useCallback } from 'react';
import { getLetterMapping } from '../utils/transliteration';

// Harfleri karıştırma
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

export default function WritingMode({ onRecordPractice }) {
    const [isStarted, setIsStarted] = useState(false);
    const [letters, setLetters] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasDrawn, setHasDrawn] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [stats, setStats] = useState({ practiced: 0 });

    const canvasRef = useRef(null);
    const contextRef = useRef(null);

    const startSession = () => {
        const mapping = getLetterMapping();
        const selected = shuffleArray(mapping).slice(0, 10);
        setLetters(selected);
        setCurrentIndex(0);
        setStats({ practiced: 0 });
        setIsStarted(true);
        setHasDrawn(false);
        setShowHint(false);
    };

    // Canvas kurulumu
    useEffect(() => {
        if (isStarted && canvasRef.current) {
            const canvas = canvasRef.current;
            const rect = canvas.getBoundingClientRect();

            // High DPI desteği
            const dpr = window.devicePixelRatio || 1;
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;

            const context = canvas.getContext('2d');
            context.scale(dpr, dpr);
            context.lineCap = 'round';
            context.lineJoin = 'round';
            context.strokeStyle = '#6366f1';
            context.lineWidth = 4;
            contextRef.current = context;

            clearCanvas();
        }
    }, [isStarted, currentIndex]);

    const clearCanvas = () => {
        if (!canvasRef.current || !contextRef.current) return;
        const canvas = canvasRef.current;
        const context = contextRef.current;
        const rect = canvas.getBoundingClientRect();

        context.fillStyle = 'var(--bg-primary)';
        context.fillRect(0, 0, rect.width, rect.height);

        // Izgara çizgileri
        context.strokeStyle = 'rgba(128, 128, 128, 0.1)';
        context.lineWidth = 1;

        // Yatay çizgi (orta)
        context.beginPath();
        context.moveTo(0, rect.height / 2);
        context.lineTo(rect.width, rect.height / 2);
        context.stroke();

        // Dikey çizgi (orta)
        context.beginPath();
        context.moveTo(rect.width / 2, 0);
        context.lineTo(rect.width / 2, rect.height);
        context.stroke();

        // Çizim stilini geri ayarla
        context.strokeStyle = '#6366f1';
        context.lineWidth = 4;

        setHasDrawn(false);
    };

    const getCoordinates = (e) => {
        if (!canvasRef.current) return { x: 0, y: 0 };
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();

        if (e.touches) {
            return {
                x: e.touches[0].clientX - rect.left,
                y: e.touches[0].clientY - rect.top
            };
        }
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    const startDrawing = useCallback((e) => {
        e.preventDefault();
        const { x, y } = getCoordinates(e);
        contextRef.current.beginPath();
        contextRef.current.moveTo(x, y);
        setIsDrawing(true);
        setHasDrawn(true);
    }, []);

    const draw = useCallback((e) => {
        if (!isDrawing) return;
        e.preventDefault();
        const { x, y } = getCoordinates(e);
        contextRef.current.lineTo(x, y);
        contextRef.current.stroke();
    }, [isDrawing]);

    const stopDrawing = useCallback(() => {
        if (isDrawing) {
            contextRef.current.closePath();
            setIsDrawing(false);
        }
    }, [isDrawing]);

    const nextLetter = () => {
        if (currentIndex < letters.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setStats(prev => ({ practiced: prev.practiced + 1 }));
            setShowHint(false);
            if (onRecordPractice) onRecordPractice(true);
        } else {
            setStats(prev => ({ practiced: prev.practiced + 1 }));
            if (onRecordPractice) onRecordPractice(true);
            setIsStarted(false);
        }
    };

    if (!isStarted) {
        return (
            <div className="writing-mode">
                <div className="writing-intro">
                    {stats.practiced > 0 ? (
                        <>
                            <div className="writing-result-icon">✍️</div>
                            <h2>Tebrikler!</h2>
                            <p className="writing-result-text">
                                <strong>{stats.practiced}</strong> Kiril harfi yazdınız!
                            </p>
                            <p className="writing-tip">
                                El yazısı pratiği motor belleğinizi güçlendirir ve harfleri daha hızlı tanımanızı sağlar.
                            </p>
                            <button className="writing-btn primary" onClick={startSession}>
                                Tekrar Dene
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="writing-intro-icon">✍️</div>
                            <h2>El Yazısı Modu</h2>
                            <p>Kiril harflerini el ile yazarak öğrenin.</p>
                            <div className="writing-how">
                                <div className="how-step">
                                    <span className="step-num">1</span>
                                    <span>Size gösterilen harfi çizin</span>
                                </div>
                                <div className="how-step">
                                    <span className="step-num">2</span>
                                    <span>İpucu için örneği görebilirsiniz</span>
                                </div>
                                <div className="how-step">
                                    <span className="step-num">3</span>
                                    <span>Sonraki harfe geçin</span>
                                </div>
                            </div>
                            <button className="writing-btn primary" onClick={startSession}>
                                Başla
                            </button>
                        </>
                    )}
                </div>
            </div>
        );
    }

    const currentLetter = letters[currentIndex];
    const progressPercent = (currentIndex / letters.length) * 100;

    return (
        <div className="writing-mode">
            <div className="writing-card">
                {/* İlerleme çubuğu */}
                <div className="writing-progress">
                    <div className="writing-progress-bar">
                        <div
                            className="writing-progress-fill"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                    <span className="writing-progress-text">{currentIndex + 1}/{letters.length}</span>
                </div>

                {/* Hedef harf */}
                <div className="writing-target">
                    <div className="target-label">Bu harfi yazın:</div>
                    <div className="target-letters">
                        <span className="target-turkish">{currentLetter.turkish}</span>
                        <span className="target-arrow">→</span>
                        <span className="target-cyrillic">{currentLetter.cyrillic}</span>
                    </div>
                </div>

                {/* İpucu butonu */}
                <button
                    className={`hint-btn ${showHint ? 'active' : ''}`}
                    onClick={() => setShowHint(!showHint)}
                >
                    {showHint ? '👁️ İpucunu Gizle' : '💡 İpucu Göster'}
                </button>

                {/* İpucu overlay - büyük örnek harf */}
                {showHint && (
                    <div className="writing-hint-overlay">
                        <span className="hint-letter">{currentLetter.cyrillic}</span>
                    </div>
                )}

                {/* Canvas */}
                <div className="canvas-container">
                    <canvas
                        ref={canvasRef}
                        className="writing-canvas"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                    />
                </div>

                {/* Butonlar */}
                <div className="writing-actions">
                    <button
                        className="writing-btn secondary"
                        onClick={clearCanvas}
                    >
                        🗑️ Temizle
                    </button>
                    <button
                        className="writing-btn primary"
                        onClick={nextLetter}
                        disabled={!hasDrawn}
                    >
                        {currentIndex < letters.length - 1 ? 'Sonraki →' : 'Bitir ✓'}
                    </button>
                </div>

                {/* İstatistik */}
                <div className="writing-stats">
                    <div className="writing-stat">
                        <span className="stat-value">{stats.practiced}</span>
                        <span className="stat-label">Yazılan</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
