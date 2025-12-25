import { useState, useEffect } from 'react';
import { Star, Zap, BookOpen, Target, ClipboardList, Trophy, ThumbsUp, Type, PenTool, Eye, ArrowRight } from 'lucide-react';
import { transliterate, getRandomWords, getLetterMapping, checkAnswer } from '../utils/transliteration';
import CyrillicKeyboard from './CyrillicKeyboard';

// Soru tipleri oluştur
const generateQuestions = () => {
    const questions = [];
    const letters = getLetterMapping();
    const words = getRandomWords(20);

    // Tip 1: Harf eşleştirme (4 soru)
    for (let i = 0; i < 4; i++) {
        const randomLetters = [...letters].sort(() => Math.random() - 0.5).slice(0, 4);
        const correctLetter = randomLetters[0];

        questions.push({
            type: 'letter-match',
            question: `"${correctLetter.turkish[1]}" harfinin Kiril karşılığı nedir?`,
            options: randomLetters.map(l => l.cyrillic[1]).sort(() => Math.random() - 0.5),
            correctAnswer: correctLetter.cyrillic[1],
            turkishLetter: correctLetter.turkish[1]
        });
    }

    // Tip 2: Kelime yazma (3 soru)
    for (let i = 0; i < 3; i++) {
        const word = words[i];
        questions.push({
            type: 'word-write',
            question: `"${word.turkish}" kelimesini Kiril ile yazın`,
            correctAnswer: transliterate(word.turkish),
            turkishWord: word.turkish
        });
    }

    // Tip 3: Kiril okuma (3 soru)
    for (let i = 3; i < 6; i++) {
        const word = words[i];
        const cyrillicWord = transliterate(word.turkish);
        const wrongAnswers = words
            .filter((_, idx) => idx !== i)
            .slice(0, 3)
            .map(w => w.turkish);

        questions.push({
            type: 'cyrillic-read',
            question: `"${cyrillicWord}" hangi Türkçe kelimeye karşılık gelir?`,
            options: [word.turkish, ...wrongAnswers].sort(() => Math.random() - 0.5),
            correctAnswer: word.turkish,
            cyrillicWord
        });
    }

    return questions.sort(() => Math.random() - 0.5);
};

