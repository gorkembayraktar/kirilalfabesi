import { useState, useRef, useEffect } from 'react';

export default function LockingStage({ data, onLock, onFail }) {
    const [input, setInput] = useState('');
    const [streak, setStreak] = useState(0);
    const [error, setError] = useState(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [streak]); // Focus on mount and after each correct answer

    const handleSubmit = (e) => {
        e.preventDefault();

        const answer = input.trim().toUpperCase();
        const correct = data.turkish.toUpperCase();

        if (answer === correct) {
            const newStreak = streak + 1;
            setStreak(newStreak);
            setInput('');
            setError(null);

            if (newStreak >= 3) {
                onLock();
            }
        } else {
            setError("Yanlış! Bu harf henüz kodlanmamış. Tekrar bakalım.");
            setTimeout(() => {
                onFail();
            }, 1500);
        }
    };

    return (
        <div className="reflex-locking-stage">
            <h3 className="stage-title">Aşama 2: Kilitleme</h3>

            <div className="locking-challenge">
                <div className="challenge-letter">{data.cyrillic}</div>
                <div className="challenge-arrow">↓</div>
                <div className="challenge-question">?</div>
            </div>

            <form onSubmit={handleSubmit} className="locking-form">
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Türkçe karşılığını yaz"
                    className={`locking-input ${error ? 'error' : ''}`}
                    maxLength={data.turkish.length}
                    autoComplete="off"
                />
                <button type="submit" className="locking-submit-btn">Kontrol Et</button>
            </form>

            <div className="locking-progress">
                {[1, 2, 3].map((step) => (
                    <div
                        key={step}
                        className={`progress-dot ${step <= streak ? 'filled' : ''}`}
                    />
                ))}
            </div>

            {error && <div className="locking-error">{error}</div>}
        </div>
    );
}
