import { useState } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { Gamepad2, CloudRain, AlertTriangle, Lock, ArrowRight, Zap, Trophy, TrendingUp, Play, Sparkles, Search } from 'lucide-react';
import { trackGameStart } from '../utils/analytics';

export default function GameMode({ onRecordPractice, progress }) {
    const navigate = useNavigate();
    const location = useLocation();
    const isGameActive = location.pathname !== '/games';

    // Get locked letters from progress
    const lockedLetters = progress?.reflexStatus
        ? Object.keys(progress.reflexStatus).filter(l => progress.reflexStatus[l].locked)
        : [];

    const hasLockedLetters = lockedLetters.length > 0;
    const totalLetters = 29; // Total Cyrillic letters
    const progressPercent = (lockedLetters.length / totalLetters) * 100;

    // If a game is active, render it via Outlet
    if (isGameActive) {
        return <Outlet context={{ onRecordPractice, availableLetters: lockedLetters }} />;
    }

    return (
        <div className="games-wrapper">
            {/* Header Section */}
            <div className="games-header">
                <div className="games-header-content">
                    <div className="games-title-section">
                        <div className="games-title-icon">
                            <Gamepad2 size={32} />
                        </div>
                        <div>
                            <h1 className="games-title">Oyun Modu</h1>
                            <p className="games-subtitle">Kilitlediğin harflerle reflekslerini geliştir</p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="games-stats">
                        <div className="games-stat-card">
                            <div className="stat-icon">
                                <Lock size={18} />
                            </div>
                            <div className="stat-content">
                                <span className="stat-value">{lockedLetters.length}</span>
                                <span className="stat-label">Kilitli Harf</span>
                            </div>
                        </div>
                        <div className="games-stat-card accent">
                            <div className="stat-icon">
                                <Trophy size={18} />
                            </div>
                            <div className="stat-content">
                                <span className="stat-value">{Math.round(progressPercent)}%</span>
                                <span className="stat-label">İlerleme</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="games-progress-section">
                    <div className="games-progress-bar">
                        <div 
                            className="games-progress-fill" 
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                    <span className="games-progress-text">
                        {lockedLetters.length} / {totalLetters} harf kilitli
                    </span>
                </div>
            </div>

            {/* Warning Message */}
            {!hasLockedLetters && (
                <div className="games-warning">
                    <div className="warning-icon">
                        <AlertTriangle size={24} />
                    </div>
                    <div className="warning-content">
                        <h3>Henüz hiç harf kilitlemediniz!</h3>
                        <p>Oyunları oynamak için önce <strong>"Refleks (Kodla)"</strong> modunda harfleri pekiştirip kilitlemeniz gerekir.</p>
                        <div className="warning-hint">
                            <Sparkles size={16} />
                            <span>Her harfi 3 kez doğru yazarak kilitleyebilirsiniz</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Game Cards */}
            <div className="games-grid">
                {/* Reflex Game Card */}
                <div
                    className={`game-card-modern ${!hasLockedLetters ? 'disabled' : ''} reflex-card`}
                    onClick={() => {
                        if (hasLockedLetters) {
                            trackGameStart('reflex', lockedLetters);
                            navigate('/games/reflex');
                        }
                    }}
                >
                    <div className="card-bg-gradient" />
                    <div className="card-content">
                        <div className="card-header">
                            <div className="card-icon-wrapper reflex-icon">
                                <Gamepad2 size={32} />
                            </div>
                            <div className="card-badge">
                                {hasLockedLetters ? (
                                    <>
                                        <Zap size={12} />
                                        <span>Aktif</span>
                                    </>
                                ) : (
                                    <>
                                        <Lock size={12} />
                                        <span>Kilitli</span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="card-body">
                            <h3 className="card-title">Refleks Oyunu</h3>
                            <p className="card-description">
                                Hızlı düşün, doğru eşleştir. Zamana karşı yarış ve reflekslerini test et!
                            </p>

                            <div className="card-features">
                                <div className="feature-item">
                                    <TrendingUp size={14} />
                                    <span>Hız ve Doğruluk</span>
                                </div>
                                <div className="feature-item">
                                    <Zap size={14} />
                                    <span>Zamana Karşı</span>
                                </div>
                            </div>
                        </div>

                        <div className="card-footer">
                            <button 
                                className={`card-play-button ${hasLockedLetters ? 'active' : 'disabled'}`}
                                disabled={!hasLockedLetters}
                            >
                                {hasLockedLetters ? (
                                    <>
                                        <Play size={18} />
                                        <span>Oyna</span>
                                        <ArrowRight size={16} />
                                    </>
                                ) : (
                                    <>
                                        <Lock size={18} />
                                        <span>Kilitli</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Rain Game Card */}
                <div
                    className={`game-card-modern ${!hasLockedLetters ? 'disabled' : ''} rain-card`}
                    onClick={() => {
                        if (hasLockedLetters) {
                            trackGameStart('rain', lockedLetters);
                            navigate('/games/rain');
                        }
                    }}
                >
                    <div className="card-bg-gradient" />
                    <div className="card-content">
                        <div className="card-header">
                            <div className="card-icon-wrapper rain-icon">
                                <CloudRain size={32} />
                            </div>
                            <div className="card-badge">
                                {hasLockedLetters ? (
                                    <>
                                        <Zap size={12} />
                                        <span>Aktif</span>
                                    </>
                                ) : (
                                    <>
                                        <Lock size={12} />
                                        <span>Kilitli</span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="card-body">
                            <h3 className="card-title">Yağmur Oyunu</h3>
                            <p className="card-description">
                                Harfler yere düşmeden yakala. Seri ve dikkatli ol, reflekslerini geliştir!
                            </p>

                            <div className="card-features">
                                <div className="feature-item">
                                    <CloudRain size={14} />
                                    <span>Dikkat Gerektirir</span>
                                </div>
                                <div className="feature-item">
                                    <Trophy size={14} />
                                    <span>Yüksek Skor</span>
                                </div>
                            </div>
                        </div>

                        <div className="card-footer">
                            <button 
                                className={`card-play-button ${hasLockedLetters ? 'active' : 'disabled'}`}
                                disabled={!hasLockedLetters}
                            >
                                {hasLockedLetters ? (
                                    <>
                                        <Play size={18} />
                                        <span>Oyna</span>
                                        <ArrowRight size={16} />
                                    </>
                                ) : (
                                    <>
                                        <Lock size={18} />
                                        <span>Kilitli</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Word Hunt Game Card */}
                <div
                    className={`game-card-modern ${!hasLockedLetters ? 'disabled' : ''} wordhunt-card`}
                    onClick={() => {
                        if (hasLockedLetters) {
                            trackGameStart('wordhunt', lockedLetters);
                            navigate('/games/wordhunt');
                        }
                    }}
                >
                    <div className="card-bg-gradient" />
                    <div className="card-content">
                        <div className="card-header">
                            <div className="card-icon-wrapper wordhunt-icon">
                                <Search size={32} />
                            </div>
                            <div className="card-badge">
                                {hasLockedLetters ? (
                                    <>
                                        <Zap size={12} />
                                        <span>Aktif</span>
                                    </>
                                ) : (
                                    <>
                                        <Lock size={12} />
                                        <span>Kilitli</span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="card-body">
                            <h3 className="card-title">Kelime Avı</h3>
                            <p className="card-description">
                                Grid içinde Kiril harflerinden oluşan kelimeleri bul. Yatay, dikey ve çapraz arama yap!
                            </p>

                            <div className="card-features">
                                <div className="feature-item">
                                    <Search size={14} />
                                    <span>Görsel Tarama</span>
                                </div>
                                <div className="feature-item">
                                    <Trophy size={14} />
                                    <span>Kelime Bulmaca</span>
                                </div>
                            </div>
                        </div>

                        <div className="card-footer">
                            <button 
                                className={`card-play-button ${hasLockedLetters ? 'active' : 'disabled'}`}
                                disabled={!hasLockedLetters}
                            >
                                {hasLockedLetters ? (
                                    <>
                                        <Play size={18} />
                                        <span>Oyna</span>
                                        <ArrowRight size={16} />
                                    </>
                                ) : (
                                    <>
                                        <Lock size={18} />
                                        <span>Kilitli</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
