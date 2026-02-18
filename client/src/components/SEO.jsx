import React, { useEffect } from 'react';

const SEO = ({ title, description, schemaType = 'Restaurant' }) => {
  useEffect(() => {
    if (title) {
      document.title = `${title} | Attièkè Dèkoungbé`;
    }
    if (description) {
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', description);
      }
    }
  }, [title, description]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": schemaType,
    "name": "Attièkè Dèkoungbé",
    "image": "https://attieke-dekoungbe.art/images/hero-home.jpg",
    "url": "https://attieke-dekoungbe.art",
    "telephone": "+2250101010101",
    "priceRange": "$$",
    "servesCuisine": "Ivoirienne, West African",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Quartier Dêkoungbé",
      "addressLocality": "Abidjan",
      "addressCountry": "CI"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 5.3484,
      "longitude": -4.0305
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        "opens": "08:00",
        "closes": "22:00"
      }
    ],
    "menu": "https://attieke-dekoungbe.art/menu",
    "acceptsReservations": "False",
    "potentialAction": {
      "@type": "OrderAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://attieke-dekoungbe.art/menu",
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
