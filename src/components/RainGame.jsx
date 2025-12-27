import { useState, useEffect, useRef } from 'react';
import { CloudRain, Heart, ArrowLeft, RotateCcw, Home, Play, Trophy, Target, Zap } from 'lucide-react';
import { getLetterMapping } from '../utils/transliteration';
import TurkishKeyboard from './TurkishKeyboard';

export default function RainGame({ onExit, availableLetters }) {
    const [gameStatus, setGameStatus] = useState('intro');
    const [hudState, setHudState] = useState({ score: 0, lives: 3, level: 1 });
    const canvasRef = useRef(null);
    const requestRef = useRef();
    const isPlayingRef = useRef(false);

    const gameStateRef = useRef({
        score: 0,
        lives: 3,
        level: 1,
        items: [],
        particles: [],
        lastTime: 0,
        spawnTimer: 0,
        width: 0,
        height: 0
    });

    const letterMapRef = useRef([]);

    useEffect(() => {
        const fullMapping = getLetterMapping();
        if (availableLetters && availableLetters.length > 0) {
            letterMapRef.current = fullMapping.filter(item =>
                availableLetters.includes(item.cyrillic.charAt(0))
            );
        } else {
            letterMapRef.current = fullMapping;
        }
    }, [availableLetters]);

    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current && canvasRef.current.parentElement) {
                const parent = canvasRef.current.parentElement;
                canvasRef.current.width = parent.clientWidth;
                canvasRef.current.height = parent.clientHeight;
                gameStateRef.current.width = parent.clientWidth;
                gameStateRef.current.height = parent.clientHeight;
            }
        };

        window.addEventListener('resize', handleResize);
        if (gameStatus === 'playing') {
            handleResize();
        }
        return () => window.removeEventListener('resize', handleResize);
    }, [gameStatus]);

    const startGame = () => {
        setGameStatus('playing');
        isPlayingRef.current = true;
        setHudState({ score: 0, lives: 3, level: 1 });

        gameStateRef.current = {
            score: 0,
            lives: 3,
            level: 1,
            items: [],
            particles: [],
            lastTime: performance.now(),
            spawnTimer: 2000,
            width: 0,
            height: 0
        };

        setTimeout(() => {
            if (canvasRef.current && canvasRef.current.parentElement) {
                const parent = canvasRef.current.parentElement;
                canvasRef.current.width = parent.clientWidth;
                canvasRef.current.height = parent.clientHeight;
                gameStateRef.current.width = parent.clientWidth;
                gameStateRef.current.height = parent.clientHeight;
            }
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            requestRef.current = requestAnimationFrame(gameLoop);
        }, 50);
    };

    const endGame = () => {
        setGameStatus('finished');
        isPlayingRef.current = false;
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };

    const spawnItem = () => {
        const state = gameStateRef.current;
        const fullList = letterMapRef.current;
        if (fullList.length === 0 || state.width === 0) return;

        const randomItem = fullList[Math.floor(Math.random() * fullList.length)];
        const margin = 50;
        const x = Math.random() * (state.width - margin * 2) + margin;

        const newItem = {
            id: Date.now() + Math.random(),
            cyrillic: randomItem.cyrillic,
            turkish: randomItem.turkish.charAt(0).toLowerCase(),
            x: x,
            y: -40,
            speed: 1.5 + (state.level * 0.3),
            size: 32,
            color: '#ffffff'
        };

        state.items.push(newItem);
    };

    const createExplosion = (x, y, color) => {
        for (let i = 0; i < 8; i++) {
            gameStateRef.current.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                life: 1.0,
                color
            });
        }
    };

    const update = (time) => {
        const state = gameStateRef.current;
        const deltaTime = time - state.lastTime;
        state.lastTime = time;

        state.spawnTimer += deltaTime;
        const spawnInterval = Math.max(600, 2000 - (state.level * 150));

        if (state.spawnTimer > spawnInterval) {
            spawnItem();
            state.spawnTimer = 0;
        }

        for (let i = state.items.length - 1; i >= 0; i--) {
            const item = state.items[i];
            item.y += item.speed * (deltaTime / 16);

            if (item.y > state.height + 20) {
                state.lives -= 1;
                setHudState(prev => ({ ...prev, lives: state.lives }));
                state.items.splice(i, 1);
                if (state.lives <= 0) {
                    endGame();
                    return;
                }
            }
        }

        for (let i = state.particles.length - 1; i >= 0; i--) {
            const p = state.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.05;
            if (p.life <= 0) state.particles.splice(i, 1);
        }
    };

    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const state = gameStateRef.current;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.font = 'bold 36px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        state.items.forEach(item => {
            ctx.shadowBlur = 10;
            ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
            ctx.fillStyle = item.color;
            ctx.fillText(item.cyrillic, item.x, item.y);
            ctx.shadowBlur = 0;
        });

        state.particles.forEach(p => {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
        });
    };

    const gameLoop = (time) => {
        if (!isPlayingRef.current) return;

        update(time);

        if (isPlayingRef.current) {
            draw();
            requestRef.current = requestAnimationFrame(gameLoop);
        }
    };

    const handleInput = (char) => {
        if (!isPlayingRef.current) return;

        const state = gameStateRef.current;
        const inputChar = char.toLowerCase();

        const sortedIndices = state.items
            .map((item, index) => ({ ...item, index }))
            .sort((a, b) => b.y - a.y);

        const hitItem = sortedIndices.find(item => item.turkish === inputChar);

        if (hitItem) {
            state.score += 10;
            if (state.score % 100 === 0) {
                state.level += 1;
            }
            setHudState(prev => ({ ...prev, score: state.score, level: state.level }));

            const originalIndex = state.items.findIndex(i => i.id === hitItem.id);
            if (originalIndex !== -1) {
                const item = state.items[originalIndex];
                createExplosion(item.x, item.y, '#4eff4e');
                state.items.splice(originalIndex, 1);
            }
        }
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isPlayingRef.current) return;
            if (e.metaKey || e.ctrlKey || e.altKey) return;
            if (e.key.length === 1) {
                handleInput(e.key);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    if (gameStatus === 'intro') {
        return (
            <div className="rain-game-wrapper">
                <button className="game-back-btn-modern" onClick={onExit}>
                    <ArrowLeft size={18} />
                    <span>Geri</span>
                </button>

                <div className="rain-game-intro">
                    <div className="intro-icon-wrapper rain">
                        <div className="intro-icon-bg" />
                        <CloudRain size={64} className="intro-icon" />
                    </div>

                    <h1 className="intro-title">Yağmur Oyunu</h1>
                    <p className="intro-description">
                        Harfler yere düşmeden onları yakala! Doğru tuşa basarak harfleri yok et.
                    </p>

                    <div className="intro-rules">
                        <div className="intro-rule-card">
                            <div className="rule-icon-wrapper">
                                <CloudRain size={24} />
                            </div>
                            <div className="rule-content">
                                <h3>Hızlı Yakala</h3>
                                <p>Harfler yere düşmeden yakala</p>
                            </div>
                        </div>
                        <div className="intro-rule-card">
                            <div className="rule-icon-wrapper">
                                <Heart size={24} />
                            </div>
                            <div className="rule-content">
                                <h3>Canlarını Koru</h3>
                                <p>3 canın var, dikkatli ol</p>
                            </div>
                        </div>
                        <div className="intro-rule-card">
                            <div className="rule-icon-wrapper">
                                <Target size={24} />
                            </div>
                            <div className="rule-content">
                                <h3>Seviye Atlar</h3>
                                <p>Her 100 puanda seviye artar</p>
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

    if (gameStatus === 'finished') {
        return (
            <div className="rain-game-wrapper">
                <div className="rain-game-result">
                    <div className="result-header">
                        <div className="result-icon-wrapper">
                            <Trophy size={48} />
                        </div>
                        <h2>Oyun Bitti!</h2>
                    </div>

                    <div className="result-score-section">
                        <div className="final-score-display">{gameStateRef.current.score}</div>
                        <p className="final-score-label">TOPLAM PUAN</p>
                    </div>

                    <div className="result-stats-grid">
                        <div className="result-stat-card accent">
                            <div className="stat-card-icon">
                                <Trophy size={20} />
                            </div>
                            <div className="stat-card-value">{gameStateRef.current.score}</div>
                            <div className="stat-card-label">Puan</div>
                        </div>
                        <div className="result-stat-card">
                            <div className="stat-card-icon">
                                <Target size={20} />
                            </div>
                            <div className="stat-card-value">{gameStateRef.current.level}</div>
                            <div className="stat-card-label">Seviye</div>
                        </div>
                    </div>

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
        <div className="rain-game-playing">
            {/* HUD */}
            <div className="rain-hud">
                <div className="hud-item">
                    <Trophy size={18} />
                    <span className="hud-value">{hudState.score}</span>
                </div>
                <div className="hud-item lives">
                    {[...Array(3)].map((_, i) => (
                        <Heart
                            key={i}
                            size={24}
                            fill={i < hudState.lives ? "#ef4444" : "#374151"}
                            color={i < hudState.lives ? "#ef4444" : "#4b5563"}
                        />
                    ))}
                </div>
                <div className="hud-item">
                    <Target size={18} />
                    <span className="hud-value">Seviye {hudState.level}</span>
                </div>
            </div>

            {/* Canvas */}
            <div className="rain-canvas-container">
                <canvas ref={canvasRef} className="rain-canvas" />
            </div>

            {/* Keyboard */}
            <div className="rain-keyboard">
                <TurkishKeyboard onKeyPress={handleInput} />
            </div>
        </div>
    );
}
