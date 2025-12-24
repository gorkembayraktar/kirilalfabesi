import { useState } from 'react';
import ReflexGame from './ReflexGame';
import RainGame from './RainGame';

export default function GameMode({ onRecordPractice }) {
    const [currentMode, setCurrentMode] = useState('menu'); // 'menu', 'reflex', 'rain'

    if (currentMode === 'reflex') {
        return <ReflexGame onExit={() => setCurrentMode('menu')} onRecordPractice={onRecordPractice} />;
    }

    if (currentMode === 'rain') {
        return <RainGame onExit={() => setCurrentMode('menu')} />;
    }

    return (
        <div className="game-menu-container">
            <h2 className="game-menu-title">Oyun Modunu Seç</h2>
            <div className="game-cards">
                <div className="game-card" onClick={() => setCurrentMode('reflex')}>
                    <div className="card-icon">🎮</div>
                    <h3>Refleks Oyunu</h3>
                    <p>Hızlı düşün, doğru eşleştir. Zamana karşı yarış!</p>
                    <span className="card-play-btn">Oyna →</span>
                </div>

                <div className="game-card" onClick={() => setCurrentMode('rain')}>
                    <div className="card-icon">🌧️</div>
                    <h3>Yağmur Oyunu</h3>
                    <p>Harfler yere düşmeden yakala. Seri ve dikkatli ol!</p>
                    <span className="card-play-btn">Oyna →</span>
                </div>
            </div>
        </div>
    );
}
