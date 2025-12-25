import { useState, useEffect } from 'react';
import Header from './components/Header';
import TransliterationArea from './components/TransliterationArea';
import LetterTable from './components/LetterTable';
import LearningMode from './components/LearningMode';
import TestMode from './components/TestMode';
import MatchingMode from './components/MatchingMode';
import WritingMode from './components/WritingMode';
import BlogMode from './components/BlogMode';
import DailySummary from './components/DailySummary';
import ProgressStats from './components/ProgressStats';
import LetterDrawer from './components/LetterDrawer';
import GameMode from './components/GameMode';
import ReflexMode from './components/ReflexMode';
import IntroPage from './components/IntroPage';
import Footer from './components/Footer';
import { useProgress } from './hooks/useProgress';

function App() {
    const [currentView, setCurrentView] = useState('intro');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem('kiril-theme');
        return saved || 'light';
    });

    const { progress, recordPractice } = useProgress();

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('kiril-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const renderView = () => {
        switch (currentView) {
            case 'intro':
                return <IntroPage setCurrentView={setCurrentView} />;
            case 'transliteration':
                return (
                    <>
                        <DailySummary progress={progress} />
                        <TransliterationArea onRecordPractice={recordPractice} />
                    </>
                );
            case 'letters':
                return <LetterTable />;
            case 'reflex':
                return <ReflexMode theme={theme} />;
            case 'learning':
                return <LearningMode onRecordPractice={recordPractice} />;
            case 'test':
                return <TestMode onRecordPractice={recordPractice} />;
            case 'matching':
                return <MatchingMode onRecordPractice={recordPractice} />;
            case 'writing':
                return <WritingMode onRecordPractice={recordPractice} />;
            case 'blog':
                return <BlogMode />;
            case 'progress':
                return <ProgressStats progress={progress} />;
            case 'games':
                return <GameMode onRecordPractice={recordPractice} progress={progress} />;
            default:
                return <TransliterationArea />;
        }
    };

    return (
        <>
            <Header
                currentView={currentView}
                setCurrentView={setCurrentView}
                theme={theme}
                toggleTheme={toggleTheme}
                streak={progress.streak}
            />
            <main className="main">
                {renderView()}
            </main>

            <Footer />

            {/* Global Drawer Toggle Button */}
            <button
                className="global-drawer-btn"
                onClick={() => setIsDrawerOpen(true)}
                title="Harf Tablosunu Göster"
            >
                📖 Harfler
            </button>

            {/* Global Drawer */}
            <LetterDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
            />
        </>
    );
}

export default App;
