import React from 'react';
import {
    BookOpen,
    GraduationCap,
    Edit3,
    PenTool,
    ClipboardList,
    Link,
    Brain,
    Gamepad2,
    ArrowRight,
    Hand,
    Sprout,
    Dumbbell,
    Rocket,
    Zap,
    Trophy,
    Lock
} from 'lucide-react';
import { useProgress } from '../hooks/useProgress';

export default function IntroPage({ setCurrentView }) {
    const { getLockedLetters } = useProgress();
    const lockedLetters = getLockedLetters();
    const hasLockedLetters = lockedLetters.length > 0;

    const handleGamesClick = () => {
        if (!hasLockedLetters) {
            alert("⚠️ Oyunları açmak için önce Refleks Modunda en az bir harfi 'Kilitlemen' (ustalaşman) gerekiyor! Harfleri öğrendikçe bu kilit açılacak.");
            return;
        }
        setCurrentView('games');
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div>
                    <h1>Hoş geldin! <Hand className="wave-icon" size={32} style={{ display: 'inline', color: '#fbbf24' }} /></h1>
                    <p>Bugün Kiril alfabesinde hangi seviyeye ulaşmak istersin?</p>
                </div>
                <div className="daily-tip-badge">
                    <Zap size={16} fill="#fbbf24" stroke="#d97706" />
                    <span>Günlük İpucu: Her gün 5 dk pratik yap!</span>
                </div>
            </div>

            <div className="bento-grid">
                {/* Primary Action - Start Here */}
                <div className="bento-card hero-card" onClick={() => setCurrentView('reflex')}>
                    <div className="card-content">
                        <div className="card-icon-bg green">
                            <Sprout size={32} color="white" />
                        </div>
                        <h3>Sıfırdan Başla</h3>
                        <p>Kiril alfabesini hiç bilmiyorsan veya tekrar etmek istiyorsan en iyi başlangıç noktası burası.</p>
                        <button className="start-btn">Refleks Moduna Git <ArrowRight size={16} /></button>
                    </div>
                    <div className="card-pattern pat-1"></div>
                </div>

                {/* Secondary Action - Practice */}
                <div className="bento-card practice-card" onClick={() => setCurrentView('transliteration')}>
                    <div className="card-content">
                        <div className="card-icon-bg blue">
                            <Dumbbell size={28} color="white" />
                        </div>
                        <h3>Pratik Yap</h3>
                        <p>Harfleri tanıyorsun ama hızlanman mı lazım? Bol bol alıştırma yap.</p>
                    </div>
                    <div className="card-pattern pat-2"></div>
                </div>

                {/* Tertiary Action - Master/Test */}
                <div className="bento-card master-card" onClick={() => setCurrentView('transliteration')}>
                    <div className="card-content">
                        <div className="card-icon-bg purple">
                            <Rocket size={28} color="white" />
                        </div>
                        <h3>Çeviri Modu</h3>
                        <p>Kendine güveniyor musun? Bilgini çeviri modunda test et.</p>
                    </div>
                    <div className="card-pattern pat-3"></div>
                </div>

                {/* Quick Stats / Streak */}
                <div className="bento-card stats-card" onClick={() => setCurrentView('progress')}>
                    <div className="stats-inner">
                        <Trophy size={40} className="trophy-icon" />
                        <div>
                            <h4>İlerlemeni Gör</h4>
                            <p>İstatistiklerine göz at</p>
                        </div>
                    </div>
                </div>

                {/* Mini Tools Row */}
                <div
                    className="bento-card mini-card"
                    onClick={handleGamesClick}
                >
                    <Gamepad2 className="mini-icon" />
                    <span>Oyunlar</span>

                    {!hasLockedLetters && (
                        <div className="lock-overlay">
                            <Lock size={20} />
                        </div>
                    )}
                </div>
                <div className="bento-card mini-card" onClick={() => setCurrentView('matching')}>
                    <Link className="mini-icon" />
                    <span>Eşleştir</span>
                </div>
                <div className="bento-card mini-card" onClick={() => setCurrentView('test')}>
                    <ClipboardList className="mini-icon" />
                    <span>Test</span>
                </div>
                <div className="bento-card mini-card" onClick={() => setCurrentView('writing')}>
                    <Edit3 className="mini-icon" />
                    <span>Yazı</span>
                </div>
            </div>
        </div>
    );
}
