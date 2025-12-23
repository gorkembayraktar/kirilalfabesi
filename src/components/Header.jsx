export default function Header({ currentView, setCurrentView, theme, toggleTheme }) {
    const views = [
        { id: 'transliteration', label: 'Çeviri', icon: '✍️' },
        { id: 'letters', label: 'Harfler', icon: '📖' },
        { id: 'learning', label: 'Öğren', icon: '🎓' },
        { id: 'test', label: 'Test', icon: '📝' },
        { id: 'matching', label: 'Eşleştir', icon: '🔗' },
        { id: 'progress', label: 'İlerleme', icon: '📊' }
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
                        </button>
                    ))}
                </nav>

                <div className="header-actions">
                    <button className="theme-toggle" onClick={toggleTheme} title="Tema değiştir">
                        {theme === 'light' ? '🌙' : '☀️'}
                    </button>
                </div>
            </div>
        </header>
    );
}

