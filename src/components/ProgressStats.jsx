import { useMemo } from 'react';

export default function ProgressStats({ progress }) {
    const { streak, todayWords, todayCorrect, todayTime, totalWords, totalCorrect, history } = progress;

    const todayAccuracy = todayWords > 0 ? Math.round((todayCorrect / todayWords) * 100) : 0;
    const totalAccuracy = totalWords > 0 ? Math.round((totalCorrect / totalWords) * 100) : 0;

    const formatTime = (seconds) => {
        if (!seconds) return '0dk';
        const mins = Math.floor(seconds / 60);
        if (mins < 60) return `${mins}dk`;
        const hours = Math.floor(mins / 60);
        return `${hours}sa ${mins % 60}dk`;
    };

    const weeklyData = useMemo(() => {
        if (!history || history.length === 0) return [];

        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toDateString();
            const entry = (history || []).find(h => h.date === dateStr);
            last7Days.push({
                day: d.toLocaleDateString('tr-TR', { weekday: 'short' }),
                val: entry ? entry.words : 0,
                correct: entry ? entry.correct : 0,
                time: entry ? entry.time : 0,
                isToday: i === 0
            });
        }
        return last7Days;
    }, [history]);

    const maxVal = Math.max(...(weeklyData.map(d => d.val) || [0]), 10);

    return (
        <div className="progress-page fade-in">
            <h2 className="page-title">📊 İlerleme Raporu</h2>

            {/* Özet Kartları */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">🔥</div>
                    <div className="stat-info">
                        <span className="stat-value">{streak} Gün</span>
                        <span className="stat-label">Seri</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">⏱️</div>
                    <div className="stat-info">
                        <span className="stat-value">{formatTime(progress.totalTime)}</span>
                        <span className="stat-label">Toplam Süre</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">📝</div>
                    <div className="stat-info">
                        <span className="stat-value">{totalWords}</span>
                        <span className="stat-label">Toplam Kelime</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🎯</div>
                    <div className="stat-info">
                        <span className="stat-value">%{totalAccuracy}</span>
                        <span className="stat-label">Genel Başarı</span>
                    </div>
                </div>
            </div>

            {/* Haftalık Grafik */}
            <div className="chart-section">
                <h3 className="section-title">Son 7 Günlük Aktivite</h3>
                <div className="history-chart-large">
                    {weeklyData.map((d, i) => (
                        <div key={i} className={`chart-bar-group ${d.isToday ? 'today' : ''}`}>
                            <div
                                className="chart-bar"
                                style={{ height: `${Math.min((d.val / maxVal) * 100, 100)}%` }}
                                title={`${d.val} kelime\n${formatTime(d.time)}`}
                            >
                                {d.val > 0 && <span className="chart-val">{d.val}</span>}
                            </div>
                            <span className="chart-label">{d.day}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bugün */}
            <div className="today-section">
                <h3 className="section-title">Bugünün Özeti</h3>
                <div className="today-stats">
                    <div className="today-stat">
                        <span className="label">Çalışılan Kelime</span>
                        <span className="value">{todayWords}</span>
                    </div>
                    <div className="today-stat">
                        <span className="label">Çalışma Süresi</span>
                        <span className="value">{formatTime(todayTime)}</span>
                    </div>
                    <div className="today-stat">
                        <span className="label">Doğruluk Oranı</span>
                        <span className="value">%{todayAccuracy}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
