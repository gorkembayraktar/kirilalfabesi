import { useState } from 'react';

// Türkçe Q tarzi klavye düzeni
const keyboardRows = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'ı', 'o', 'p', 'ğ', 'ü'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ş', 'i'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm', 'ö', 'ç']
];

export default function TurkishKeyboard({ onKeyPress, disabled }) {
    const handleKeyClick = (key) => {
        if (!disabled && onKeyPress) {
            onKeyPress(key);
        }
    };

    return (
        <div className="turkish-keyboard">
            <div className="keyboard-container game-keyboard">
                {keyboardRows.map((row, rowIndex) => (
                    <div key={rowIndex} className="keyboard-row">
                        {row.map((key) => (
                            <button
                                key={key}
                                type="button"
                                className={`keyboard-key ${disabled ? 'disabled' : ''}`}
                                onClick={() => handleKeyClick(key)}
                                disabled={disabled}
                            >
                                {key.toUpperCase()}
                            </button>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
