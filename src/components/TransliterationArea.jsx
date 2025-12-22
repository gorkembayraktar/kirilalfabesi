import { useState, useRef, useEffect } from 'react';
import { transliterate } from '../utils/transliteration';
import CyrillicKeyboard from './CyrillicKeyboard';
import LetterTable from './LetterTable';

// Pratik için Türkçe cümleler
const practiceTexts = [
    "Merhaba dünya",
    "Bugün hava çok güzel",
    "Türkiye güzel bir ülke",
    "Kitap okumayı seviyorum",
    "Kahve içmek ister misin",
    "Günaydın nasılsın",
    "Teşekkür ederim",
    "İyi akşamlar",
    "Hoşça kal dostum",
    "Yarın görüşürüz",
    "Bu çok kolay",
    "Hava soğuk bugün",
    "Yemek çok lezzetli",
    "Türkçe öğreniyorum",
    "Kiril alfabesi zor değil"
];

export default function TransliterationArea({ onRecordPractice }) {
    const [currentTextIndex, setCurrentTextIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [isVerified, setIsVerified] = useState(false);
    const [comparisonResult, setComparisonResult] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const inputRef = useRef(null);

    const currentText = practiceTexts[currentTextIndex];
    const correctAnswer = transliterate(currentText);

    // Yeni metin al
    const getNextText = () => {
        const nextIndex = (currentTextIndex + 1) % practiceTexts.length;
        setCurrentTextIndex(nextIndex);
        setUserAnswer('');
        setIsVerified(false);
        setComparisonResult(null);
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    // Rastgele metin al
    const getRandomText = () => {
        let nextIndex;
        do {
            nextIndex = Math.floor(Math.random() * practiceTexts.length);
        } while (nextIndex === currentTextIndex && practiceTexts.length > 1);
        setCurrentTextIndex(nextIndex);
        setUserAnswer('');
        setIsVerified(false);
        setComparisonResult(null);
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    // Cevabı doğrula
    const verifyAnswer = () => {
        if (!userAnswer.trim()) return;

        const userChars = userAnswer.split('');
        const correctChars = correctAnswer.split('');
        const result = [];

        // Her karakteri karşılaştır
        const maxLen = Math.max(userChars.length, correctChars.length);
        for (let i = 0; i < maxLen; i++) {
            const userChar = userChars[i] || '';
            const correctChar = correctChars[i] || '';

            if (userChar.toLowerCase() === correctChar.toLowerCase()) {
                result.push({ char: userChar, correct: true, expected: correctChar });
            } else {
                result.push({ char: userChar || '␣', correct: false, expected: correctChar || '' });
            }
        }

        setComparisonResult(result);
        setIsVerified(true);

        // İstatistik kaydet
        const isFullyCorrect = result.every(r => r.correct);
        if (onRecordPractice) {
            onRecordPractice(isFullyCorrect);
        }
    };

    // Klavyeden giriş
    const handleKeyboardInput = (key) => {
        if (isVerified) return;

        if (key === 'BACKSPACE') {
            setUserAnswer(prev => prev.slice(0, -1));
        } else {
            setUserAnswer(prev => prev + key);
        }
    };

    // Enter ile doğrula
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!isVerified) {
                verifyAnswer();
            } else {
                getNextText();
            }
        }
    };

    const isCorrect = comparisonResult && comparisonResult.every(r => r.correct);

    return (
        <div className="practice-area">
            {/* Çekmece Toggle Butonu */}
            <button
                className="drawer-toggle-btn"
                onClick={() => setIsDrawerOpen(true)}
                title="Harf Tablosunu Göster"
            >
                📖 Harfler
            </button>

            {/* Sol Çekmece (Harf Tablosu) */}
            <div className={`drawer-overlay ${isDrawerOpen ? 'open' : ''}`} onClick={() => setIsDrawerOpen(false)} />
            <div className={`drawer ${isDrawerOpen ? 'open' : ''}`}>
                <div className="drawer-header">
                    <h3>Harf Tablosu</h3>
                    <button className="drawer-close-btn" onClick={() => setIsDrawerOpen(false)}>✕</button>
                </div>
                <div className="drawer-content">
                    <LetterTable />
                </div>
            </div>

            <div className="practice-content">
                {/* Türkçe metin kartı */}
                <div className="practice-card">
                    <div className="practice-header">
                        <span className="practice-label">Türkçe Metin</span>
                        <button className="shuffle-btn" onClick={getRandomText} title="Rastgele metin">
                            🔀
                        </button>
                    </div>
                    <div className="practice-text">
                        {currentText}
                    </div>
                </div>

                {/* Kiril giriş alanı */}
                <div className="input-card">
                    <div className="practice-header">
                        <span className="practice-label">Kiril ile Yazın</span>
                        {isVerified && (
                            <span className={`result-badge ${isCorrect ? 'correct' : 'incorrect'}`}>
                                {isCorrect ? '✓ Doğru' : '✗ Hatalı'}
                            </span>
                        )}
                    </div>

                    <input
                        ref={inputRef}
                        type="text"
                        className={`practice-input ${isVerified ? (isCorrect ? 'correct' : 'incorrect') : ''}`}
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Kiril karakterleri ile yazın..."
                        disabled={isVerified}
                        autoComplete="off"
                    />

                    {/* Doğrulama sonucu */}
                    {isVerified && comparisonResult && (
                        <div className="comparison-result">
                            <div className="comparison-label">Karşılaştırma:</div>
                            <div className="comparison-chars">
                                {comparisonResult.map((item, index) => (
                                    <span
                                        key={index}
                                        className={`char-box ${item.correct ? 'correct' : 'incorrect'}`}
                                        title={!item.correct ? `Doğrusu: ${item.expected}` : ''}
                                    >
                                        {item.char}
                                        {!item.correct && item.expected && (
                                            <span className="expected-char">{item.expected}</span>
                                        )}
                                    </span>
                                ))}
                            </div>
                            {!isCorrect && (
                                <div className="correct-line">
                                    <span className="correct-label">Doğru yazılış:</span>
                                    <span className="correct-text">{correctAnswer}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Kiril Klavye */}
                    <CyrillicKeyboard
                        onKeyPress={handleKeyboardInput}
                        disabled={isVerified}
                    />

                    {/* Butonlar */}
                    <div className="practice-actions">
                        {!isVerified ? (
                            <button
                                className="verify-btn"
                                onClick={verifyAnswer}
                                disabled={!userAnswer.trim()}
                            >
                                ✓ Doğrula
                            </button>
                        ) : (
                            <button className="next-btn" onClick={getNextText}>
                                Sonraki →
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
