import { useState } from 'react';

const blogPosts = [
    {
        id: 1,
        title: 'Kiril Alfabesi Nedir?',
        icon: '📚',
        date: '23 Aralık 2024',
        readTime: '5 dk',
        summary: 'Kiril alfabesinin tarihçesi ve Türkçe ile ilişkisi hakkında temel bilgiler.',
        content: `
## Kiril Alfabesi Nedir?

Kiril alfabesi, **9. yüzyılda** Aziz Kiril ve Metodius kardeşler tarafından Slav halklarına Hristiyanlığı yaymak amacıyla oluşturulmuş bir yazı sistemidir. Bugün **Rusya, Ukrayna, Bulgaristan, Sırbistan, Kazakistan** ve daha birçok ülkede resmi alfabe olarak kullanılmaktadır.

### Neden Kiril Alfabesini Öğrenmeliyiz?

1. **250+ milyon insan** bu alfabeyi kullanıyor
2. Rusça, Ukraynaca, Bulgarca gibi dilleri öğrenmek için gerekli
3. Türk Cumhuriyetleri'nin bir kısmı hala bu alfabeyi kullanıyor
4. Kültürel ve ticari ilişkiler için önemli

### İlginç Bir Bilgi

Kiril alfabesindeki birçok harf aslında **Yunan alfabesinden** türetilmiştir. Örneğin:
- **А (a)** - Yunan Alfa'dan
- **Б (b)** - Yunan Beta'dan
- **Г (g)** - Yunan Gamma'dan

Türkçe konuşanlar için iyi haber şu ki, Kiril alfabesinde birçok harf Türkçe'deki seslerle birebir eşleşiyor!
        `
    },
    {
        id: 2,
        title: 'Türkçe ve Kiril: Harf Karşılıkları',
        icon: '🔤',
        date: '23 Aralık 2024',
        readTime: '7 dk',
        summary: 'Her Türkçe harfin Kiril karşılığını öğrenin.',
        content: `
## Türkçe Harflerin Kiril Karşılıkları

Türkçe'den Kiril alfabesine geçiş düşündüğünüzden daha kolaydır! İşte temel eşleşmeler:

### Sesli Harfler (Ünlüler)

| Türkçe | Kiril | Örnek |
|--------|-------|-------|
| A, a | А, а | **A**nkara → **А**нкара |
| E, e | Е, е | **E**v → **Е**в |
| I, ı | Ы, ы | **I**şık → **Ы**шык |
| İ, i | И, и | **İ**stanbul → **И**станбул |
| O, o | О, о | **O**kul → **О**кул |
| Ö, ö | Ё, ё | **Ö**ğretmen → **Ё**гретмен |
| U, u | У, у | **U**çak → **У**чак |
| Ü, ü | Ю, ю | **Ü**niversite → **Ю**ниверсите |

### Sessiz Harfler (Ünsüzler)

| Türkçe | Kiril | Telaffuz İpucu |
|--------|-------|---------------|
| B, b | Б, б | Aynı ses |
| C, c | Ц, ц | "ts" gibi |
| Ç, ç | Ч, ч | "ç" sesi |
| D, d | Д, д | Aynı ses |
| F, f | Ф, ф | Aynı ses |
| G, g | Г, г | Sert "g" |
| H, h | Х, х | Aynı ses |
| J, j | Ж, ж | "j" sesi |
| K, k | К, к | Aynı ses |
| L, l | Л, л | Aynı ses |
| M, m | М, м | Aynı ses |
| N, n | Н, н | Aynı ses |
| P, p | П, п | Aynı ses |
| R, r | Р, р | Aynı ses |
| S, s | С, с | Aynı ses |
| Ş, ş | Ш, ш | "ş" sesi |
| T, t | Т, т | Aynı ses |
| V, v | В, в | Aynı ses |
| Y, y | Й, й | Aynı ses |
| Z, z | З, з | Aynı ses |

### Pratik İpuçları

1. **Benzer görünenler**: А, О, К, М, Т harfleri Türkçe'dekilerle neredeyse aynı görünür
2. **Dikkat edilmesi gerekenler**: Н = N (H değil!), Р = R (P değil!), С = S (C değil!)
3. **Günlük pratik yapın**: Her gün 10 dakika bile yeterli!
        `
    },
    {
        id: 3,
        title: 'Kiril Öğrenmenin En Kolay Yolu',
        icon: '🎯',
        date: '23 Aralık 2024',
        readTime: '4 dk',
        summary: 'Kiril alfabesini hızlı ve etkili öğrenmek için ipuçları.',
        content: `
## Kiril Öğrenmenin En Kolay Yolu

Yeni bir alfabe öğrenmek korkutucu görünebilir, ama doğru yöntemlerle **1 haftada** temel okuma-yazma yapabilirsiniz!

### 🎓 Öğrenme Stratejisi

#### Gün 1-2: Tanıdık Harfler
İlk olarak Türkçe'ye benzeyen harfleri öğrenin:
- **А, О, К, М, Т, Е** - Bunlar neredeyse aynı!

#### Gün 3-4: "Yalancı Arkadaşlar"
Farklı görünen ama aslında tanıdık sesler:
- **Н** = N sesi (H değil!)
- **Р** = R sesi (P değil!)
- **С** = S sesi (C değil!)
- **В** = V sesi

#### Gün 5-7: Yeni Harfler
Türkçe'de olmayan şekilleri öğrenin:
- **Ш** = Ş sesi
- **Ч** = Ç sesi
- **Ж** = J sesi
- **Ц** = TS sesi

### 💡 Pratik Önerileri

1. **Günlük 15 dakika** düzenli çalışma, 2 saat düzensiz çalışmadan iyidir
2. **El yazısı ile yazın** - Motor bellek öğrenmeyi hızlandırır
3. **Tanıdık kelimeleri yazın** - Kendi adınızı, şehrinizi, sevdiğiniz şeyleri
4. **Bu uygulamayı kullanın** - Çeviri, Öğrenme ve Test modlarıyla pratik yapın!

### 🏆 Motivasyon

Unutmayın: **Her uzman bir zamanlar acemiydi!** 

Kiril alfabesini öğrenmek:
- Rusya'ya seyahat etmenizi kolaylaştırır
- Yeni iş fırsatları açar
- Beyninizi genç tutar
- Yeni bir dünyanın kapılarını aralar

**Hadi başlayalım! Çeviri modunda kendi cümlelerinizi yazarak pratik yapın.**
        `
    },
    {
        id: 4,
        title: 'Türkçedeki Hangi Harfler Kiril\'de Yok?',
        icon: '🇹🇷',
        date: '23 Aralık 2024',
        readTime: '6 dk',
        summary: 'Ç, C, Ğ, Ö, Ü gibi harflerin Kiril alfabesindeki durumları.',
        content: `
## Türkçe Özel Harfleri ve Kiril Karşılıkları

Türkçe konuşanların Kiril alfabesi öğrenirken en çok kafasını karıştıran konulardan biri: "Bizim 'Ç', 'C', 'Ğ' gibi harflerimiz ne olacak?" Gelin bu harfleri tek tek inceleyelim.

### 1. Ç Harfi (Çok Sorulan!)

En büyük yanılgılardan biri "Ç" harfinin Kiril'de olmadığıdır. **Aksine, Ç harfi vardır!**

- **Türkçe:** Ç (Çanta)
- **Kiril:** **Ч** (Çay)

Gördüğünüz gibi "4" rakamına benzeyen **Ч** harfi, tam olarak bizim "Ç" sesimizi verir. Yani "Çok" yazmak isterseniz "Чок" yazabilirsiniz.

### 2. C Harfi (Cem) - Kötü Haber!

İşte burada işler biraz karışıyor. Standart Rus Kiril alfabesinde bizim yumuşak "C" (Cem, Cam) sesini veren **tek bir harf yoktur**.

Bunun yerine genellikle iki harf birleştirilir:
- **D** (Д) + **J** (Ж) = **ДЖ**

Örneğin "Can" ismini yazmak isterseniz "Джан" (Djan) şeklinde yazmanız gerekir.

### 3. Ğ (Yumuşak G)

Maalesef "Ğ" harfinin de doğrudan bir karşılığı yoktur. Genellikle bu ses yutulur veya uzatılır.

- **Dağ** -> Да (Da)
- **Yağmur** -> Ямур (Yamur)

### 4. Ö ve Ü Harfleri

Bu harfler **Rusça** alfabesinde (tam olarak bizdeki gibi) yoktur. Rusça'da "Yo" (Ё) ve "Yu" (Ю) vardır.

ANCAK! **Kazakça, Kırgızca, Tatarca** gibi Türki dillerin Kiril alfabelerinde bu harfler özel olarak üretilmiştir:
- **Ö** -> **Ө** (Ortası çizgili O)
- **Ü** -> **Ү** (Düz çizgili Y)

### 5. I (Işık) Harfi

Bizim "I" sesimize en yakın harf **Ы** harfidir. Tam olarak aynısı olmasa da (biraz daha gırtlaktan ve kalın bir 'ı-i' karışımıdır), "I" sesi yerine kullanılır.

- **Işık** -> **Ы**şık

### Özet Tablo

| Türkçe Harf | Kiril Durumu | Çözüm |
|-------------|--------------|-------|
| **Ç** | ✅ VAR | **Ч** harfini kullanın |
| **C** | ❌ YOK | **ДЖ** (Dj) kombinasyonu |
| **Ö** | ⚠️ Rusça'da Yok | **Ё** (Yo) veya **O** |
| **Ü** | ⚠️ Rusça'da Yok | **Ю** (Yu) veya **У** |
| **Ğ** | ❌ YOK | Genelde yazılmaz |
        `
    }
];

