import { useState, useEffect, useRef } from 'react';
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
    Sun,
    ChevronDown,
    Home
} from 'lucide-react';

export default function Header({ currentView, setCurrentView, theme, toggleTheme, streak }) {
    const [openDropdown, setOpenDropdown] = useState(null);
    const navRef = useRef(null);

    const menuItems = [
        { id: 'intro', label: 'Giriş', icon: Home },
        {
            id: 'learn-group',
            label: 'Öğren',
            icon: GraduationCap,
            children: [
                { id: 'letters', label: 'Harfler', icon: BookOpen },
                { id: 'learning', label: 'Dersler', icon: GraduationCap },
                { id: 'writing', label: 'Yazı', icon: Edit3 }
            ]
        },
        {
            id: 'practice-group',
            label: 'Pratik',
            icon: PenTool,
            children: [
                { id: 'transliteration', label: 'Çeviri', icon: PenTool },
                { id: 'test', label: 'Test', icon: ClipboardList },
                { id: 'matching', label: 'Eşleştir', icon: Link }
            ]
        },
        { id: 'reflex', label: 'Refleks', icon: Brain, isNew: true },
        { id: 'games', label: 'Oyun', icon: Gamepad2 },
        { id: 'blog', label: 'Blog', icon: Newspaper }
    ];

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (navRef.current && !navRef.current.contains(event.target)) {
                setOpenDropdown(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, []);

    const handleMenuClick = (item) => {
        if (item.children) {
            setOpenDropdown(openDropdown === item.id ? null : item.id);
        } else {
            setCurrentView(item.id);
            setOpenDropdown(null);
        }
    };

    const handleSubMenuClick = (subId) => {
        setCurrentView(subId);
        setOpenDropdown(null);
    };

    return (
        <header className="header">
            <div className="header-content">
                <div className="logo" onClick={() => setCurrentView('intro')} style={{ cursor: 'pointer' }}>
                    <img src="/favicon.png" alt="Kiril Logo" className="logo-img" />
                    <div className="logo-text">
                        <span className="logo-title">Kiril Alfabesi Öğreniyorum</span>
                        <span className="logo-subtitle">Türkçe → Кирилл</span>
                    </div>
                </div>

                <nav className="nav" ref={navRef}>
                    {menuItems.map(item => {
                        const Icon = item.icon;
                        const isGroupActive = item.children && item.children.some(c => c.id === currentView);
                        const isActive = item.id === currentView || isGroupActive;

                        return (
                            <div key={item.id} className={`nav-item-wrapper ${openDropdown === item.id ? 'dropdown-open' : ''}`}>
                                <button
                                    className={`nav-btn ${isActive ? 'active' : ''}`}
                                    onClick={() => handleMenuClick(item)}
                                >
                                    <span className="nav-icon"><Icon size={18} /></span>
                                    <span className="nav-label">{item.label}</span>
                                    {item.children && <ChevronDown size={14} style={{ marginLeft: 4, transform: openDropdown === item.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />}
                                    {item.isNew && <span className="new-badge">Yeni</span>}
                                </button>

                                {item.children && openDropdown === item.id && (
                                    <div className="nav-dropdown fade-in-fast">
                                        {item.children.map(sub => {
                                            const SubIcon = sub.icon;
                                            return (
                                                <button
                                                    key={sub.id}
                                                    className={`dropdown-item ${currentView === sub.id ? 'active' : ''}`}
                                                    onClick={(e) => { e.stopPropagation(); handleSubMenuClick(sub.id); }}
                                                >
                                                    <SubIcon size={16} />
                                                    <span>{sub.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>

                <div className="header-actions">
                    {streak > 0 ? (
                        <div
                            className="streak-badge"
                            title="İlerleme detaylarını gör"
                            onClick={() => setCurrentView('progress')}
                        >
                            <span className="streak-icon"><Flame size={18} fill="red" stroke="orange" /></span>
                            <span className="streak-count">{streak}</span>
                        </div>
                    ) : (
                        <div
                            className="streak-badge"
                            title="İlerleme detaylarını gör"
                            onClick={() => setCurrentView('progress')}
                        >
                            <span className="streak-icon"><Flame size={18} fill="red" stroke="orange" /></span>
                            <span className="streak-count hide-on-mobile">İlerlemeyi göster</span>
                        </div>
                    )}
                    <button className="theme-toggle" onClick={toggleTheme} title="Tema değiştir">
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} color='white' />}
                    </button>
                </div>
            </div>
        </header>
    );
}

