import { useState, useEffect } from 'react';
import Header from './components/Header';
import TransliterationArea from './components/TransliterationArea';
import LetterTable from './components/LetterTable';
import LearningMode from './components/LearningMode';
import TestMode from './components/TestMode';
import DailySummary from './components/DailySummary';
import { useProgress } from './hooks/useProgress';

function App() {
    const [currentView, setCurrentView] = useState('transliteration');
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
            case 'transliteration':
                return (
                    <>
                        <DailySummary progress={progress} />
                        <TransliterationArea onRecordPractice={recordPractice} />
                    </>
                );
            case 'letters':
                return <LetterTable />;
            case 'learning':
                return <LearningMode onRecordPractice={recordPractice} />;
            case 'test':
                return <TestMode onRecordPractice={recordPractice} />;
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
            />
            <main className="main">
                {renderView()}
            </main>
        </>
    );
}

export default App;