export default function BlogMode() {
    const [selectedPost, setSelectedPost] = useState(null);

    if (selectedPost) {
        return (
            <div className="blog-mode">
                <div className="blog-post-full">
                    <button className="blog-back-btn" onClick={() => setSelectedPost(null)}>
                        ← Geri Dön
                    </button>

                    <article className="blog-article">
                        <div className="blog-post-header">
                            <span className="blog-post-icon">{selectedPost.icon}</span>
                            <div className="blog-post-meta">
                                <span>{selectedPost.date}</span>
                                <span>•</span>
                                <span>{selectedPost.readTime} okuma</span>
                            </div>
                        </div>

                        <h1>{selectedPost.title}</h1>

                        <div
                            className="blog-content"
                            dangerouslySetInnerHTML={{
                                __html: formatMarkdown(selectedPost.content)
                            }}
                        />
                    </article>
                </div>
            </div>
        );
    }

    return (
        <div className="blog-mode">
            <div className="blog-header">
                <h1>📖 Blog</h1>
                <p>Kiril alfabesi hakkında bilgi edinin</p>
            </div>

            <div className="blog-grid">
                {blogPosts.map(post => (
                    <div
                        key={post.id}
                        className="blog-card"
                        onClick={() => setSelectedPost(post)}
                    >
                        <div className="blog-card-icon">{post.icon}</div>
                        <div className="blog-card-content">
                            <h2>{post.title}</h2>
                            <p>{post.summary}</p>
                            <div className="blog-card-footer">
                                <span className="blog-card-date">{post.date}</span>
                                <span className="blog-card-read">{post.readTime} okuma →</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Basit markdown formatlamasi
function formatMarkdown(text) {
    return text
        // Headers
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        // Bold
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Tables
        .replace(/\|(.+)\|/g, (match) => {
            const cells = match.split('|').filter(c => c.trim());
            if (cells.some(c => c.includes('---'))) {
                return '';
            }
            const isHeader = match.includes('Türkçe') || match.includes('Kiril');
            const tag = isHeader ? 'th' : 'td';
            const row = cells.map(c => `<${tag}>${c.trim()}</${tag}>`).join('');
            return `<tr>${row}</tr>`;
        })
        // Wrap tables
        .replace(/(<tr>.*<\/tr>\n?)+/g, (match) => `<table>${match}</table>`)
        // Lists
        .replace(/^\d+\. (.*)$/gm, '<li>$1</li>')
        .replace(/^- (.*)$/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`)
        // Paragraphs
        .replace(/\n\n/g, '</p><p>')
        .replace(/^(?!<)(.+)$/gm, '<p>$1</p>')
        // Cleanup
        .replace(/<p><\/p>/g, '')
        .replace(/<p>(<h|<ul|<table)/g, '$1')
        .replace(/(<\/h\d>|<\/ul>|<\/table>)<\/p>/g, '$1');
}
