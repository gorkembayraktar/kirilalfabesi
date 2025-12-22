import { useState } from 'react';

// Kiril klavye düzeni
const keyboardRows = [
    ['й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш', 'щ', 'з', 'х', 'ъ'],
    ['ф', 'ы', 'в', 'а', 'п', 'р', 'о', 'л', 'д', 'ж', 'э'],
    ['я', 'ч', 'с', 'м', 'и', 'т', 'ь', 'б', 'ю', 'ё']
];

export default function CyrillicKeyboard({ onKeyPress, disabled }) {
    const [isOpen, setIsOpen] = useState(true);

    const handleKeyClick = (key) => {
        if (!disabled && onKeyPress) {
            onKeyPress(key);
        }
    };

    const handleBackspace = () => {
        if (!disabled && onKeyPress) {
            onKeyPress('BACKSPACE');
        }
    };

    const handleSpace = () => {
        if (!disabled && onKeyPress) {
            onKeyPress(' ');
        }
    };

    return (
        <div className="cyrillic-keyboard">
            <button
                className="keyboard-toggle"
                onClick={() => setIsOpen(!isOpen)}
                type="button"
            >
                ⌨️ Kiril Klavye {isOpen ? '▲' : '▼'}
            </button>

            {isOpen && (
                <div className="keyboard-container fade-in">
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
                    <div className="keyboard-row keyboard-special">
                        <button
                            type="button"
                            className={`keyboard-key key-backspace ${disabled ? 'disabled' : ''}`}
                            onClick={handleBackspace}
                            disabled={disabled}
                        >
                            ⌫ Sil
                        </button>
                        <button
                            type="button"
                            className={`keyboard-key key-space ${disabled ? 'disabled' : ''}`}
                            onClick={handleSpace}
                            disabled={disabled}
                        >
                            Boşluk
                        </button>
                        <button
                            type="button"
                            className={`keyboard-key key-enter ${disabled ? 'disabled' : ''}`}
                            onClick={() => !disabled && onKeyPress && onKeyPress('ENTER')}
                            disabled={disabled}
                        >
                            ↵ Giriş
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
