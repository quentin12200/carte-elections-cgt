// Carte interactive pour la région Bourgogne-Franche-Comté
// Partie 1 : Variables et fonctions de base

// Liste des départements de la Bourgogne-Franche-Comté
const departementsBFC = ['21', '25', '39', '58', '70', '71', '89', '90'];

// Noms des départements
const departementNames = {
    '21': 'Côte-d\'Or',
    '25': 'Doubs',
    '39': 'Jura',
    '58': 'Nièvre',
    '70': 'Haute-Saône',
    '71': 'Saône-et-Loire',
    '89': 'Yonne',
    '90': 'Territoire de Belfort'
};

// Variables globales
let map;
let geoJsonLayer;
let currentSyndicat = 'CGT';
let currentMetric = 'voix';
let departementData = {};
let nationalData = {};
let bfcData = {
    voix: {},
    sieges: {},
    implantation: {}
};

// Couleurs pour les syndicats
const syndicatColors = {
    'CGT': '#e63946',
    'CFDT': '#457b9d',
    'FO': '#f4a261',
    'CFE-CGC': '#2a9d8f',
    'CFTC': '#6a994e',
    'UNSA': '#9b5de5',
    'SOLIDAIRES': '#f94144'
};

// Fonction pour initialiser la carte
function initMap() {
    // Créer la carte centrée sur la Bourgogne-Franche-Comté
    map = L.map('map').setView([47.2805, 5.0000], 8);
    
    // Ajouter le fond de carte OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Charger les données GeoJSON des départements français
    fetch('https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements.geojson')
        .then(response => response.json())
        .then(geoData => {
            // Filtrer pour ne garder que les départements de BFC
            const bfcGeoData = {
                type: 'FeatureCollection',
                features: geoData.features.filter(feature => 
                    departementsBFC.includes(feature.properties.code))
            };
            
            // Initialiser la couche GeoJSON
            initializeGeoJSON(bfcGeoData);
        });
}

// Fonction pour charger les données
function loadData() {
    // Utiliser le processeur de données pour charger toutes les données BFC
    BFCDataProcessor.loadAllBFCData()
        .then(processedBFCData => {
            // Stocker les données des départements
            Object.keys(processedBFCData.departements).forEach(deptCode => {
                departementData[deptCode] = processedBFCData.departements[deptCode];
            });
            
            // Stocker les données agrégées pour la région BFC
            Object.keys(processedBFCData.syndicats).forEach(syndicat => {
                bfcData.voix[syndicat] = processedBFCData.syndicats[syndicat].voix;
                bfcData.sieges[syndicat] = processedBFCData.syndicats[syndicat].sieges;
                bfcData.implantation[syndicat] = processedBFCData.syndicats[syndicat].implantation;
            });
            
            // Mettre à jour la coloration de la carte
            updateMapColoring();
            
            // Mettre à jour les statistiques régionales
            updateRegionalStats();
            
            // Mettre à jour le top des départements
            updateTopDepartements();
        })
        .catch(error => {
            console.error('Erreur lors du chargement des données:', error);
        });
}

// Fonction pour calculer les données agrégées pour la région BFC
function calculateBFCData() {
    // Initialiser les compteurs
    const syndicats = ['CGT', 'CFDT', 'FO', 'CFE-CGC', 'CFTC', 'UNSA', 'SOLIDAIRES'];
    
    syndicats.forEach(syndicat => {
        bfcData.voix[syndicat] = 0;
        bfcData.sieges[syndicat] = 0;
        bfcData.implantation[syndicat] = 0;
    });
    
    // Agréger les données de tous les départements
    departementsBFC.forEach(deptCode => {
        const data = departementData[deptCode];
        
        if (data && data.syndicats) {
            syndicats.forEach(syndicat => {
                if (data.syndicats[syndicat]) {
                    bfcData.voix[syndicat] += data.syndicats[syndicat].voix || 0;
                    bfcData.sieges[syndicat] += data.syndicats[syndicat].sieges || 0;
                    bfcData.implantation[syndicat] += data.syndicats[syndicat].implantation || 0;
                }
            });
        }
    });
}

// Fonction pour obtenir la couleur en fonction de la valeur
function getColor(value) {
    // Échelle de couleurs pour la CGT (du plus clair au plus foncé)
    const colors = ['#fde0e0', '#f7b7b7', '#f18e8e', '#eb6666', '#e63946', '#c1121f', '#9d0208'];
    
    if (value > 50) return colors[6];
    if (value > 40) return colors[5];
    if (value > 30) return colors[4];
    if (value > 20) return colors[3];
    if (value > 15) return colors[2];
    if (value > 10) return colors[1];
    return colors[0];
}
