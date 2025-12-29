import { Helmet } from 'react-helmet-async';

const SEO = ({ 
    title, 
    description, 
    keywords, 
    image = 'https://kirilalfabesi.vercel.app/assets/kiril_demo.gif',
    url = 'https://kirilalfabesi.vercel.app/',
    type = 'website'
}) => {
    const fullTitle = title 
        ? `${title} | Kiril Alfabesi Öğreniyorum`
        : 'Kiril Alfabesi Öğreniyorum - Türkçe Konuşanlar İçin Ücretsiz Öğrenme Uygulaması';
    
    const fullDescription = description || 
        'Rusça ve diğer Kiril alfabesi dillerini öğrenin! İnteraktif eşleştirme, yazı pratiği, test modu ve daha fazlası. Türkçe konuşanlar için özel olarak tasarlanmış ücretsiz Kiril alfabesi öğrenme platformu.';
    
    const fullKeywords = keywords || 
        'kiril alfabesi, kiril harfleri, rusça öğrenme, kiril alfabesi öğrenme, türkçe kiril, kiril klavye, kiril harfleri türkçe, kiril alfabesi öğreniyorum, ücretsiz kiril öğrenme, online kiril öğrenme';

    return (
        <Helmet>
            {/* Primary Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="title" content={fullTitle} />
            <meta name="description" content={fullDescription} />
            <meta name="keywords" content={fullKeywords} />
            
            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={fullDescription} />
            <meta property="og:image" content={image} />
            
            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={url} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={fullDescription} />
            <meta name="twitter:image" content={image} />
            
            {/* Canonical URL */}
            <link rel="canonical" href={url} />
        </Helmet>
    );
};

export default SEO;

