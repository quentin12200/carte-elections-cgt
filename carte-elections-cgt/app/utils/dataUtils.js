/**
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
