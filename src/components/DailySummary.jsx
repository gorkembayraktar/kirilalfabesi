import { useState, useEffect, useRef } from 'react';
import { BarChart2, Flame, X } from 'lucide-react';

export default function DailySummary({ progress }) {
    return null;
    const { streak, todayWords, todayCorrect, totalWords } = progress;

    // 1. Düzeltme: String karşılaştırmasını geri ekledik
    const [isHidden, setIsHidden] = useState(() => {
        const saved = localStorage.getItem('dailySummaryHidden');
        return saved === 'true'; // string "true" ise boolean true döner
    });

    // todayWords'ün bir önceki değerini tutmak için (sadece artışta açılması için)
    const prevWordsRef = useRef(todayWords);

    const todayAccuracy = todayWords > 0 ? Math.round((todayCorrect / todayWords) * 100) : 0;

    const formatTime = (seconds) => {
        if (!seconds) return '0dk';
        if (seconds < 60) return `${seconds}sn`;
        return `${Math.floor(seconds / 60)}dk`;
    };

    // State değiştiğinde localStorage'a kaydet
    useEffect(() => {
        localStorage.setItem('dailySummaryHidden', isHidden);
    }, [isHidden]);

    // 2. Düzeltme: Sadece todayWords ARTTIĞINDA (yeni pratik yapıldığında) aç
    useEffect(() => {
        if (todayWords > prevWordsRef.current && todayWords > 0) {
            setIsHidden(false);
        }
        prevWordsRef.current = todayWords;
    }, [todayWords]);

    if (totalWords === 0) return null;

    if (isHidden) {
        return (
            <button className="summary-show-btn" onClick={() => setIsHidden(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarChart2 size={16} /> İlerlemeyi Göster
            </button>
        );
    }

    return (
        <div className="daily-summary fade-in">
            <div className="summary-header">
                <h3 className="summary-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <BarChart2 size={20} /> Bugün Öğrendiklerin
                </h3>
                <div className="summary-actions">
                    {streak > 0 && (
                        <div className="streak-badge" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Flame size={16} fill="currentColor" /> {streak} gün
                        </div>
                    )}
                    <button
                        className="summary-close-btn"
                        onClick={() => setIsHidden(true)}
                        title="Gizle"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            <div className="summary-stats">
                <div className="summary-stat">
                    <div className="summary-stat-value">{todayWords}</div>
                    <div className="summary-stat-label">Bugün Pratik</div>
                </div>
                <div className="summary-stat">
                    <div className="summary-stat-value">{formatTime(progress.todayTime)}</div>
                    <div className="summary-stat-label">Süre</div>
                </div>
                <div className="summary-stat">
                    <div className="summary-stat-value">%{todayAccuracy}</div>
                    <div className="summary-stat-label">Başarı</div>
                </div>
                <div className="summary-stat">
                    <div className="summary-stat-value">{totalWords}</div>
                    <div className="summary-stat-label">Toplam</div>
                </div>
            </div>
        </div>
    );
}
