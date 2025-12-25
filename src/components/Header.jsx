export default function Header({ currentView, setCurrentView, theme, toggleTheme, streak }) {
    const views = [
        { id: 'transliteration', label: 'Çeviri', icon: '✍️', isNew: false },
        { id: 'letters', label: 'Harfler', icon: '📖', isNew: false },
        { id: 'learning', label: 'Öğren', icon: '🎓', isNew: false },
        { id: 'test', label: 'Test', icon: '📝', isNew: false },
        { id: 'matching', label: 'Eşleştir', icon: '🔗', isNew: false },
        { id: 'reflex', label: 'Refleks (Kodla)', icon: '🧠', isNew: true },
        { id: 'games', label: 'Oyun', icon: '🎮', isNew: false },
        { id: 'writing', label: 'Yazı', icon: '🖊️', isNew: false },
        { id: 'blog', label: 'Blog', icon: '📰', isNew: false },
        { id: 'progress', label: 'İlerleme', icon: '📊', isNew: false }
    ];

    return (
        <header className="header">
            <div className="header-content">
                <div className="logo" onClick={() => setCurrentView('transliteration')} style={{ cursor: 'pointer' }}>
                    <img src="/favicon.png" alt="Kiril Logo" className="logo-img" />
                    <div className="logo-text">
                        <span className="logo-title">Kiril Alfabesi Öğreniyorum</span>
                        <span className="logo-subtitle">Türkçe → Кирилл</span>
                    </div>
                </div>

                <nav className="nav">
                    {views.map(view => (
                        <button
                            key={view.id}
                            className={`nav-btn ${currentView === view.id ? 'active' : ''}`}
                            onClick={() => setCurrentView(view.id)}
                        >
                            <span className="nav-icon">{view.icon}</span>
                            <span className="nav-label">{view.label}</span>
                            {view.isNew && <span className="new-badge">Yeni</span>}
                        </button>
                    ))}
                </nav>

                <div className="header-actions">
                    {streak > 0 && (
                        <div
                            className="streak-badge"
                            title="İlerleme detaylarını gör"
                            onClick={() => setCurrentView('progress')}
                        >
                            <span className="streak-icon">🔥</span>
                            <span className="streak-count">{streak}</span>
                        </div>
                    )}
                    <button className="theme-toggle" onClick={toggleTheme} title="Tema değiştir">
                        {theme === 'light' ? '🌙' : '☀️'}
                    </button>
                </div>
            </div>
        </header>
    );
}

