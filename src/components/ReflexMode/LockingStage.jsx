import { useState, useRef, useEffect } from 'react';
import { Check, X, Lock, Volume2 } from 'lucide-react';

export default function LockingStage({ data, onLock, onFail, audioEnabled, speak }) {
    const [input, setInput] = useState('');
    const [streak, setStreak] = useState(0);
    const [feedback, setFeedback] = useState(null);
    const [isLocking, setIsLocking] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [streak]);

    useEffect(() => {
        setStreak(0);
        setInput('');
        setFeedback(null);

        // Auto-play letter pronunciation when entering locking stage
        if (audioEnabled && speak) {
            setTimeout(() => {
                speak(data.cyrillic);
            }, 200);
        }
    }, [data.id, audioEnabled, speak, data.cyrillic]);

    const handleSpeak = () => {
        if (speak) {
            speak(data.cyrillic);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const answer = input.trim().toUpperCase();
        const correct = data.turkish.toUpperCase();

        if (answer === correct) {
            const newStreak = streak + 1;
            setStreak(newStreak);
            setInput('');
            setFeedback('correct');

            // Play success sound by speaking the letter again
            if (audioEnabled && speak) {
                speak(data.cyrillic);
            }

            setTimeout(() => setFeedback(null), 300);

            if (newStreak >= 3) {
                setIsLocking(true);
                setTimeout(() => {
                    onLock();
                }, 800);
            }
        } else {
            setFeedback('incorrect');
            setTimeout(() => {
                onFail();
            }, 1200);
        }
    };

    return (
        <div className={`locking-stage ${isLocking ? 'locking-animation' : ''}`}>
            {/* Challenge Display */}
            <div className={`locking-challenge ${feedback || ''}`}>
                <div className="challenge-letter-wrap">
                    <span className="challenge-letter">{data.cyrillic}</span>
                    <button 
                        className="challenge-speak-btn"
                        onClick={handleSpeak}
                        title="Dinle"
                    >
                        <Volume2 size={14} />
                    </button>
                </div>
            </div>

            {/* Progress Dots */}
            <div className="locking-dots">
                {[1, 2, 3].map((step) => (
                    <div
                        key={step}
                        className={`dot ${step <= streak ? 'filled' : ''} ${step === streak + 1 ? 'next' : ''}`}
                    >
                        {step <= streak ? <Check size={12} /> : step}
                    </div>
                ))}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="locking-form">
                <div className={`input-wrapper ${feedback || ''}`}>
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Türkçe karşılık"
                        className="locking-input"
                        maxLength={data.turkish.length + 1}
                        autoComplete="off"
                        autoCapitalize="off"
                        disabled={isLocking}
                    />
                    {feedback === 'correct' && <Check className="input-icon success" size={20} />}
                    {feedback === 'incorrect' && <X className="input-icon error" size={20} />}
                </div>
                <button type="submit" className="locking-submit" disabled={isLocking || !input.trim()}>
                    Kontrol Et
                </button>
            </form>

            {/* Feedback Message */}
            {feedback === 'incorrect' && (
                <div className="locking-feedback error">
                    <X size={16} /> Yanlış! Tekrar kodlama aşamasına dönüyoruz...
                </div>
            )}

            {isLocking && (
                <div className="locking-feedback success">
                    <Lock size={16} /> Harf kilitleniyor...
                </div>
            )}

            {/* Hint */}
            {!feedback && !isLocking && streak < 3 && (
                <p className="locking-hint">
                    {streak === 0 && "Bu harfin Türkçe karşılığını 3 kez doğru yaz"}
                    {streak === 1 && "Harika! 2 kez daha"}
                    {streak === 2 && "Son bir kez daha!"}
                </p>
            )}
        </div>
    );
}
