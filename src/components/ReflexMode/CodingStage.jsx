import { useState, useEffect } from 'react';

export default function CodingStage({ data, onComplete }) {
    const [timeLeft, setTimeLeft] = useState(5);
    const [canProceed, setCanProceed] = useState(false);

    useEffect(() => {
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
    }, [data.id]); // Reset timer when letter data changes

    const handleNext = () => {
        if (canProceed) {
            onComplete();
        }
    };

    return (
        <div className="reflex-coding-stage">
            <h3 className="stage-title">Aşama 1: Kodlama</h3>

            <div className="coding-card">
                <div className="coding-letter-large">{data.cyrillic}</div>

                <div className="coding-details">
                    <div className="coding-row">
                        <span className="label">Bu harf:</span>
                        <span className="value">{data.turkish}</span>
                    </div>
                    <div className="coding-row">
                        <span className="label">Okunuş:</span>
                        <span className="value">{data.pronunciation}</span>
                    </div>
                    <div className="coding-row highlight">
                        <span className="label">Şekil Çağrışımı:</span>
                        <span className="value">{data.association}</span>
                    </div>
                </div>

                {data.exampleWord && (
                    <div className="coding-example">
                        <div className="example-word-section">
                            <span className="example-word">{data.exampleWord}</span>
                        </div>
                        <div className="example-details">
                            <div className="example-row">
                                <span className="example-label">Okunuş:</span>
                                <span className="example-value pronunciation">{data.examplePronunciation}</span>
                            </div>
                            <div className="example-row">
                                <span className="example-label">Anlam:</span>
                                <span className="example-value translation">{data.exampleTranslation}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <button
                className={`reflex-next-btn ${!canProceed ? 'disabled' : ''}`}
                onClick={handleNext}
                disabled={!canProceed}
            >
                {canProceed ? 'İlerlet' : `Bekle (${timeLeft}s)`}
            </button>

            <p className="coding-instruction">
                Harfi, sesi ve görseli zihninize kazıyın.
            </p>
        </div>
    );
}
