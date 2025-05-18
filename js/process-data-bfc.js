// Script pour traiter les données des départements de Bourgogne-Franche-Comté

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

// Fonction pour traiter les données d'un département
function processDepartementData(rawData, deptCode) {
    console.log('Traitement des données pour le département', deptCode);
    console.log('Données brutes:', rawData);
    
    // Créer l'objet de données traitées
    const processedData = {
        code: deptCode,
        nom: departementNames[deptCode] || `Département ${deptCode}`,
        syndicats: {
            CGT: { voix: 0, sieges: 0, implantation: 0 },
            CFDT: { voix: 0, sieges: 0, implantation: 0 },
            'FO': { voix: 0, sieges: 0, implantation: 0 },
            'CFE-CGC': { voix: 0, sieges: 0, implantation: 0 },
            CFTC: { voix: 0, sieges: 0, implantation: 0 },
            UNSA: { voix: 0, sieges: 0, implantation: 0 },
            SUD: { voix: 0, sieges: 0, implantation: 0 }
        },
        entreprises: []
    };
    
    // Compteurs pour les totaux
    let totalVoix = 0;
    let totalSieges = 0;
    let totalImplantation = 0;
    
    // Traiter chaque entreprise
    if (Array.isArray(rawData)) {
        rawData.forEach(entreprise => {
            // Vérifier si l'entreprise a des données valides
            if (!entreprise || typeof entreprise !== 'object') {
                console.warn('Entreprise invalide:', entreprise);
                return;
            }
            
            // Créer un objet entreprise
            const entrepriseObj = {
                siret: entreprise.SIRET || '',
                nom: entreprise['Raison sociale'] || '',
                ville: entreprise.Ville || '',
                departement: deptCode,
                salaries: parseInt(entreprise.Inscrits) || 0,
                syndicats: {}
            };
            
            // Compter les voix pour chaque syndicat
            const syndicats = ['CGT', 'CFDT', 'FO', 'CFE-CGC', 'CFTC', 'UNSA', 'SUD'];
            
            syndicats.forEach(syndicat => {
                // Obtenir les voix pour ce syndicat
                let voix = 0;
                if (entreprise[syndicat] !== undefined) {
                    voix = parseFloat(entreprise[syndicat]) || 0;
                }
                
                if (voix > 0) {
                    // Ajouter les voix au syndicat dans l'entreprise
                    entrepriseObj.syndicats[syndicat] = { voix: voix };
                    
                    // Ajouter les voix au total du syndicat dans le département
                    processedData.syndicats[syndicat].voix += voix;
                    
                    // Incrémenter l'implantation du syndicat si présent dans l'entreprise
                    processedData.syndicats[syndicat].implantation++;
                    
                    // Ajouter au total des voix
                    totalVoix += voix;
                }
            });
            
            // Ajouter l'entreprise aux données du département
            processedData.entreprises.push(entrepriseObj);
        });
    } else {
        console.error('Les données brutes ne sont pas un tableau:', rawData);
    }
    
    // Calculer les pourcentages pour chaque syndicat
    Object.keys(processedData.syndicats).forEach(syndicat => {
        const syndicatData = processedData.syndicats[syndicat];
        
        // Calculer le pourcentage de voix
        syndicatData.pourcentage = totalVoix > 0 ? (syndicatData.voix / totalVoix * 100) : 0;
        
        // Estimer le nombre de sièges (simplifié)
        syndicatData.sieges = Math.round(syndicatData.pourcentage / 100 * processedData.entreprises.length);
        
        // Calculer le pourcentage d'implantation
        syndicatData.pourcentageImplantation = processedData.entreprises.length > 0 ? 
            (syndicatData.implantation / processedData.entreprises.length * 100) : 0;
    });
    
    console.log('Données traitées:', processedData);
    return processedData;
}

// Fonction pour charger et traiter les données d'un département
function loadAndProcessDepartementData(deptCode) {
    return fetch(`json_data/departement_${deptCode}.json`)
        .then(response => response.json())
        .then(data => {
            return processDepartementData(data, deptCode);
        })
        .catch(error => {
            console.error(`Erreur lors du chargement des données pour le département ${deptCode}:`, error);
            return null;
        });
}

// Fonction pour charger et traiter les données de tous les départements BFC
function loadAllBFCData() {
    const promises = departementsBFC.map(deptCode => loadAndProcessDepartementData(deptCode));
    
    return Promise.all(promises)
        .then(results => {
            const bfcData = {
                departements: {},
                syndicats: {
                    CGT: { voix: 0, sieges: 0, implantation: 0 },
                    CFDT: { voix: 0, sieges: 0, implantation: 0 },
                    'CGT-FO': { voix: 0, sieges: 0, implantation: 0 },
                    'CFE-CGC': { voix: 0, sieges: 0, implantation: 0 },
                    CFTC: { voix: 0, sieges: 0, implantation: 0 },
                    UNSA: { voix: 0, sieges: 0, implantation: 0 },
                    SOLIDAIRES: { voix: 0, sieges: 0, implantation: 0 }
                }
            };
            
            // Agréger les données de tous les départements
            results.forEach(deptData => {
                if (deptData) {
                    bfcData.departements[deptData.code] = deptData;
                    
                    // Agréger les données des syndicats
                    Object.keys(deptData.syndicats).forEach(syndicat => {
                        bfcData.syndicats[syndicat].voix += deptData.syndicats[syndicat].voix;
                        bfcData.syndicats[syndicat].sieges += deptData.syndicats[syndicat].sieges;
                        bfcData.syndicats[syndicat].implantation += deptData.syndicats[syndicat].implantation;
                    });
                }
            });
            
            // Calculer les pourcentages pour la région
            const totalVoix = Object.values(bfcData.syndicats).reduce((sum, s) => sum + s.voix, 0);
            const totalSieges = Object.values(bfcData.syndicats).reduce((sum, s) => sum + s.sieges, 0);
            const totalImplantation = Object.values(bfcData.syndicats).reduce((sum, s) => sum + s.implantation, 0);
            
            Object.keys(bfcData.syndicats).forEach(syndicat => {
                bfcData.syndicats[syndicat].pourcentage = totalVoix > 0 ? 
                    (bfcData.syndicats[syndicat].voix / totalVoix * 100) : 0;
                
                bfcData.syndicats[syndicat].pourcentageSieges = totalSieges > 0 ? 
                    (bfcData.syndicats[syndicat].sieges / totalSieges * 100) : 0;
                
                bfcData.syndicats[syndicat].pourcentageImplantation = totalImplantation > 0 ? 
                    (bfcData.syndicats[syndicat].implantation / totalImplantation * 100) : 0;
            });
            
            return bfcData;
        });
}

// Exporter les fonctions
window.BFCDataProcessor = {
    processDepartementData,
    loadAndProcessDepartementData,
    loadAllBFCData,
    departementsBFC,
    departementNames
};
