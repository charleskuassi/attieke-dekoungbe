import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Breadcrumb = () => {
  const location = useLocation();

  const getBreadcrumbs = () => {
    const breadcrumbs = [];
    const path = location.pathname.split('/').filter(Boolean);

    breadcrumbs.push({
      name: 'Accueil',
      path: '/',
    });

    const pathNames = {
      'menu': 'Menu',
      'checkout': 'Commande',
      'contact': 'Contact',
      'reviews': 'Avis',
      'login': 'Connexion',
      'register': 'Inscription',
      'dashboard': 'Mon Compte',
      'admin': 'Administration',
      'settings': 'Paramètres',
      'forgot-password': 'Mot de passe oublié',
    };

    let currentPath = '';
    path.forEach((segment, index) => {
      currentPath += '/' + segment;
      const name = pathNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

      // N'ajoute pas le dernier élément s'il est identique à la page actuelle
      if (index < path.length - 1 || !pathNames[segment]) {
        breadcrumbs.push({
          name,
          path: currentPath,
        });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  // Schema.org JSON-LD pour les breadcrumbs
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": `https://attiekedekoungbe.com${crumb.path}`
    }))
  };

  // Masquer sur la page d'accueil et les routes admin
  if (location.pathname === '/' || location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>
      <nav aria-label="Fil d'Ariane" className="bg-gray-50 dark:bg-gray-800 py-3 px-4 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto max-w-6xl">
          <ol className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            {breadcrumbs.map((crumb, index) => (
              <li key={crumb.path} className="flex items-center">
                {index > 0 && (
                  <ChevronRight size={16} className="mx-2 text-gray-400" aria-hidden="true" />
                )}
                {index === 0 ? (
                  <Link
                    to={crumb.path}
                    className="flex items-center hover:text-primary dark:hover:text-orange-400 transition-colors"
                  >
                    <Home size={16} />
                  </Link>
                ) : index === breadcrumbs.length - 1 ? (
                  <span className="text-gray-900 dark:text-white font-medium" aria-current="page">
                    {crumb.name}
                  </span>
                ) : (
                  <Link
                    to={crumb.path}
                    className="hover:text-primary dark:hover:text-orange-400 transition-colors"
                  >
                    {crumb.name}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </div>
      </nav>
    </>
  );
};

export default Breadcrumb;
