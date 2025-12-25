import { useState, useEffect, useRef } from 'react';
import { CloudRain, Heart, ArrowLeft, RotateCcw, Home } from 'lucide-react';
import { getLetterMapping } from '../utils/transliteration';
import TurkishKeyboard from './TurkishKeyboard';

export default function RainGame({ onExit, availableLetters }) {
    const [gameStatus, setGameStatus] = useState('intro'); // intro, playing, finished
    const [hudState, setHudState] = useState({ score: 0, lives: 3, level: 1 });
    const canvasRef = useRef(null);
    const requestRef = useRef();
    const isPlayingRef = useRef(false);

    // Game State in Refs (mutable, no re-renders)
    const gameStateRef = useRef({
        score: 0,
        lives: 3,
        level: 1,
        items: [], // { id, x, y, char, turkish, speed, ... }
        particles: [], // { x, y, vx, vy, life, color }
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

    // Handling Canvas Resize
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

        // Initial sizing if playing (canvas exists)
        if (gameStatus === 'playing') {
            handleResize();
        }

        return () => window.removeEventListener('resize', handleResize);
    }, [gameStatus]);

    const startGame = () => {
        setGameStatus('playing');
        isPlayingRef.current = true;
        setHudState({ score: 0, lives: 3, level: 1 });

        // Reset State
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

        // Initialize canvas size immediately & Start Loop
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

        // Spawn Logic
        state.spawnTimer += deltaTime;
        const spawnInterval = Math.max(600, 2000 - (state.level * 150));

        if (state.spawnTimer > spawnInterval) {
            spawnItem();
            state.spawnTimer = 0;
        }

        // Update Items
        for (let i = state.items.length - 1; i >= 0; i--) {
            const item = state.items[i];
            item.y += item.speed * (deltaTime / 16);

            // Hit bottom
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

        // Update Particles
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

        // Draw Items
        ctx.font = 'bold 36px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        state.items.forEach(item => {
            // Glow effect
            ctx.shadowBlur = 10;
            ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
            ctx.fillStyle = item.color;
            ctx.fillText(item.cyrillic, item.x, item.y);
            ctx.shadowBlur = 0; // Reset
        });

        // Draw Particles
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

        // Sort items by Y position (lowest first) to hit the one closest to bottom
        const sortedIndices = state.items
            .map((item, index) => ({ ...item, index }))
            .sort((a, b) => b.y - a.y);

        const hitItem = sortedIndices.find(item => item.turkish === inputChar);

        if (hitItem) {
            state.score += 10;
            if (state.score % 100 === 0) {
                state.level += 1;
            }
            // Update HUD state
            setHudState(prev => ({ ...prev, score: state.score, level: state.level }));

            const originalIndex = state.items.findIndex(i => i.id === hitItem.id);
            if (originalIndex !== -1) {
                const item = state.items[originalIndex];
                createExplosion(item.x, item.y, '#4eff4e');
                state.items.splice(originalIndex, 1);
            }
        }
    };

    // Keyboard Listener
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

    // Renders
    if (gameStatus === 'intro') {
        return (
            <div className="game-container rain-mode">
                <div className="game-intro">
                    <button className="game-back-btn" onClick={onExit} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ArrowLeft size={16} /> Geri
                    </button>
                    <div className="game-icon">
                        <CloudRain size={64} color="#60a5fa" />
                    </div>
                    <h2>Yağmur Oyunu</h2>
                    <p>Harfler yere düşmeden onları yakala!</p>
                    <p className="game-hint">Puan ve can durumunu ekranın üstünde görebilirsin.</p>
                    <button className="game-btn-start" onClick={startGame}>Başla</button>
                </div>
            </div>
        );
    }

    if (gameStatus === 'finished') {
        return (
            <div className="game-container rain-mode">
                <div className="game-result">
                    <h2>Oyun Bitti!</h2>
                    <div className="final-score">{gameStateRef.current.score}</div>
                    <div className="game-actions">
                        <button className="game-btn-restart" onClick={startGame} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                            <RotateCcw size={18} /> Tekrar Oyna
                        </button>
                        <button className="game-btn-secondary" onClick={onExit} style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                            <Home size={18} /> Menüye Dön
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="game-container rain-mode" style={{ display: 'flex', flexDirection: 'column', height: '600px', overflow: 'hidden', position: 'relative' }}>
            {/* HUD Overlay */}
            <div className="game-hud" style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                padding: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                pointerEvents: 'none',
                zIndex: 10
            }}>
                <div className="hud-score" style={{ color: 'white', fontWeight: 'bold', fontSize: '1.5rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                    Puan: {hudState.score}
                </div>

                <div className="hud-lives" style={{ display: 'flex', gap: '4px' }}>
                    {[...Array(3)].map((_, i) => (
                        <Heart
                            key={i}
                            size={24}
                            fill={i < hudState.lives ? "#ef4444" : "#374151"}
                            color={i < hudState.lives ? "#ef4444" : "#4b5563"}
                        />
                    ))}
                </div>

                <div className="hud-level" style={{ color: 'white', fontWeight: 'bold', fontSize: '1.2rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                    Seviye: {hudState.level}
                </div>
            </div>

            {/* Canvas takes remaining space */}
            <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
                <canvas
                    ref={canvasRef}
                    style={{ display: 'block', width: '100%', height: '100%' }}
                />
            </div>

            {/* Keyboard sits below canvas */}
            <div className="game-bottom" style={{ padding: '1rem', background: '#1a1a1a', borderTop: '1px solid #333', position: 'relative', zIndex: 10 }}>
                <TurkishKeyboard onKeyPress={handleInput} />
            </div>
        </div>
    );
}