export default function TestMode({ onRecordPractice }) {
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [selectedOption, setSelectedOption] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [isStarted, setIsStarted] = useState(false);

    const startTest = () => {
        setQuestions(generateQuestions());
        setCurrentIndex(0);
        setUserAnswer('');
        setSelectedOption(null);
        setIsAnswered(false);
        setScore(0);
        setIsFinished(false);
        setIsStarted(true);
    };

    const handleOptionSelect = (option) => {
        if (isAnswered) return;

        setSelectedOption(option);
        setIsAnswered(true);

        const currentQuestion = questions[currentIndex];
        const isCorrect = option === currentQuestion.correctAnswer;

        if (isCorrect) {
            setScore(prev => prev + 1);
        }

        if (onRecordPractice) {
            onRecordPractice(isCorrect);
        }
    };

    const handleKeyboardInput = (key) => {
        if (key === 'ENTER') {
            if (!isAnswered && userAnswer.trim()) {
                handleTextSubmit({ preventDefault: () => { } });
            }
            return;
        }

        if (isAnswered) return;

        if (key === 'BACKSPACE') {
            setUserAnswer(prev => prev.slice(0, -1));
        } else {
            setUserAnswer(prev => prev + key);
        }
    };

    const handleTextSubmit = (e) => {
        e.preventDefault();
        if (isAnswered || !userAnswer.trim()) return;

        setIsAnswered(true);

        const currentQuestion = questions[currentIndex];
        const isCorrect = userAnswer.trim().toLowerCase() === currentQuestion.correctAnswer.toLowerCase();

        if (isCorrect) {
            setScore(prev => prev + 1);
        }

        if (onRecordPractice) {
            onRecordPractice(isCorrect);
        }
    };

    const nextQuestion = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setUserAnswer('');
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            setIsFinished(true);
        }
    };

    const getScoreMessage = () => {
        const percent = (score / questions.length) * 100;
        if (percent >= 90) return <><Star className="inline-icon" size={20} /> Muhteşem! Kiril alfabesine hakim olmuşsunuz!</>;
        if (percent >= 70) return <><Zap className="inline-icon" size={20} /> Çok iyi! Biraz daha pratikle mükemmel olacaksınız!</>;
        if (percent >= 50) return <><BookOpen className="inline-icon" size={20} /> İyi bir başlangıç! Pratik yapmaya devam edin.</>;
        return <><Target className="inline-icon" size={20} /> Daha fazla pratik yapmanız gerekiyor. Pes etmeyin!</>;
    };

    if (!isStarted) {
        return (
            <div className="test-mode">
                <div className="test-card start-screen">
                    <div className="start-icon"><ClipboardList size={64} style={{ color: 'var(--primary)' }} /></div>
                    <h2 className="start-title">Mini Test</h2>
                    <p className="start-description">
                        10 soruluk bir test ile Kiril bilginizi ölçün. Harf eşleştirme, kelime yazma
                        ve okuma soruları olacak.
                    </p>
                    <button className="start-btn" onClick={startTest}>
                        Teste Başla
                    </button>
                </div>
            </div>
        );
    }

    if (isFinished) {
        return (
            <div className="test-mode">
                <div className="test-card test-results fade-in">
                    <div className="results-icon">
                        {score >= questions.length * 0.7 ? <Trophy size={64} color="#fbbf24" /> : score >= questions.length * 0.5 ? <ThumbsUp size={64} color="#3b82f6" /> : <BookOpen size={64} color="#60a5fa" />}
                    </div>
                    <h2 className="results-title">Test Tamamlandı!</h2>
                    <div className="results-score">{score}/{questions.length}</div>
                    <div className="results-message" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        {getScoreMessage()}
                    </div>
                    <button className="restart-btn" onClick={startTest}>
                        Tekrar Dene
                    </button>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentIndex];
    const progressPercent = ((currentIndex) / questions.length) * 100;

    const getTypeLabel = (type) => {
        switch (type) {
            case 'letter-match': return <><Type size={18} /> Harf Eşleştirme</>;
            case 'word-write': return <><PenTool size={18} /> Kelime Yazma</>;
            case 'cyrillic-read': return <><Eye size={18} /> Kiril Okuma</>;
            default: return '';
        }
    };

    return (
        <div className="test-mode">
            <div className="test-card fade-in">
                <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
                </div>

                <div className="question-number">
                    Soru {currentIndex + 1} / {questions.length}
                </div>

                <div className="question-type" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                    {getTypeLabel(currentQuestion.type)}
                </div>

                <div className="question-text">{currentQuestion.question}</div>

                {currentQuestion.type === 'word-write' ? (
                    <div className="word-write-section">
                        <form onSubmit={handleTextSubmit}>
                            <input
                                type="text"
                                className={`answer-input ${isAnswered ? (userAnswer.trim().toLowerCase() === currentQuestion.correctAnswer.toLowerCase() ? 'correct' : 'incorrect') : ''}`}
                                value={userAnswer}
                                onChange={(e) => setUserAnswer(e.target.value)}
                                placeholder="Cevabınızı yazın..."
                                disabled={isAnswered}
                                autoComplete="off"
                                autoFocus
                            />
                        </form>
                        <CyrillicKeyboard
                            onKeyPress={handleKeyboardInput}
                            disabled={isAnswered}
                        />
                    </div>
                ) : (
                    <div className="options-grid">
                        {currentQuestion.options.map((option, idx) => (
                            <button
                                key={idx}
                                className={`option-btn ${selectedOption === option ? 'selected' : ''} ${isAnswered && option === currentQuestion.correctAnswer ? 'correct' : ''
                                    } ${isAnswered && selectedOption === option && option !== currentQuestion.correctAnswer ? 'incorrect' : ''}`}
                                onClick={() => handleOptionSelect(option)}
                                disabled={isAnswered}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                )}

                {isAnswered && currentQuestion.type === 'word-write' && userAnswer.trim().toLowerCase() !== currentQuestion.correctAnswer.toLowerCase() && (
                    <div className="correct-answer fade-in" style={{ marginTop: '1rem' }}>
                        Doğru cevap: {currentQuestion.correctAnswer}
                    </div>
                )}

                {isAnswered && (
                    <button className="next-btn fade-in" onClick={nextQuestion} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                        {currentIndex < questions.length - 1 ? <>Sonraki Soru <ArrowRight size={18} /></> : 'Sonuçları Gör'}
                    </button>
                )}
            </div>
        </div>
    );
}
