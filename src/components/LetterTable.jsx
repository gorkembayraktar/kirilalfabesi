import { useState } from 'react';
import { BookOpen, Volume2, ListOrdered } from 'lucide-react';
import { getLetterMapping, transliterate } from '../utils/transliteration';
import { useSequentialLearning } from '../contexts/SequentialLearningContext';

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
const speakCyrillic = (text, lang = 'ru-RU') => {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 0.8;
        utterance.pitch = 1;
        utterance.volume = 1;
        window.speechSynthesis.speak(utterance);
    }
};

export default function LetterTable() {
    const [selectedLetter, setSelectedLetter] = useState(null);
    const [speaking, setSpeaking] = useState(null);
    const { openModal } = useSequentialLearning();
    const letters = getLetterMapping();

    const handleClick = (letter) => {
        setSelectedLetter(selectedLetter === letter.turkish[1] ? null : letter.turkish[1]);
    };

    const handleSpeak = (e, cyrillicLetter) => {
        e.stopPropagation();
        setSpeaking(cyrillicLetter);
        speakCyrillic(cyrillicLetter);

        setTimeout(() => setSpeaking(null), 500);
    };

    return (
        <>
            <div className="letter-table">
                <div className="letter-table-header">
                    <div>
                        <h2><BookOpen className="inline-icon" style={{ marginRight: '0.5rem' }} /> Harf Eşleşmeleri</h2>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                            Harfe tıklayarak örnek görün, <Volume2 size={16} className="inline-icon" /> ile telaffuzu dinleyin
                        </p>
                    </div>
                    <button
                        className="sequential-learn-btn"
                        onClick={openModal}
                    >
                        <ListOrdered size={18} />
                        <span>Sıralı Öğren</span>
                    </button>
                </div>

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
                                <div className="letter-cyrillic">{letter.cyrillic}</div>
                                <div className="letter-turkish">{letter.turkish}</div>
                                <button
                                    className={`speak-btn ${speaking === cyrillicLower ? 'speaking' : ''}`}
                                    onClick={(e) => handleSpeak(e, cyrillicLower)}
                                    title="Telaffuzu dinle"
                                >
                                    <Volume2 size={16} />
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
                                <Volume2 size={24} />
                            </button>
                        </div>
                        <div style={{ fontSize: '1.5rem', color: 'var(--accent-primary)', fontWeight: '600' }}>
                            {transliterate(exampleWords[selectedLetter])}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
