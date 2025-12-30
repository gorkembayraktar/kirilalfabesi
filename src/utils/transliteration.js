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

// Örnek kelimeler - öğrenme modu için (sadece Kiril alfabesinde karşılığı olan harflerle)
export const wordList = [
  { turkish: 'merhaba', level: 1 },
  { turkish: 'nasılsın', level: 1 },
  { turkish: 'evet', level: 1 },
  { turkish: 'hayır', level: 1 },
  { turkish: 'yarın', level: 1 },
  { turkish: 'dün', level: 1 },
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
  { turkish: 'arkadaş', level: 2 },
  { turkish: 'aile', level: 1 },
  { turkish: 'anne', level: 1 },
  { turkish: 'baba', level: 1 },
  { turkish: 'kardeş', level: 1 },
  { turkish: 'şehir', level: 1 },
  { turkish: 'istanbul', level: 2 },
  { turkish: 'ankara', level: 2 },
  { turkish: 'gece', level: 1 },
  { turkish: 'yıldız', level: 2 },
  { turkish: 'ay', level: 1 },
  { turkish: 'masa', level: 1 },
  { turkish: 'sandalye', level: 2 },
  { turkish: 'kapı', level: 1 },
  { turkish: 'pencere', level: 2 },
  { turkish: 'kalem', level: 1 },
  { turkish: 'defter', level: 2 },
  { turkish: 'sınıf', level: 1 },
  { turkish: 'ders', level: 1 },
  { turkish: 'sabah', level: 1 },
  { turkish: 'akşam', level: 1 },
  { turkish: 'saat', level: 1 },
  { turkish: 'hafta', level: 1 },
  { turkish: 'yıl', level: 1 },
  { turkish: 'elma', level: 1 },
  { turkish: 'muz', level: 1 },
  { turkish: 'portakal', level: 2 },
  { turkish: 'et', level: 1 },
  { turkish: 'tavuk', level: 1 },
  { turkish: 'balık', level: 1 },
  { turkish: 'süt', level: 1 },
  { turkish: 'peynir', level: 2 },
  { turkish: 'yumurta', level: 2 },
  { turkish: 'pazar', level: 1 },
  { turkish: 'hastane', level: 2 },
  { turkish: 'park', level: 1 },
  { turkish: 'deniz', level: 1 },
  { turkish: 'nehir', level: 2 },
  { turkish: 'orman', level: 2 },
  { turkish: 'hayvan', level: 2 },
  { turkish: 'kedi', level: 1 },
  { turkish: 'kuş', level: 1 },
  { turkish: 'at', level: 1 },
  { turkish: 'renk', level: 1 },
  { turkish: 'kırmızı', level: 2 },
  { turkish: 'mavi', level: 1 },
  { turkish: 'yeşil', level: 1 },
  { turkish: 'sarı', level: 1 },
  { turkish: 'siyah', level: 1 },
  { turkish: 'beyaz', level: 1 }
];

/**
 * Türkçe metni Kiril alfabesine çevirir
 * @param {string} text - Türkçe metin
 * @returns {string} - Kiril metin
 */
export function transliterate(text) {
  let result = '';
  let i = 0;
  
  // Çok karakterli eşleştirmeleri önce kontrol et (uzun olanları önce)
  const multiCharKeys = Object.keys(letterMap).filter(key => key.length > 1).sort((a, b) => b.length - a.length);
  
  while (i < text.length) {
    let matched = false;
    
    // Önce çok karakterli eşleştirmeleri dene
    for (const key of multiCharKeys) {
      if (text.substring(i, i + key.length).toLowerCase() === key.toLowerCase()) {
        // Büyük/küçük harf durumunu koru
        const original = text.substring(i, i + key.length);
        const isUpperCase = original === original.toUpperCase();
        const mapped = letterMap[isUpperCase ? key.toUpperCase() : key.toLowerCase()] || letterMap[key] || key;
        result += mapped;
        i += key.length;
        matched = true;
        break;
      }
    }
    
    // Eğer çok karakterli eşleştirme bulunamadıysa, tek karakterli eşleştirmeye bak
    if (!matched) {
      const char = text[i];
      result += letterMap[char] || char;
      i++;
    }
  }
  
  return result;
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
