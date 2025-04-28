// Script d'installation pour la Cartographie des Résultats Syndicaux - CGT avec authentification
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Vérifier si Node.js est installé
try {
  const nodeVersion = execSync('node --version').toString().trim();
  console.log(`Node.js est installé (${nodeVersion})`);
} catch (error) {
  console.error('Node.js n\'est pas installé. Veuillez l\'installer depuis https://nodejs.org/');
  process.exit(1);
}

// Fonction pour exécuter des commandes
function runCommand(command) {
  try {
    console.log(`Exécution de: ${command}`);
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Erreur lors de l'exécution de: ${command}`);
    console.error(error.message);
    return false;
  }
}

// Fonction principale d'installation
async function setup() {
  console.log('=== Installation du système d\'authentification pour Cartographie des Résultats Syndicaux - CGT ===');
  
  // Créer un dossier pour le nouveau projet Next.js
  const projectDir = path.join(process.cwd(), 'carte-elections-cgt');
  
  if (!fs.existsSync(projectDir)) {
    console.log('Création d\'un nouveau projet Next.js...');
    if (!runCommand('npx create-next-app@latest carte-elections-cgt --use-npm --tailwind --eslint --app')) {
      console.error('Échec de la création du projet Next.js');
      process.exit(1);
    }
  } else {
    console.log('Le dossier carte-elections-cgt existe déjà');
  }
  
  // Se déplacer dans le répertoire du projet
  process.chdir(projectDir);
  
  // Installer les dépendances nécessaires
  console.log('Installation des dépendances...');
  const dependencies = [
    '@supabase/supabase-js',
    '@supabase/auth-helpers-nextjs',
    'bcryptjs',
    'jsonwebtoken',
    'cookie',
    'datatables.net-bs5',
    'datatables.net-buttons-bs5',
    'leaflet'
  ];
  
  const devDependencies = [
    '@types/bcryptjs',
    '@types/jsonwebtoken',
    '@types/cookie',
    '@types/leaflet'
  ];
  
  if (!runCommand(`npm install ${dependencies.join(' ')}`)) {
    console.error('Échec de l\'installation des dépendances');
    process.exit(1);
  }
  
  if (!runCommand(`npm install -D ${devDependencies.join(' ')}`)) {
    console.error('Échec de l\'installation des dépendances de développement');
    process.exit(1);
  }
  
  // Créer le fichier .env.local
  console.log('Création du fichier .env.local...');
  const envContent = `NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon_supabase
JWT_SECRET=votre_secret_jwt_très_sécurisé
`;
  
  fs.writeFileSync(path.join(projectDir, '.env.local'), envContent);
  
  console.log('\n=== Installation terminée avec succès! ===');
  console.log('\nÉtapes suivantes:');
  console.log('1. Créez un compte sur Supabase (https://supabase.com/)');
  console.log('2. Créez un nouveau projet sur Supabase');
  console.log('3. Mettez à jour le fichier .env.local avec vos informations Supabase');
  console.log('4. Exécutez les scripts SQL fournis pour créer les tables nécessaires');
  console.log('5. Pour démarrer le serveur de développement, exécutez: cd carte-elections-cgt && npm run dev');
}

// Exécuter la fonction d'installation
setup().catch(error => {
  console.error('Erreur lors de l\'installation:', error);
  process.exit(1);
});
