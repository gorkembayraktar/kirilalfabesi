import { useState } from 'react';
import ReflexGame from './ReflexGame';
import RainGame from './RainGame';

export default function GameMode({ onRecordPractice, progress }) {
    const [currentMode, setCurrentMode] = useState('menu'); // 'menu', 'reflex', 'rain'

    // Get locked letters from progress
    const lockedLetters = progress?.reflexStatus
        ? Object.keys(progress.reflexStatus).filter(l => progress.reflexStatus[l].locked)
        : [];

    // For now, if no letters are locked, we disable the games or show a warning.
    // However, the prompt says "Only locked letters enter the game pool".
    // If pool is empty, maybe don't let them play?

    const hasLockedLetters = lockedLetters.length > 0;

    if (currentMode === 'reflex') {
        return <ReflexGame
            onExit={() => setCurrentMode('menu')}
            onRecordPractice={onRecordPractice}
            availableLetters={lockedLetters}
        />;
    }

    if (currentMode === 'rain') {
        return <RainGame
            onExit={() => setCurrentMode('menu')}
            availableLetters={lockedLetters}
        />;
    }

    return (
        <div className="game-menu-container">
            <h2 className="game-menu-title">Oyun Modunu Seç</h2>

            {!hasLockedLetters && (
                <div style={{
                    padding: '1rem',
                    background: 'var(--error-bg)',
                    color: 'var(--error)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1rem',
                    textAlign: 'center'
                }}>
                    <strong>⚠️ Henüz hiç harf kilitlemediniz!</strong>
                    <p>Oyunları oynamak için önce "Refleks (Kodla)" modunda harfleri pekiştirip kilitlemeniz gerekir.</p>
                </div>
            )}

            <div className="game-cards">
                <div
                    className={`game-card ${!hasLockedLetters ? 'disabled' : ''}`}
                    onClick={() => hasLockedLetters && setCurrentMode('reflex')}
                    style={!hasLockedLetters ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                >
                    <div className="card-icon">🎮</div>
                    <h3>Refleks Oyunu</h3>
                    <p>Hızlı düşün, doğru eşleştir. Zamana karşı yarış!</p>
                    <span className="card-play-btn">{hasLockedLetters ? 'Oyna →' : 'Kilitli 🔒'}</span>
                </div>

                <div
                    className={`game-card ${!hasLockedLetters ? 'disabled' : ''}`}
                    onClick={() => hasLockedLetters && setCurrentMode('rain')}
                    style={!hasLockedLetters ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                >
                    <div className="card-icon">🌧️</div>
                    <h3>Yağmur Oyunu</h3>
                    <p>Harfler yere düşmeden yakala. Seri ve dikkatli ol!</p>
                    <span className="card-play-btn">{hasLockedLetters ? 'Oyna →' : 'Kilitli 🔒'}</span>
                </div>
            </div>
        </div>
    );
}
