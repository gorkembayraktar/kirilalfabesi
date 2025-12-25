import {
    PenTool,
    BookOpen,
    GraduationCap,
    ClipboardList,
    Link,
    Brain,
    Gamepad2,
    Edit3,
    Newspaper,
    BarChart2,
    Flame,
    Moon,
    Sun
} from 'lucide-react';

export default function Header({ currentView, setCurrentView, theme, toggleTheme, streak }) {
    const views = [
        { id: 'transliteration', label: 'Çeviri', icon: PenTool, isNew: false },
        { id: 'letters', label: 'Harfler', icon: BookOpen, isNew: false },
        { id: 'learning', label: 'Öğren', icon: GraduationCap, isNew: false },
        { id: 'test', label: 'Test', icon: ClipboardList, isNew: false },
        { id: 'matching', label: 'Eşleştir', icon: Link, isNew: false },
        { id: 'reflex', label: 'Refleks', icon: Brain, isNew: true },
        { id: 'games', label: 'Oyun', icon: Gamepad2, isNew: false },
        { id: 'writing', label: 'Yazı', icon: Edit3, isNew: false },
        { id: 'blog', label: 'Blog', icon: Newspaper, isNew: false },
        { id: 'progress', label: 'İlerleme', icon: BarChart2, isNew: false }
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
                    {views.map(view => {
                        const Icon = view.icon;
                        return (
                            <button
                                key={view.id}
                                className={`nav-btn ${currentView === view.id ? 'active' : ''}`}
                                onClick={() => setCurrentView(view.id)}
                            >
                                <span className="nav-icon"><Icon size={18} /></span>
                                <span className="nav-label">{view.label}</span>
                                {view.isNew && <span className="new-badge">Yeni</span>}
                            </button>
                        );
                    })}
                </nav>

                <div className="header-actions">
                    {streak > 0 && (
                        <div
                            className="streak-badge"
                            title="İlerleme detaylarını gör"
                            onClick={() => setCurrentView('progress')}
                        >
                            <span className="streak-icon"><Flame size={18} fill="red" stroke="orange" /></span>
                            <span className="streak-count">{streak}</span>
                        </div>
                    )}
                    <button className="theme-toggle" onClick={toggleTheme} title="Tema değiştir">
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>
                </div>
            </div>
        </header>
    );
}

