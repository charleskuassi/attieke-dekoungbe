import React, { useEffect } from 'react';

const SEO = ({ title, description, schemaType = 'Restaurant' }) => {
  useEffect(() => {
    const siteUrl = "https://attieke-dekoungbe.com";
    const defaultImage = `${siteUrl}/images/delivery_packaging.jpg`;

    if (title) {
      document.title = `${title} | Attièkè Dèkoungbé`;
      document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
    }
    
    if (description) {
      document.querySelector('meta[name="description"]')?.setAttribute('content', description);
      document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
    }

    // Image d'aperçu pour WhatsApp/Réseaux
    document.querySelector('meta[property="og:image"]')?.setAttribute('content', defaultImage);
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', window.location.href);

  }, [title, description]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": schemaType,
    "name": "Attièkè Dèkoungbé",
    "image": "https://attieke-dekoungbe.art/images/hero-home.jpg",
    "url": "https://attieke-dekoungbe.com",
    "telephone": "+22900000000",
    "priceRange": "$$",
    "servesCuisine": "Ivoirienne, West African",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Quartier Dèkoungbé",
      "addressLocality": "Abomey-Calavi",
      "addressCountry": "BJ"
    },
    // ... geo stays same ...
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 6.3667,
      "longitude": 2.4333
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        "opens": "08:00",
        "closes": "22:00"
      }
    ],
    "menu": "https://attieke-dekoungbe.com/menu",
    "acceptsReservations": "False",
    "potentialAction": {
      "@type": "OrderAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://attieke-dekoungbe.com/menu",
        "inLanguage": "fr",
        "actionPlatform": [
          "http://schema.org/DesktopWebPlatform",
          "http://schema.org/IOSPlatform",
          "http://schema.org/AndroidPlatform"
        ]
      },
      "deliveryMethod": ["http://purl.org/goodrelations/v1#DeliveryModeDirectOutbound"],
      "priceSpecification": {
        "@type": "DeliveryChargeSpecification",
        "appliesToDeliveryMethod": "http://purl.org/goodrelations/v1#DeliveryModeDirectOutbound",
        "priceCurrency": "XOF",
        "price": 500
      }
    }
  };

  return (
    <script type="application/ld+json">
      {JSON.stringify(jsonLd)}
    </script>
  );
};

export default SEO;
