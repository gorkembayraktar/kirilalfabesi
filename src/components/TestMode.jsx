import { useState, useEffect, useRef } from 'react';
import { Star, Zap, BookOpen, Target, ClipboardList, Trophy, ThumbsUp, Type, PenTool, Eye, ArrowRight, Play, RotateCcw, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';
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
    const inputRef = useRef(null);

    // Focus input when word-write question appears
    useEffect(() => {
        if (isStarted && !isFinished && questions.length > 0) {
            const currentQuestion = questions[currentIndex];
            if (currentQuestion?.type === 'word-write' && inputRef.current && !isAnswered) {
                inputRef.current.focus();
            }
        }
    }, [currentIndex, isStarted, isFinished, questions, isAnswered]);

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
            <div className="pt-mode">
                <div className="pt-start-card">
                    <div className="pt-start-icon-wrapper">
                        <ClipboardList size={48} className="pt-start-icon" />
                    </div>
                    <h2 className="pt-start-title">Mini Test</h2>
                    <p className="pt-start-description">
                        10 soruluk bir test ile Kiril bilginizi ölçün. Harf eşleştirme, kelime yazma
                        ve okuma soruları olacak.
                    </p>
                    <button className="pt-start-btn" onClick={startTest}>
                        <Play size={18} />
                        <span>Teste Başla</span>
                    </button>
                </div>
            </div>
        );
    }

    if (isFinished) {
        const percent = Math.round((score / questions.length) * 100);
        return (
            <div className="pt-mode">
                <div className="pt-results-card fade-in">
                    <div className="pt-results-header">
                        <div className="pt-results-icon-wrapper">
                            {score >= questions.length * 0.7 ? (
                                <Trophy size={48} className="pt-results-icon" />
                            ) : score >= questions.length * 0.5 ? (
                                <ThumbsUp size={48} className="pt-results-icon" />
                            ) : (
                                <BookOpen size={48} className="pt-results-icon" />
                            )}
                        </div>
                        <h2 className="pt-results-title">Test Tamamlandı!</h2>
                    </div>

                    <div className="pt-results-stats">
                        <div className="pt-results-score">
                            <div className="pt-score-value">{score}/{questions.length}</div>
                            <div className="pt-score-label">Doğru Cevap</div>
                        </div>
                        <div className="pt-results-percent">
                            <div className="pt-percent-value">{percent}%</div>
                            <div className="pt-percent-label">Başarı Oranı</div>
                        </div>
                    </div>

                    <div className="pt-results-message">
                        {getScoreMessage()}
                    </div>

                    <button className="pt-restart-btn" onClick={startTest}>
                        <RotateCcw size={18} />
                        <span>Tekrar Dene</span>
                    </button>
                </div>
            </div>
        );
    }

    const getTypeLabel = (type) => {
        switch (type) {
            case 'letter-match': return <><Type size={18} /> Harf Eşleştirme</>;
            case 'word-write': return <><PenTool size={18} /> Kelime Yazma</>;
            case 'cyrillic-read': return <><Eye size={18} /> Kiril Okuma</>;
            default: return '';
        }
    };

    const currentQuestion = isStarted && !isFinished && questions.length > 0 ? questions[currentIndex] : null;
    const progressPercent = questions.length > 0 ? ((currentIndex) / questions.length) * 100 : 0;
    
    const isCorrect = currentQuestion && isAnswered && (
        currentQuestion.type === 'word-write' 
            ? userAnswer.trim().toLowerCase() === currentQuestion.correctAnswer.toLowerCase()
            : selectedOption === currentQuestion.correctAnswer
    );

    if (!currentQuestion) {
        return null;
    }

    return (
        <div className="pt-mode">
            <div className="pt-card fade-in">
                {/* Header with Progress */}
                <div className="pt-header">
                    <div className="pt-progress-section">
                        <div className="pt-progress-info">
                            <span className="pt-progress-label">İlerleme</span>
                            <span className="pt-progress-text">{currentIndex + 1} / {questions.length}</span>
                        </div>
                        <div className="pt-progress-bar">
                            <div className="pt-progress-fill" style={{ width: `${progressPercent}%` }} />
                        </div>
                    </div>
                    <div className="pt-score-badge">
                        <CheckCircle2 size={16} />
                        <span>{score}</span>
                    </div>
                </div>

                {/* Question Type Badge */}
                <div className="pt-type-badge">
                    {getTypeLabel(currentQuestion.type)}
                </div>

                {/* Question Text */}
                <div className="pt-question-text">{currentQuestion.question}</div>

                {/* Answer Section */}
                {currentQuestion.type === 'word-write' ? (
                    <div className="pt-answer-section">
                        <form onSubmit={handleTextSubmit} className="pt-input-form">
                            <input
                                ref={inputRef}
                                type="text"
                                className={`pt-answer-input ${isAnswered ? (isCorrect ? 'pt-correct' : 'pt-incorrect') : ''}`}
                                value={userAnswer}
                                onChange={(e) => setUserAnswer(e.target.value)}
                                placeholder="Kiril ile yazın..."
                                disabled={isAnswered}
                                autoComplete="off"
                            />
                            {!isAnswered && userAnswer.trim() && (
                                <button type="submit" className="pt-submit-btn">
                                    <CheckCircle2 size={18} />
                                </button>
                            )}
                        </form>
                        {!isAnswered && (
                            <div className="pt-keyboard-wrapper">
                                <CyrillicKeyboard
                                    onKeyPress={handleKeyboardInput}
                                    disabled={isAnswered}
                                />
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="pt-options-grid">
                        {currentQuestion.options.map((option, idx) => {
                            const isSelected = selectedOption === option;
                            const isCorrectOption = isAnswered && option === currentQuestion.correctAnswer;
                            const isWrongOption = isAnswered && isSelected && option !== currentQuestion.correctAnswer;
                            
                            return (
                                <button
                                    key={idx}
                                    className={`pt-option-btn ${isSelected ? 'pt-selected' : ''} ${isCorrectOption ? 'pt-correct' : ''} ${isWrongOption ? 'pt-incorrect' : ''}`}
                                    onClick={() => handleOptionSelect(option)}
                                    disabled={isAnswered}
                                >
                                    {option}
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Feedback Section */}
                {isAnswered && (
                    <div className={`pt-feedback-container ${isCorrect ? 'pt-correct' : 'pt-incorrect'} fade-in`}>
                        {/* Sadece kelime yazma sorularında feedback göster */}
                        {currentQuestion.type === 'word-write' ? (
                            <>
                                {isCorrect ? (
                                    <div className="pt-feedback-message pt-correct">
                                        <CheckCircle2 size={20} />
                                        <span>Doğru!</span>
                                    </div>
                                ) : (
                                    <>
                                        <div className="pt-feedback-message pt-incorrect">
                                            <XCircle size={20} />
                                            <span>Yanlış</span>
                                        </div>
                                        <div className="pt-correct-answer">
                                            <span className="pt-correct-label">Doğru cevap:</span>
                                            <span className="pt-correct-text">{currentQuestion.correctAnswer}</span>
                                        </div>
                                    </>
                                )}
                            </>
                        ) : (
                            /* Çoktan seçmeli sorularda sadece doğru mesajı göster */
                            isCorrect && (
                                <div className="pt-feedback-message pt-correct">
                                    <CheckCircle2 size={20} />
                                    <span>Doğru!</span>
                                </div>
                            )
                        )}
                        <button className="pt-next-btn" onClick={nextQuestion}>
                            {currentIndex < questions.length - 1 ? (
                                <>
                                    <span>Sonraki Soru</span>
                                    <ArrowRight size={18} />
                                </>
                            ) : (
                                <>
                                    <Trophy size={18} />
                                    <span>Sonuçları Gör</span>
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
