// Türkçe → Kiril harf eşleşme tablosu
const letterMap = {
  'a': 'а', 'A': 'А',
  'b': 'б', 'B': 'Б',
  'c': 'ц', 'C': 'Ц',
  'ç': 'ч', 'Ç': 'Ч',
  'd': 'д', 'D': 'Д',
  'e': 'е', 'E': 'Е',
  'f': 'ф', 'F': 'Ф',
  'g': 'г', 'G': 'Г',
  'h': 'х', 'H': 'Х',
  'ı': 'ы', 'I': 'Ы',
  'i': 'и', 'İ': 'И',
  'j': 'ж', 'J': 'Ж',
  'k': 'к', 'K': 'К',
  'l': 'л', 'L': 'Л',
  'm': 'м', 'M': 'М',
  'n': 'н', 'N': 'Н',
  'o': 'о', 'O': 'О',
  'p': 'п', 'P': 'П',
  'r': 'р', 'R': 'Р',
  's': 'с', 'S': 'С',
  'ş': 'ш', 'Ş': 'Ш',
  't': 'т', 'T': 'Т',
  'u': 'у', 'U': 'У',
  'v': 'в', 'V': 'В',
  'y': 'й', 'Y': 'Й',
  'z': 'з', 'Z': 'З'
};

// Örnek kelimeler - öğrenme modu için
export const wordList = [
  { turkish: 'merhaba', level: 1 },
  { turkish: 'günaydın', level: 1 },
  { turkish: 'teşekkürler', level: 2 },
  { turkish: 'nasılsın', level: 1 },
  { turkish: 'evet', level: 1 },
  { turkish: 'hayır', level: 1 },
  { turkish: 'lütfen', level: 1 },
  { turkish: 'hoşçakal', level: 1 },
  { turkish: 'bugün', level: 1 },
  { turkish: 'yarın', level: 1 },
  { turkish: 'dün', level: 1 },
  { turkish: 'güzel', level: 1 },
  { turkish: 'hava', level: 1 },
  { turkish: 'su', level: 1 },
  { turkish: 'ekmek', level: 1 },
  { turkish: 'çay', level: 1 },
  { turkish: 'kahve', level: 1 },
  { turkish: 'kitap', level: 1 },
  { turkish: 'okul', level: 1 },
  { turkish: 'ev', level: 1 },
  { turkish: 'araba', level: 1 },
  { turkish: 'telefon', level: 2 },
  { turkish: 'bilgisayar', level: 3 },
  { turkish: 'öğretmen', level: 2 },
  { turkish: 'öğrenci', level: 2 },
  { turkish: 'arkadaş', level: 2 },
  { turkish: 'aile', level: 1 },
  { turkish: 'anne', level: 1 },
  { turkish: 'baba', level: 1 },
  { turkish: 'kardeş', level: 1 },
  { turkish: 'şehir', level: 1 },
  { turkish: 'istanbul', level: 2 },
  { turkish: 'ankara', level: 2 },
  { turkish: 'türkiye', level: 2 },
  { turkish: 'dünya', level: 1 },
  { turkish: 'gece', level: 1 },
  { turkish: 'gündüz', level: 1 },
  { turkish: 'yıldız', level: 2 },
  { turkish: 'güneş', level: 1 },
  { turkish: 'ay', level: 1 }
];

/**
 * Türkçe metni Kiril alfabesine çevirir
 * @param {string} text - Türkçe metin
 * @returns {string} - Kiril metin
 */
export function transliterate(text) {
  return text.split('').map(char => letterMap[char] || char).join('');
}

/**
 * Tüm harf eşleşmelerini döndürür (sadece küçük harfler)
 * @returns {Array} - Harf eşleşme listesi
 */
export function getLetterMapping() {
  const letters = [];
  const seen = new Set();
  
  for (const [turkish, cyrillic] of Object.entries(letterMap)) {
    const lowerTurkish = turkish.toLocaleLowerCase('tr-TR');
    if (!seen.has(lowerTurkish) && turkish === lowerTurkish) {
      seen.add(lowerTurkish);
      const upperTurkish = turkish.toLocaleUpperCase('tr-TR');
      letters.push({
        turkish: upperTurkish + turkish,
        cyrillic: (letterMap[upperTurkish] || '') + cyrillic
      });
    }
  }
  
  return letters;
}

/**
 * Rastgele kelimeler seçer
 * @param {number} count - Kelime sayısı
 * @param {number} maxLevel - Maksimum zorluk seviyesi
 * @returns {Array} - Rastgele kelime listesi
 */
export function getRandomWords(count, maxLevel = 3) {
  const filtered = wordList.filter(w => w.level <= maxLevel);
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Cevabı kontrol eder
 * @param {string} userAnswer - Kullanıcının cevabı
 * @param {string} turkishWord - Türkçe kelime
 * @returns {boolean} - Doğru mu?
 */
export function checkAnswer(userAnswer, turkishWord) {
  const correct = transliterate(turkishWord);
  return userAnswer.trim().toLocaleLowerCase('tr-TR') === correct.toLocaleLowerCase('tr-TR');
}
