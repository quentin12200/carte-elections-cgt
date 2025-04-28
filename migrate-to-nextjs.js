/**
 * Script de migration pour copier les données de l'ancienne structure vers la nouvelle structure Next.js
 * Ce script copie les fichiers HTML, CSS, JavaScript, images et données de l'ancien projet
 * vers la nouvelle structure Next.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Chemins des dossiers source et destination
const SOURCE_DIR = path.resolve(__dirname); // carte-deploy
const DEST_DIR = path.resolve(__dirname, 'carte-elections-cgt'); // carte-elections-cgt

// Vérifier si le dossier de destination existe
if (!fs.existsSync(DEST_DIR)) {
  console.error(`Le dossier de destination ${DEST_DIR} n'existe pas.`);
  process.exit(1);
}

// Créer les dossiers nécessaires dans la structure Next.js
const createDirectories = () => {
  const directories = [
    'public/css',
    'public/js',
    'public/images',
    'public/json_data',
    'public/json_data_ordonnees',
    'public/leaflet',
    'app/components',
    'app/utils',
  ];

  directories.forEach(dir => {
    const fullPath = path.join(DEST_DIR, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`Dossier créé: ${fullPath}`);
    }
  });
};

// Copier les fichiers statiques vers le dossier public
const copyStaticFiles = () => {
  // Liste des fichiers et dossiers à copier vers public
  const staticItems = [
    { source: 'css', dest: 'public/css' },
    { source: 'js', dest: 'public/js' },
    { source: 'json_data', dest: 'public/json_data' },
    { source: 'json_data_ordonnees', dest: 'public/json_data_ordonnees' },
    { source: 'leaflet', dest: 'public/leaflet' },
    { source: 'logo-cgt.png', dest: 'public/logo-cgt.png' },
    { source: 'liste_departements.json', dest: 'public/liste_departements.json' },
    { source: 'pv_data.csv', dest: 'public/pv_data.csv' },
    { source: 'resultats_departements_par_type.csv', dest: 'public/resultats_departements_par_type.csv' },
    { source: 'styles.css', dest: 'public/styles.css' },
  ];

  staticItems.forEach(item => {
    const sourcePath = path.join(SOURCE_DIR, item.source);
    const destPath = path.join(DEST_DIR, item.dest);

    if (!fs.existsSync(sourcePath)) {
      console.warn(`Avertissement: ${sourcePath} n'existe pas.`);
      return;
    }

    // Si c'est un dossier, utiliser une commande de copie récursive
    if (fs.statSync(sourcePath).isDirectory()) {
      try {
        // Sous Windows, utiliser xcopy pour copier récursivement
        const command = `xcopy "${sourcePath}" "${destPath}" /E /I /Y`;
        execSync(command);
        console.log(`Dossier copié: ${item.source} -> ${item.dest}`);
      } catch (error) {
        console.error(`Erreur lors de la copie du dossier ${item.source}:`, error.message);
      }
    } else {
      // Si c'est un fichier, utiliser fs.copyFileSync
      try {
        fs.copyFileSync(sourcePath, destPath);
        console.log(`Fichier copié: ${item.source} -> ${item.dest}`);
      } catch (error) {
        console.error(`Erreur lors de la copie du fichier ${item.source}:`, error.message);
      }
    }
  });
};

// Créer les pages Next.js à partir des fichiers HTML
const createNextPages = () => {
  // Liste des fichiers HTML à convertir en pages Next.js
  const htmlPages = [
    { source: 'index.html', dest: 'app/page.js' },
    { source: 'carte_data_csv.html', dest: 'app/carte_data_csv/page.js' },
    { source: 'carte_syndicale.html', dest: 'app/carte_syndicale/page.js' },
    { source: 'toutes_entreprises.html', dest: 'app/toutes_entreprises/page.js' },
    { source: 'pv_departement.html', dest: 'app/pv_departement/page.js' },
  ];

  htmlPages.forEach(page => {
    const sourcePath = path.join(SOURCE_DIR, page.source);
    const destPath = path.join(DEST_DIR, page.dest);

    if (!fs.existsSync(sourcePath)) {
      console.warn(`Avertissement: ${sourcePath} n'existe pas.`);
      return;
    }

    // Créer le dossier parent si nécessaire
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
      console.log(`Dossier créé: ${destDir}`);
    }

    // Lire le contenu HTML
    const htmlContent = fs.readFileSync(sourcePath, 'utf8');

    // Créer une page Next.js simple qui utilise le HTML
    const nextPageContent = `'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export default function ${page.source.replace('.html', 'Page').replace(/[^a-zA-Z0-9]/g, '')} () {
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
      <div dangerouslySetInnerHTML={{ __html: \`
        <!-- Contenu HTML converti de ${page.source} -->
        <!-- Remplacez cette section par le contenu HTML adapté pour Next.js -->
        <h1>Page ${page.source.replace('.html', '')}</h1>
        <p>Cette page est en cours de migration vers Next.js.</p>
      \`}} />
    </>
  );
}`;

    // Écrire la page Next.js
    fs.writeFileSync(destPath, nextPageContent);
    console.log(`Page Next.js créée: ${page.dest}`);
  });
};

// Créer un composant utilitaire pour les fonctions communes
const createUtilityFunctions = () => {
  const utilsPath = path.join(DEST_DIR, 'app/utils/dataUtils.js');
  
  const utilsContent = `/**
 * Fonctions utilitaires pour la manipulation des données
 */

// Fonction pour convertir en nombre sûr
export function safeNumber(val) {
  if (val === undefined || val === null || val === '') return 0;
  const num = parseFloat(val.toString().replace(',', '.'));
  return isNaN(num) ? 0 : num;
}

// Fonction pour récupérer le mapping des départements
export function getDepartementMapping() {
  // Cette fonction devrait charger les données depuis le fichier JSON
  // Pour l'instant, nous retournons un objet vide
  return {};
}

// Autres fonctions utilitaires migrées depuis l'ancien projet
`;

  fs.writeFileSync(utilsPath, utilsContent);
  console.log(`Fichier utilitaire créé: ${utilsPath}`);
};

// Mettre à jour le package.json pour inclure les dépendances nécessaires
const updatePackageJson = () => {
  const packageJsonPath = path.join(DEST_DIR, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    console.warn(`Avertissement: ${packageJsonPath} n'existe pas.`);
    return;
  }
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Ajouter les dépendances nécessaires
    const dependencies = {
      "datatables.net-bs5": "^1.13.4",
      "datatables.net-buttons-bs5": "^2.3.6",
      "jquery": "^3.6.0",
      "leaflet": "^1.9.4",
      "bootstrap": "^5.3.0-alpha1",
      "font-awesome": "^4.7.0"
    };
    
    packageJson.dependencies = { ...packageJson.dependencies, ...dependencies };
    
    // Écrire le package.json mis à jour
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log(`package.json mis à jour avec les dépendances nécessaires`);
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de package.json:`, error.message);
  }
};

// Fonction principale
const migrate = () => {
  console.log('Début de la migration...');
  
  createDirectories();
  copyStaticFiles();
  createNextPages();
  createUtilityFunctions();
  updatePackageJson();
  
  console.log('Migration terminée avec succès!');
  console.log('');
  console.log('Étapes suivantes:');
  console.log('1. Vérifiez les fichiers migrés dans le dossier carte-elections-cgt');
  console.log('2. Adaptez les pages Next.js selon vos besoins');
  console.log('3. Exécutez "npm install" dans le dossier carte-elections-cgt pour installer les dépendances');
  console.log('4. Lancez le serveur de développement avec "npm run dev"');
};

// Exécuter la migration
migrate();
