'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export default function IndexPage() {
  useEffect(() => {
    // Charger les scripts externes si nécessaire
    const loadExternalScripts = async () => {
      // Vous pouvez ajouter ici du code pour charger des scripts externes
      // qui étaient inclus dans le HTML d'origine
    };

    loadExternalScripts();
  }, []);

  return (
    <>
      {/* Vous pouvez ajouter des scripts externes avec le composant Script de Next.js */}
      <Script src="/js/entreprises-data.js" strategy="afterInteractive" />
      
      {/* Insérer le HTML converti ici */}
      <div dangerouslySetInnerHTML={{ __html: `
        <!-- Contenu HTML converti de index.html -->
        <!-- Remplacez cette section par le contenu HTML adapté pour Next.js -->
        <h1>Page index</h1>
        <p>Cette page est en cours de migration vers Next.js.</p>
      `}} />
    </>
  );
}