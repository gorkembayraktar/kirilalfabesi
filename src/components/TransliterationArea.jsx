import { useState, useRef, useEffect } from 'react';
import { transliterate } from '../utils/transliteration';
import CyrillicKeyboard from './CyrillicKeyboard';
import { Shuffle, CheckCircle2, XCircle, ArrowRight, Languages, Keyboard } from 'lucide-react';

// Pratik için Türkçe cümleler (sadece Kiril alfabesinde yazılabilecek harflerle)
const practiceTexts = [
    "Merhaba nasılsın",
    "Kahve içmek ister misin",
    "İyi akşamlar",
    "Bu çok kolay",
    "Yemek çok lezzetli",
    "Kiril alfabesi zor değil",
    "Benim adım ne",
    "Senin adın ne",
    "Nerede yaşıyorsun",
    "Okula gidiyorum",
    "İşe gidiyorum",
    "Bana yardım et",
    "Kapıyı aç",
    "Pencereyi kapat",
    "Su içmek istiyorum",
    "Karnım aç",
    "Uykum var",
    "Saat kaç",
    "Yarın ne yapacaksın",
    "Sinemaya gidelim mi",
    "Hangi renk bu",
    "Kırmızı elma",
    "Yeşil ağaç",
    "Beyaz kedi",
    "Altı yedi sekiz dokuz on",
    "Annem ve babam",
    "Kardeşim okulda",
    "Arkadaşım geliyor",
    "Telefonum nerede",
    "Bilgisayar kullanıyorum",
    "Çay içelim",
    "Hafta sonu tatil",
    "Masa sandalye",
    "Kalem defter",
    "Sınıf ders",
    "Sabah akşam",
    "Hafta ay yıl",
    "Elma muz portakal",
    "Et tavuk balık",
    "Süt peynir yumurta",
    "Pazar hastane",
    "Park deniz nehir",
    "Orman hayvan",
    "Kedi kuş at",
    "Renk kırmızı mavi",
    "Yeşil sarı siyah",
    "Kitap okumak",
    "Telefon aramak",
    "Bilgisayar kullanmak",
    "Çay kahve içmek",
    "Yemek yemek",
    "Su içmek",
    "Okula gitmek",
    "İşe gitmek",
    "Evde kalmak",
    "Arkadaş ile konuşmak",
    "Aile ile vakit geçirmek",
    "Kitap okumayı seviyorum",
    "Müzik dinlemeyi seviyorum",
    "Yemek yemeyi seviyorum",
    "Su içmeyi seviyorum"
];

export default function TransliterationArea({ onRecordPractice }) {
    const [currentTextIndex, setCurrentTextIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [isVerified, setIsVerified] = useState(false);
    const [comparisonResult, setComparisonResult] = useState(null);
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

    useEffect(() => {
        getRandomText();
    }, []);


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
    // Klavyeden giriş
    const handleKeyboardInput = (key) => {
        if (key === 'ENTER') {
            if (!isVerified) {
                verifyAnswer();
            } else {
                getNextText();
            }
            return;
        }

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
            <div className="practice-content">
                {/* Türkçe metin kartı */}
                <div className="practice-card">
                    <div className="practice-card-header">
                        <div className="practice-card-title">
                            <Languages size={20} className="practice-icon" />
                            <span className="practice-label">Türkçe Metin</span>
                        </div>
                        <button 
                            className="shuffle-btn" 
                            onClick={getRandomText} 
                            title="Rastgele metin"
                            aria-label="Rastgele metin seç"
                        >
                            <Shuffle size={16} />
                        </button>
                    </div>
                    <div className="practice-text-wrapper">
                        <div className="practice-text">
                            {currentText}
                        </div>
                    </div>
                </div>

                {/* Kiril giriş alanı */}
                <div className="input-card">
                    <div className="practice-card-header">
                        <div className="practice-card-title">
                            <Keyboard size={20} className="practice-icon" />
                            <span className="practice-label">Kiril ile Yazın</span>
                        </div>
                        {isVerified && (
                            <div className={`result-badge ${isCorrect ? 'correct' : 'incorrect'}`}>
                                {isCorrect ? (
                                    <>
                                        <CheckCircle2 size={16} />
                                        <span>Doğru</span>
                                    </>
                                ) : (
                                    <>
                                        <XCircle size={16} />
                                        <span>Hatalı</span>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="input-action-row">
                        <div className="input-wrapper">
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
                        </div>
                        {!isVerified ? (
                            <button
                                className="verify-btn"
                                onClick={verifyAnswer}
                                disabled={!userAnswer.trim()}
                            >
                                <CheckCircle2 size={18} />
                                <span>Doğrula</span>
                            </button>
                        ) : (
                            <button className="next-btn" onClick={getNextText}>
                                <ArrowRight size={18} />
                                <span>Sonraki</span>
                            </button>
                        )}
                    </div>

                    {/* Doğrulama sonucu */}
                    {isVerified && comparisonResult && (
                        <div className="comparison-result">
                            <div className="comparison-chars">
                                {comparisonResult.map((item, index) => (
                                    <span
                                        key={index}
                                        className={`char-box ${item.correct ? 'correct' : 'incorrect'}`}
                                        title={!item.correct ? `Doğrusu: ${item.expected}` : ''}
                                    >
                                        <span className="char-display">{item.char}</span>
                                        {!item.correct && item.expected && (
                                            <span className="expected-char">{item.expected}</span>
                                        )}
                                    </span>
                                ))}
                            </div>
                            {!isCorrect && (
                                <div className="correct-line">
                                    <span className="correct-label">Doğru:</span>
                                    <span className="correct-text">{correctAnswer}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Kiril Klavye */}
                    <div className="keyboard-wrapper">
                        <CyrillicKeyboard
                            onKeyPress={handleKeyboardInput}
                            disabled={isVerified}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
