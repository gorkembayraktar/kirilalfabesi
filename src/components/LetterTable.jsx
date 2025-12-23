import { useState } from 'react';
import { getLetterMapping, transliterate } from '../utils/transliteration';

const exampleWords = {
    'a': 'araba',
    'b': 'bebek',
    'c': 'ceviz',
    'ç': 'çanta',
    'd': 'deniz',
    'e': 'elma',
    'f': 'fil',
    'g': 'göz',
    'ğ': 'dağ',
    'h': 'hava',
    'ı': 'ılık',
    'i': 'insan',
    'j': 'jilet',
    'k': 'kitap',
    'l': 'limon',
    'm': 'masa',
    'n': 'nar',
    'o': 'okul',
    'ö': 'ördek',
    'p': 'para',
    'r': 'renk',
    's': 'su',
    'ş': 'şeker',
    't': 'tuz',
    'u': 'uzun',
    'ü': 'üzüm',
    'v': 'vazo',
    'y': 'yıldız',
    'z': 'zeytin'
};

// Kiril harfini seslendir
const speakCyrillic = (text) => {
    if ('speechSynthesis' in window) {
        // Önceki sesleri durdur
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ru-RU'; // Rusça
        utterance.rate = 0.8; // Biraz yavaş
        utterance.pitch = 1;
        utterance.volume = 1;

        window.speechSynthesis.speak(utterance);
    } else {
        alert('Tarayıcınız ses sentezini desteklemiyor.');
    }
};

export default function LetterTable() {
    const [selectedLetter, setSelectedLetter] = useState(null);
    const [speaking, setSpeaking] = useState(null);
    const letters = getLetterMapping();

    const handleClick = (letter) => {
        setSelectedLetter(selectedLetter === letter.turkish[1] ? null : letter.turkish[1]);
    };

    const handleSpeak = (e, cyrillicLetter) => {
        e.stopPropagation();
        setSpeaking(cyrillicLetter);
        speakCyrillic(cyrillicLetter);

        // Animasyon için timeout
        setTimeout(() => setSpeaking(null), 500);
    };

    return (
        <div className="letter-table">
            <h2>📚 Harf Eşleşmeleri</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                Harfe tıklayarak örnek görün, 🔊 ile telaffuzu dinleyin
            </p>

            <div className="letter-grid">
                {letters.map((letter) => {
                    const lowerLetter = letter.turkish[1];
                    const isSelected = selectedLetter === lowerLetter;
                    const cyrillicLower = letter.cyrillic[1] || letter.cyrillic[0];

                    return (
                        <div
                            key={letter.turkish}
                            className={`letter-card ${isSelected ? 'highlighted' : ''}`}
                            onClick={() => handleClick(letter)}
                        >
                            <div className="letter-turkish">{letter.turkish}</div>
                            <div className="letter-cyrillic">{letter.cyrillic}</div>
                            <button
                                className={`speak-btn ${speaking === cyrillicLower ? 'speaking' : ''}`}
                                onClick={(e) => handleSpeak(e, cyrillicLower)}
                                title="Telaffuzu dinle"
                            >
                                🔊
                            </button>
                        </div>
                    );
                })}
            </div>

            {selectedLetter && exampleWords[selectedLetter] && (
                <div className="fade-in" style={{
                    marginTop: '1.5rem',
                    padding: '1.5rem',
                    background: 'var(--bg-primary)',
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'center'
                }}>
                    <div style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Örnek Kelime
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: '600' }}>
                            {exampleWords[selectedLetter]}
                        </span>
                        <button
                            className="speak-btn-large"
                            onClick={() => speakCyrillic(transliterate(exampleWords[selectedLetter]))}
                            title="Kelimeyi dinle"
                        >
                            🔊
                        </button>
                    </div>
                    <div style={{ fontSize: '1.5rem', color: 'var(--accent-primary)', fontWeight: '600' }}>
                        {transliterate(exampleWords[selectedLetter])}
                    </div>
                </div>
            )}
        </div>
    );
}

