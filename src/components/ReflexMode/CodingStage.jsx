import { useState, useEffect } from 'react';
import { Clock, ChevronRight, Volume2, Lightbulb } from 'lucide-react';

export default function CodingStage({ data, onComplete, audioEnabled, speak }) {
    const [timeLeft, setTimeLeft] = useState(5);
    const [canProceed, setCanProceed] = useState(false);

    useEffect(() => {
        setTimeLeft(5);
        setCanProceed(false);

        // Auto-play pronunciation when entering coding stage
        if (audioEnabled && speak) {
            setTimeout(() => {
                speak(data.cyrillic);
            }, 300);
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setCanProceed(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [data.id, audioEnabled, speak, data.cyrillic]);

    const handleNext = () => {
        if (canProceed) {
            onComplete();
        }
    };

    const handleSpeak = (text) => {
        if (speak) {
            speak(text);
        }
    };

    const progressWidth = ((5 - timeLeft) / 5) * 100;

    return (
        <div className="coding-stage">
            {/* Main Letter Display */}
            <div className="coding-hero">
                <div className="coding-letter-wrapper">
                    <div className="coding-letter-bg" />
                    <span className="coding-letter">{data.cyrillic}</span>
                    <button 
                        className="letter-speak-btn"
                        onClick={() => handleSpeak(data.cyrillic)}
                        title="Dinle"
                    >
                        <Volume2 size={16} />
                    </button>
                </div>
                <div className="coding-equals">=</div>
                <div className="coding-turkish-wrapper">
                    <span className="coding-turkish">{data.turkish}</span>
                    <span className="coding-pronunciation">/{data.pronunciation}/</span>
                </div>
            </div>

            {/* Association Highlight */}
            <div className="coding-association">
                <div className="association-icon">
                    <Lightbulb size={18} />
                </div>
                <div className="association-content">
                    <span className="association-label">Şekil Çağrışımı</span>
                    <span className="association-text">{data.association}</span>
                </div>
            </div>

            {/* Example Word */}
            {data.exampleWord && (
                <div className="coding-example">
                    <div className="example-word-display">
                        <span className="example-cyrillic">{data.exampleWord}</span>
                        <button 
                            className="example-speak-btn"
                            onClick={() => handleSpeak(data.exampleWord)}
                            title="Kelimeyi Dinle"
                        >
                            <Volume2 size={14} />
                        </button>
                    </div>
                    <div className="example-info">
                        <div className="example-row">
                            <span className="example-pronunciation">{data.examplePronunciation}</span>
                        </div>
                        <div className="example-meaning">"{data.exampleTranslation}"</div>
                    </div>
                </div>
            )}

            {/* Timer Progress */}
            <div className="coding-timer-section">
                <div className="timer-bar-bg">
                    <div 
                        className={`timer-bar-fill ${canProceed ? 'complete' : ''}`} 
                        style={{ width: `${progressWidth}%` }} 
                    />
                </div>
                {!canProceed && (
                    <div className="timer-countdown">
                        <Clock size={14} />
                        <span>{timeLeft}s</span>
                    </div>
                )}
            </div>

            {/* Action Button */}
            <button
                className={`coding-action-btn ${canProceed ? 'ready' : 'waiting'}`}
                onClick={handleNext}
                disabled={!canProceed}
            >
                {canProceed ? (
                    <>
                        <span>Kilitleme Aşamasına Geç</span>
                        <ChevronRight size={20} />
                    </>
                ) : (
                    <>
                        <span>Harfi zihne kodla...</span>
                    </>
                )}
            </button>
        </div>
    );
}
