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

export default function LetterTable() {
    const [selectedLetter, setSelectedLetter] = useState(null);
    const letters = getLetterMapping();

    const handleClick = (letter) => {
        setSelectedLetter(selectedLetter === letter.turkish[1] ? null : letter.turkish[1]);
    };

    return (
        <div className="letter-table">
            <h2>📚 Harf Eşleşmeleri</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                Bir harfe tıklayarak örnek kelime görün
            </p>

            <div className="letter-grid">
                {letters.map((letter) => {
                    const lowerLetter = letter.turkish[1];
                    const isSelected = selectedLetter === lowerLetter;

                    return (
                        <div
                            key={letter.turkish}
                            className={`letter-card ${isSelected ? 'highlighted' : ''}`}
                            onClick={() => handleClick(letter)}
                        >
                            <div className="letter-turkish">{letter.turkish}</div>
                            <div className="letter-cyrillic">{letter.cyrillic}</div>
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
                    <div style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                        {exampleWords[selectedLetter]}
                    </div>
                    <div style={{ fontSize: '1.5rem', color: 'var(--accent-primary)', fontWeight: '600' }}>
                        {transliterate(exampleWords[selectedLetter])}
                    </div>
                </div>
            )}
        </div>
    );
}
