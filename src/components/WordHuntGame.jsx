import { useState, useEffect, useRef } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Search, ArrowLeft, RotateCcw, Home, Play, Trophy, Target, Zap, CheckCircle2, XCircle } from 'lucide-react';
import { transliterate, wordList } from '../utils/transliteration';
import { trackGameStart, trackGameEnd, trackGameAnswer } from '../utils/analytics';

const GRID_SIZE = 12;
const MIN_WORD_LENGTH = 3;

export default function WordHuntGame() {
    const navigate = useNavigate();
    const { availableLetters, onRecordPractice } = useOutletContext() || {};
    const onExit = () => navigate('/games');
    
    const [gameStatus, setGameStatus] = useState('intro');
    const [grid, setGrid] = useState([]);
    const [words, setWords] = useState([]);
    const [foundWords, setFoundWords] = useState(new Set());
    const [selectedCells, setSelectedCells] = useState([]);
    const [isSelecting, setIsSelecting] = useState(false);
    const [movementDirection, setMovementDirection] = useState(null); // 'horizontal', 'vertical', 'diagonal'
    const [score, setScore] = useState(0);
    const [hints, setHints] = useState(3);
    const [level, setLevel] = useState(1);
    const [timeLeft, setTimeLeft] = useState(180); // 3 dakika
    const [showHint, setShowHint] = useState(null);
    
    const gridRef = useRef(null);
    const timerRef = useRef(null);

    // Filtrele: Sadece Kiril alfabesinde yazılabilecek kelimeler
    const availableWords = wordList.filter(w => {
        const cyrillic = transliterate(w.turkish);
        // Sadece Kiril harfleri içeren kelimeler (ğ, ö, ü yok)
        return /^[а-яА-Я\s]+$/.test(cyrillic) && cyrillic.length >= MIN_WORD_LENGTH;
    });

    // Grid oluştur ve kelimeleri yerleştir
    const generateGrid = (wordCount = 8) => {
        const newGrid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''));
        const wordsToPlace = [];
        const usedWords = new Set();
        
        // Rastgele kelimeler seç
        const shuffled = [...availableWords].sort(() => Math.random() - 0.5);
        let placed = 0;
        
        for (const word of shuffled) {
            if (placed >= wordCount) break;
            if (usedWords.has(word.turkish)) continue;
            
            const cyrillic = transliterate(word.turkish);
            if (cyrillic.length > GRID_SIZE) continue;
            
            // Kelimeyi grid'e yerleştirmeyi dene
            const placedWord = tryPlaceWord(newGrid, cyrillic, word.turkish);
            if (placedWord) {
                wordsToPlace.push(placedWord);
                usedWords.add(word.turkish);
                placed++;
            }
        }
        
        // Boş hücreleri rastgele Kiril harfleriyle doldur
        fillEmptyCells(newGrid);
        
        return { grid: newGrid, words: wordsToPlace };
    };

    // Kelimeyi grid'e yerleştirmeyi dene
    const tryPlaceWord = (grid, word, turkish) => {
        const directions = [
            { dx: 1, dy: 0 },   // Yatay →
            { dx: 0, dy: 1 },   // Dikey ↓
            { dx: 1, dy: 1 },   // Çapraz ↘
            { dx: 1, dy: -1 }   // Çapraz ↗
        ];
        
        const attempts = 100;
        for (let i = 0; i < attempts; i++) {
            const dir = directions[Math.floor(Math.random() * directions.length)];
            const startX = Math.floor(Math.random() * (GRID_SIZE - word.length * Math.abs(dir.dx)));
            const startY = Math.floor(Math.random() * (GRID_SIZE - word.length * Math.abs(dir.dy)));
            
            // Yerleştirme mümkün mü kontrol et
            let canPlace = true;
            const positions = [];
            
            for (let j = 0; j < word.length; j++) {
                const x = startX + j * dir.dx;
                const y = startY + j * dir.dy;
                
                if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) {
                    canPlace = false;
                    break;
                }
                
                if (grid[y][x] !== '' && grid[y][x] !== word[j]) {
                    canPlace = false;
                    break;
                }
                
                positions.push({ x, y });
            }
            
            if (canPlace) {
                // Kelimeyi yerleştir
                positions.forEach((pos, idx) => {
                    grid[pos.y][pos.x] = word[idx];
                });
                
                return {
                    word: turkish,
                    cyrillic: word,
                    positions,
                    direction: dir
                };
            }
        }
        
        return null;
    };

    // Boş hücreleri doldur
    const fillEmptyCells = (grid) => {
        const cyrillicLetters = 'абвгдежзийклмнопрстуфхцчшщыэюя';
        
        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                if (grid[y][x] === '') {
                    grid[y][x] = cyrillicLetters[Math.floor(Math.random() * cyrillicLetters.length)];
                }
            }
        }
    };

    // Hücre koordinatını al (mouse ve touch desteği)
    const getCellFromEvent = (e) => {
        if (!gridRef.current) return null;
        const rect = gridRef.current.getBoundingClientRect();
        
        // Touch event için clientX/Y'yi al
        const clientX = e.touches ? e.touches[0]?.clientX : e.clientX;
        const clientY = e.touches ? e.touches[0]?.clientY : e.clientY;
        
        if (clientX === undefined || clientY === undefined) return null;
        
        const x = Math.floor((clientX - rect.left) / (rect.width / GRID_SIZE));
        const y = Math.floor((clientY - rect.top) / (rect.height / GRID_SIZE));
        
        if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
            return { x, y };
        }
        return null;
    };

    // Hücre seçimini başlat (mouse ve touch)
    const handleStart = (e) => {
        if (gameStatus !== 'playing') return;
        e.preventDefault();
        const cell = getCellFromEvent(e);
        if (cell) {
            setIsSelecting(true);
            setSelectedCells([cell]);
            setMovementDirection(null); // Yeni seçim başladığında yön sıfırla
        }
    };

    // Hücre seçimini sürdür (mouse ve touch)
    const handleMove = (e) => {
        if (!isSelecting || gameStatus !== 'playing') return;
        e.preventDefault();
        const cell = getCellFromEvent(e);
        if (cell) {
            const lastCell = selectedCells[selectedCells.length - 1];
            if (lastCell && (cell.x !== lastCell.x || cell.y !== lastCell.y)) {
                // Komşu hücre mi kontrol et
                const dx = cell.x - lastCell.x;
                const dy = cell.y - lastCell.y;
                const absDx = Math.abs(dx);
                const absDy = Math.abs(dy);
                
                // Sadece direkt komşuları kabul et (1 adım)
                // Yatay: (1,0) veya (-1,0)
                // Dikey: (0,1) veya (0,-1)
                // Çapraz: (1,1), (-1,1), (1,-1), (-1,-1)
                const isHorizontal = (absDx === 1 && absDy === 0);
                const isVertical = (absDx === 0 && absDy === 1);
                const isDiagonal = (absDx === 1 && absDy === 1);
                
                // Geçerli hareket kontrolü - sadece direkt komşular
                if (isHorizontal || isVertical || isDiagonal) {
                    // Yön tutarlılığı kontrolü
                    let currentDirection = null;
                    if (isHorizontal) currentDirection = 'horizontal';
                    else if (isVertical) currentDirection = 'vertical';
                    else if (isDiagonal) currentDirection = 'diagonal';
                    
                    // Eğer daha önce bir yön belirlenmişse, aynı yönde olmalı
                    if (movementDirection !== null && currentDirection !== movementDirection) {
                        // Farklı yönde hareket - reddet
                        return;
                    }
                    
                    // İlk hareket ise yönü belirle
                    if (movementDirection === null && selectedCells.length === 1) {
                        setMovementDirection(currentDirection);
                    }
                    
                    // Eğer hücre zaten seçili değilse
                    if (!selectedCells.some(c => c.x === cell.x && c.y === cell.y)) {
                        setSelectedCells(prev => [...prev, cell]);
                    }
                }
                // Uzak hücrelere atlama yapılamaz - sadece direkt komşular kabul edilir
            }
        }
    };

    // Hücre seçimini bitir ve kelimeyi kontrol et (mouse ve touch)
    const handleEnd = () => {
        if (!isSelecting || gameStatus !== 'playing') return;
        setIsSelecting(false);
        
        if (selectedCells.length >= MIN_WORD_LENGTH) {
            checkWord();
        }
        
        setSelectedCells([]);
        setMovementDirection(null); // Yönü sıfırla
    };

    // Mouse event handlers
    const handleMouseDown = handleStart;
    const handleMouseMove = handleMove;
    const handleMouseUp = handleEnd;

    // Touch event handlers
    const handleTouchStart = handleStart;
    const handleTouchMove = handleMove;
    const handleTouchEnd = handleEnd;

    // Seçilen kelimeyi kontrol et
    const checkWord = () => {
        const selectedWord = selectedCells
            .map(cell => grid[cell.y][cell.x])
            .join('');
        
        // Tersini de kontrol et
        const reversedWord = selectedWord.split('').reverse().join('');
        
        // Kelime listesinde ara
        for (const wordData of words) {
            if (wordData.cyrillic === selectedWord || wordData.cyrillic === reversedWord) {
                const wordKey = wordData.word;
                if (!foundWords.has(wordKey)) {
                    setFoundWords(new Set([...foundWords, wordKey]));
                    const wordScore = wordData.cyrillic.length * 10;
                    setScore(prev => prev + wordScore);
                    
                    if (onRecordPractice) {
                        onRecordPractice(true);
                    }
                    
                    trackGameAnswer('wordhunt', true);
                    
                    // Tüm kelimeler bulundu mu?
                    if (foundWords.size + 1 >= words.length) {
                        setTimeout(() => {
                            nextLevel();
                        }, 1000);
                    }
                    
                    return;
                }
            }
        }
        
        // Yanlış kelime
        trackGameAnswer('wordhunt', false);
    };

    // İpucu göster
    const useHint = () => {
        if (hints <= 0 || gameStatus !== 'playing') return;
        
        const unfoundWords = words.filter(w => !foundWords.has(w.word));
        if (unfoundWords.length === 0) return;
        
        const randomWord = unfoundWords[Math.floor(Math.random() * unfoundWords.length)];
        setShowHint(randomWord);
        setHints(prev => prev - 1);
        
        setTimeout(() => {
            setShowHint(null);
        }, 3000);
    };

    // Sonraki seviye
    const nextLevel = () => {
        setLevel(prev => prev + 1);
        setTimeLeft(180 + (level * 30)); // Her seviyede 30 saniye ekstra
        setFoundWords(new Set());
        setScore(prev => prev + 100); // Seviye bonusu
        
        const { grid: newGrid, words: newWords } = generateGrid(8 + level);
        setGrid(newGrid);
        setWords(newWords);
    };

    // Oyunu başlat
    const startGame = () => {
        setGameStatus('playing');
        setScore(0);
        setFoundWords(new Set());
        setLevel(1);
        setTimeLeft(180);
        setHints(3);
        setSelectedCells([]);
        
        const { grid: newGrid, words: newWords } = generateGrid(8);
        setGrid(newGrid);
        setWords(newWords);
        
        trackGameStart('wordhunt', availableLetters);
        
        // Timer başlat
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    endGame();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    // Oyunu bitir
    const endGame = () => {
        setGameStatus('finished');
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        
        trackGameEnd('wordhunt', {
            score,
            level,
            wordsFound: foundWords.size,
            totalWords: words.length
        });
    };

    // Oyunu yeniden başlat
    const restartGame = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        setGameStatus('intro');
    };

    // Cleanup
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    // Hücre seçili mi?
    const isCellSelected = (x, y) => {
        return selectedCells.some(cell => cell.x === x && cell.y === y);
    };

    // Hücre bulunmuş kelimede mi?
    const isCellFound = (x, y) => {
        return words.some(wordData => {
            if (foundWords.has(wordData.word)) {
                return wordData.positions.some(pos => pos.x === x && pos.y === y);
            }
            return false;
        });
    };

    // İpucu kelimesinde mi?
    const isCellHinted = (x, y) => {
        if (!showHint) return false;
        return words.some(wordData => {
            if (wordData.word === showHint.word) {
                return wordData.positions.some(pos => pos.x === x && pos.y === y);
            }
            return false;
        });
    };

    if (gameStatus === 'intro') {
        return (
            <div className="wordhunt-game">
                <div className="wordhunt-intro">
                    <div className="intro-header">
                        <Search size={48} className="intro-icon" />
                        <h1>Kelime Avı</h1>
                        <p>Grid içinde Kiril harflerinden oluşan kelimeleri bul!</p>
                    </div>
                    
                    <div className="intro-instructions">
                        <h3>Nasıl Oynanır?</h3>
                        <ul>
                            <li>Grid içinde yatay, dikey veya çapraz kelimeler bul</li>
                            <li>Fareyi sürükleyerek kelimeleri seç</li>
                            <li>Her kelime için puan kazan</li>
                            <li>İpucu kullanarak zor kelimeleri bul</li>
                            <li>Zaman dolmadan tüm kelimeleri bul!</li>
                        </ul>
                    </div>
                    
                    <div className="intro-stats">
                        <div className="stat-item">
                            <Target size={20} />
                            <span>8+ kelime</span>
                        </div>
                        <div className="stat-item">
                            <Zap size={20} />
                            <span>3 dakika</span>
                        </div>
                        <div className="stat-item">
                            <Trophy size={20} />
                            <span>Skor tabanlı</span>
                        </div>
                    </div>
                    
                    <button className="start-button" onClick={startGame}>
                        <Play size={20} />
                        <span>Oyunu Başlat</span>
                    </button>
                    
                    <button className="back-button" onClick={onExit}>
                        <ArrowLeft size={18} />
                        <span>Geri Dön</span>
                    </button>
                </div>
            </div>
        );
    }

    if (gameStatus === 'finished') {
        const completionRate = words.length > 0 ? (foundWords.size / words.length * 100).toFixed(0) : 0;
        
        return (
            <div className="wordhunt-game">
                <div className="wordhunt-finished">
                    <div className="finished-header">
                        <Trophy size={48} className="finished-icon" />
                        <h1>Oyun Bitti!</h1>
                    </div>
                    
                    <div className="finished-stats">
                        <div className="stat-card">
                            <div className="stat-value">{score}</div>
                            <div className="stat-label">Toplam Skor</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{foundWords.size} / {words.length}</div>
                            <div className="stat-label">Bulunan Kelime</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{completionRate}%</div>
                            <div className="stat-label">Tamamlanma</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{level}</div>
                            <div className="stat-label">Seviye</div>
                        </div>
                    </div>
                    
                    <div className="finished-words">
                        <h3>Bulunan Kelimeler:</h3>
                        <div className="words-list">
                            {Array.from(foundWords).map(word => (
                                <span key={word} className="found-word">
                                    {word} ({transliterate(word)})
                                </span>
                            ))}
                        </div>
                    </div>
                    
                    <div className="finished-actions">
                        <button className="restart-button" onClick={restartGame}>
                            <RotateCcw size={18} />
                            <span>Yeniden Başla</span>
                        </button>
                        <button className="back-button" onClick={onExit}>
                            <ArrowLeft size={18} />
                            <span>Geri Dön</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="wordhunt-game">
            <div className="wordhunt-header">
                <button className="exit-button" onClick={onExit}>
                    <ArrowLeft size={18} />
                    <span>Çıkış</span>
                </button>
                
                <div className="hud">
                    <div className="hud-item">
                        <Trophy size={18} />
                        <span>Skor: {score}</span>
                    </div>
                    <div className="hud-item">
                        <Target size={18} />
                        <span>Seviye: {level}</span>
                    </div>
                    <div className="hud-item">
                        <Zap size={18} />
                        <span>İpucu: {hints}</span>
                    </div>
                    <div className="hud-item time">
                        <span>⏱️ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
                    </div>
                </div>
            </div>
            
            <div className="wordhunt-content">
                <div className="words-to-find">
                    <h3>Bulunacak Kelimeler:</h3>
                    <div className="words-grid">
                        {words.map((wordData, idx) => {
                            const isFound = foundWords.has(wordData.word);
                            return (
                                <div
                                    key={idx}
                                    className={`word-item ${isFound ? 'found' : ''} ${showHint?.word === wordData.word ? 'hinted' : ''}`}
                                >
                                    {isFound ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                                    <span>{wordData.word}</span>
                                </div>
                            );
                        })}
                    </div>
                    <button 
                        className="hint-button" 
                        onClick={useHint}
                        disabled={hints <= 0}
                    >
                        <Zap size={16} />
                        <span>İpucu Kullan ({hints})</span>
                    </button>
                </div>
                
                <div 
                    className="wordhunt-grid"
                    ref={gridRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    {grid.map((row, y) => (
                        <div key={y} className="grid-row">
                            {row.map((cell, x) => {
                                const isSelected = isCellSelected(x, y);
                                const isFound = isCellFound(x, y);
                                const isHinted = isCellHinted(x, y);
                                
                                return (
                                    <div
                                        key={`${x}-${y}`}
                                        className={`grid-cell ${isSelected ? 'selected' : ''} ${isFound ? 'found' : ''} ${isHinted ? 'hinted' : ''}`}
                                    >
                                        {cell}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

