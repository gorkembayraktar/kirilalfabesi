import { useState } from 'react';
import { Keyboard, ChevronUp, ChevronDown, Delete, CornerDownLeft } from 'lucide-react';

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
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}
            >
                <Keyboard size={18} /> Kiril Klavye {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
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
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                        >
                            <Delete size={18} /> Sil
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
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                        >
                            <CornerDownLeft size={18} /> Giriş
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
