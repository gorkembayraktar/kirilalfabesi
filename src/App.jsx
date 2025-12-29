import { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
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
import ReflexGame from './components/ReflexGame';
import RainGame from './components/RainGame';
import IntroPage from './components/IntroPage';
import Footer from './components/Footer';
import SequentialLearningModal from './components/SequentialLearningModal';
import SEO from './components/SEO';
import { useProgress } from './hooks/useProgress';
import { SequentialLearningProvider } from './contexts/SequentialLearningContext';

function App() {
    const location = useLocation();
    const navigate = useNavigate();
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

    const getSEOConfig = () => {
        const baseUrl = 'https://kirilalfabesi.vercel.app';
        const path = location.pathname === '/' ? '' : location.pathname;
        const viewKey = location.pathname === '/' ? 'intro' : location.pathname.slice(1);
        const configs = {
            intro: {
                title: 'Ana Sayfa',
                description: 'Rusça ve diğer Kiril alfabesi dillerini öğrenin! İnteraktif eşleştirme (neon ip mekaniği), yazı pratiği (canvas çizimi), test modu, refleks oyunu, yağmur oyunu ve daha fazlası. Türkçe konuşanlar için özel olarak tasarlanmış ücretsiz Kiril alfabesi öğrenme platformu. Sesli telaffuz, günlük ilerleme takibi ve mobil uyumlu tasarım.',
                keywords: 'kiril alfabesi, kiril harfleri, rusça öğrenme, kiril alfabesi öğrenme, türkçe kiril, kiril klavye, ücretsiz kiril öğrenme, online kiril, kiril oyunu, refleks oyunu, yağmur oyunu',
                url: baseUrl
            },
            learning: {
                title: 'Öğrenme Modu - Adım Adım Kiril Harfleri',
                description: 'Kiril harflerini adım adım öğrenin. Her harf için Türkçe karşılıkları, örnek kelimeler, sesli telaffuz (Web Speech API) ve görsel örnekler. Sıralı öğrenme sistemi ile harfleri sırayla öğrenin ve ilerlemenizi takip edin.',
                keywords: 'kiril harfleri öğrenme, kiril alfabesi öğrenme modu, rusça harf öğrenme, interaktif kiril öğrenme, sesli telaffuz, sıralı öğrenme, adım adım kiril',
                url: `${baseUrl}/learning`
            },
            test: {
                title: 'Test Modu - Bilgi Sınavı',
                description: 'Kiril alfabesi bilginizi test edin. Çoktan seçmeli sorular, yazılı sorular ve karışık modlar. Doğru/yanlış istatistikleri ile ilerlemenizi takip edin. Kendinizi sınayın ve eksiklerinizi görün.',
                keywords: 'kiril alfabesi test, kiril harfleri test, rusça test, kiril bilgi testi, çoktan seçmeli, yazılı sınav, kiril sınav',
                url: `${baseUrl}/test`
            },
            matching: {
                title: 'Eşleştirme Modu - Neon İp Mekaniği',
                description: 'Kiril ve Latince harfleri sürükleyip bırakarak eşleştirin. Dinamik fizik motoru ile neon ipler yer çekimi etkisi yaratır. Görsel hafızanızı güçlendiren eğlenceli ve etkileşimli öğrenme deneyimi.',
                keywords: 'kiril harf eşleştirme, kiril alfabesi oyunu, interaktif kiril öğrenme, kiril harf oyunu, neon ip mekaniği, sürükle bırak oyunu, görsel hafıza',
                url: `${baseUrl}/matching`
            },
            writing: {
                title: 'Yazı Pratiği Modu - Canvas Çizimi',
                description: 'Kiril harflerini canvas üzerinde çizerek öğrenin. Rehberli pratik ile arkaplanda silik harf ipucu görün. Mobil cihazlarda dokunmatik destek, masaüstünde fare ile çizim. Yazma becerilerinizi geliştirin.',
                keywords: 'kiril harf yazma, kiril alfabesi yazma pratiği, kiril harf çizme, el yazısı kiril, canvas çizim, dokunmatik yazma, rehberli pratik',
                url: `${baseUrl}/writing`
            },
            blog: {
                title: 'Blog ve Rehberler',
                description: 'Kiril alfabesi hakkında detaylı rehberler, sık sorulan sorular ve öğrenme ipuçları. "Hangi harf Türkçede yok?" gibi kafa karıştıran konularda bilgiler.',
                keywords: 'kiril alfabesi rehber, kiril harfleri hakkında, kiril öğrenme ipuçları, kiril alfabesi blog',
                url: `${baseUrl}/blog`
            },
            progress: {
                title: 'İlerleme ve İstatistikler - Öğrenme Takibi',
                description: 'Kiril alfabesi öğrenme ilerlemenizi detaylı takip edin. Günlük seri sayacı (streak), doğru/yanlış oranları, çalışma süresi, öğrenilen harf sayısı, kilitlenen harfler ve günlük aktivite grafikleri. Motivasyonunuzu koruyun.',
                keywords: 'kiril öğrenme ilerleme, kiril alfabesi istatistik, öğrenme takibi, kiril seri sayacı, streak counter, ilerleme grafiği, öğrenme istatistikleri',
                url: `${baseUrl}/progress`
            },
            games: {
                title: 'Oyun Modu - Refleks ve Yağmur Oyunu',
                description: 'Kiril alfabesini oyunlarla öğrenin! Refleks oyunu ile hızlı klavye becerileri, yağmur oyunu ile düşen harfleri yakalama. Kilitlediğiniz harflerle oynayın, skor yapın ve reflekslerinizi geliştirin. Eğlenceli ve etkili öğrenme deneyimi.',
                keywords: 'kiril alfabesi oyunu, kiril öğrenme oyunu, rusça oyun, kiril harf oyunu, refleks oyunu, yağmur oyunu, kiril klavye oyunu, eğitici oyun, ücretsiz kiril oyunu',
                url: `${baseUrl}/games`
            },
            'games/reflex': {
                title: 'Refleks Oyunu - Hızlı Klavye Becerileri',
                description: 'Kiril harflerini hızlı bir şekilde yazarak reflekslerinizi geliştirin. Zamanlı, skor tabanlı eğitici oyun. Kilitlediğiniz harflerle oynayın, zamana karşı yarışın ve en yüksek skoru yapın.',
                keywords: 'refleks oyunu, kiril refleks oyunu, hızlı klavye, zamanlı oyun, kiril klavye oyunu, refleks geliştirme, skor tabanlı oyun',
                url: `${baseUrl}/games/reflex`
            },
            'games/rain': {
                title: 'Yağmur Oyunu - Düşen Harfleri Yakala',
                description: 'Düşen Kiril harflerini yakalayarak hız ve doğruluğunuzu test edin. Can sistemi ile eğlenceli öğrenme. Harfler yere düşmeden yakalayın, seri ve dikkatli olun.',
                keywords: 'yağmur oyunu, kiril yağmur oyunu, düşen harf oyunu, can sistemi, hız oyunu, dikkat oyunu, kiril harf yakalama',
                url: `${baseUrl}/games/rain`
            },
            reflex: {
                title: 'Refleks Modu - Harf Kilitleme Sistemi',
                description: 'Kiril harflerini ustalaşarak kilitleyin. Her harfi doğru yazarak kilitleme sistemi ile ilerleyin. Kilitlediğiniz harflerle oyun modunda oynayabilirsiniz. Adım adım ustalık kazanın.',
                keywords: 'kiril refleks modu, harf kilitleme, kiril ustalık, refleks geliştirme, kiril pratik',
                url: `${baseUrl}/reflex`
            },
            transliteration: {
                title: 'Çeviri Alanı',
                description: 'Türkçe metinleri Kiril alfabesine çevirin. Kendi cümlelerinizi yazın ve anlık olarak Kiril karşılığını görün.',
                keywords: 'kiril çeviri, türkçe kiril çeviri, kiril transliterasyon, kiril alfabesi çeviri',
                url: `${baseUrl}/transliteration`
            },
            letters: {
                title: 'Harf Tablosu',
                description: 'Tüm Kiril harflerini bir arada görün. Her harfin Türkçe karşılığı, örnek kelimeler ve sesli telaffuzu ile kapsamlı harf tablosu.',
                keywords: 'kiril harf tablosu, kiril alfabesi tablosu, tüm kiril harfleri, kiril harf listesi',
                url: `${baseUrl}/letters`
            }
        };
        return configs[viewKey] || configs.intro;
    };

    const seoConfig = getSEOConfig();

    // Helper function to pass navigate to components
    const setCurrentView = (view) => {
        if (view === 'intro') {
            navigate('/');
        } else {
            navigate(`/${view}`);
        }
    };

    return (
        <SequentialLearningProvider>
            <SEO
                title={seoConfig.title}
                description={seoConfig.description}
                keywords={seoConfig.keywords}
                url={seoConfig.url}
            />
            <Header
                setCurrentView={setCurrentView}
                theme={theme}
                toggleTheme={toggleTheme}
                streak={progress.streak}
            />
            <main className="main">
                <Routes>
                    <Route path="/" element={<IntroPage setCurrentView={setCurrentView} />} />
                    <Route path="/learning" element={<LearningMode onRecordPractice={recordPractice} />} />
                    <Route path="/test" element={<TestMode onRecordPractice={recordPractice} />} />
                    <Route path="/matching" element={<MatchingMode onRecordPractice={recordPractice} />} />
                    <Route path="/writing" element={<WritingMode onRecordPractice={recordPractice} />} />
                    <Route path="/blog" element={<BlogMode />} />
                    <Route path="/progress" element={<ProgressStats progress={progress} />} />
                    <Route path="/games" element={<GameMode onRecordPractice={recordPractice} progress={progress} />}>
                        <Route path="reflex" element={<ReflexGame />} />
                        <Route path="rain" element={<RainGame />} />
                    </Route>
                    <Route path="/reflex" element={<ReflexMode theme={theme} />} />
                    <Route path="/transliteration" element={
                        <>
                            <DailySummary progress={progress} />
                            <TransliterationArea onRecordPractice={recordPractice} />
                        </>
                    } />
                    <Route path="/letters" element={<LetterTable />} />
                    <Route path="*" element={<TransliterationArea />} />
                </Routes>
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

            {/* Global Sequential Learning Modal */}
            <SequentialLearningModal />
        </SequentialLearningProvider>
    );
}

export default App;
