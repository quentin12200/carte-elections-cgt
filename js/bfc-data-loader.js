// Script de chargement et traitement des données pour la Bourgogne-Franche-Comté

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

// Couleurs pour les syndicats
const syndicatColors = {
    'CGT': '#e63946',
    'CFDT': '#457b9d',
    'FO': '#f4a261',
    'CFE-CGC': '#2a9d8f',
    'CFTC': '#6a994e',
    'UNSA': '#9b5de5',
    'SUD': '#f94144'
};

// Variables globales pour stocker les données
let departementData = {};
let bfcData = {
    voix: {},
    sieges: {},
    implantation: {}
};

// Fonction pour charger les données d'un département
function loadDepartementData(deptCode) {
    console.log(`Début du chargement des données pour le département ${deptCode}`);
    const url = `json_data/departement_${deptCode}.json`;
    console.log(`URL: ${url}`);
    
    return fetch(url)
        .then(response => {
            console.log(`Réponse pour ${deptCode}:`, response.status, response.statusText);
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log(`Données brutes du département ${deptCode} chargées:`, data ? (Array.isArray(data) ? data.length : 'non-array') : 'null', 'entreprises');
            if (!data || !Array.isArray(data)) {
                console.error(`Données invalides pour ${deptCode}:`, data);
                return null;
            }
            return processDepartementData(data, deptCode);
        })
        .catch(error => {
            console.error(`Erreur lors du chargement des données pour le département ${deptCode}:`, error);
            return null;
        });
}

// Fonction pour traiter les données d'un département
function processDepartementData(rawData, deptCode) {
    console.log(`Traitement des données pour le département ${deptCode}`);
    
    // Créer l'objet de données traitées
    const processedData = {
        code: deptCode,
        nom: departementNames[deptCode] || `Département ${deptCode}`,
        syndicats: {
            CGT: { voix: 0, sieges: 0, implantation: 0 },
            CFDT: { voix: 0, sieges: 0, implantation: 0 },
            FO: { voix: 0, sieges: 0, implantation: 0 },
            'CFE-CGC': { voix: 0, sieges: 0, implantation: 0 },
            CFTC: { voix: 0, sieges: 0, implantation: 0 },
            UNSA: { voix: 0, sieges: 0, implantation: 0 },
            SUD: { voix: 0, sieges: 0, implantation: 0 }
        },
        entreprises: []
    };
    
    // Compteurs pour les totaux
    let totalVoix = 0;
    
    // Traiter chaque entreprise
    if (Array.isArray(rawData)) {
        rawData.forEach(entreprise => {
            // Vérifier si l'entreprise a des données valides
            if (!entreprise || typeof entreprise !== 'object') {
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
            
            // Correspondance entre les noms de syndicats dans les données et nos noms
            const syndicatMapping = {
                'CGT': 'CGT',
                'CFDT': 'CFDT',
                'CGT-FO': 'FO',
                'FO': 'FO',  // Au cas où certains fichiers utilisent FO directement
                'CFE-CGC': 'CFE-CGC',
                'CFTC': 'CFTC',
                'UNSA': 'UNSA',
                'SOLIDAIRES': 'SUD',
                'SUD': 'SUD'  // Au cas où certains fichiers utilisent SUD directement
            };
            
            // Parcourir tous les champs de l'entreprise pour trouver les syndicats
            Object.keys(entreprise).forEach(key => {
                // Vérifier si la clé correspond à un syndicat
                if (syndicatMapping[key]) {
                    const syndicat = syndicatMapping[key];
                    const voix = parseFloat(entreprise[key]) || 0;
                    
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
    
    console.log(`Données traitées pour le département ${deptCode}:`, 
                `${processedData.entreprises.length} entreprises, `,
                `CGT: ${processedData.syndicats.CGT.pourcentage.toFixed(2)}%`);
    
    // Stocker les données dans la variable globale
    departementData[deptCode] = processedData;
    
    return processedData;
}

// Fonction pour charger les données de tous les départements BFC
function loadAllBFCData() {
    console.log('Chargement des données pour tous les départements BFC');
    
    // Charger les données pour chaque département
    const promises = departementsBFC.map(deptCode => loadDepartementData(deptCode));
    
    return Promise.all(promises)
        .then(results => {
            console.log('Toutes les données départementales chargées');
            
            // Agréger les données pour la région BFC
            aggregateBFCData();
            
            return {
                departements: departementData,
                region: bfcData
            };
        });
}

// Fonction pour agréger les données de tous les départements pour la région BFC
function aggregateBFCData() {
    console.log('Agrégation des données pour la région BFC');
    
    // Réinitialiser les données BFC
    bfcData = {
        voix: {},
        sieges: {},
        implantation: {}
    };
    
    // Initialiser les compteurs pour chaque syndicat
    const syndicats = ['CGT', 'CFDT', 'FO', 'CFE-CGC', 'CFTC', 'UNSA', 'SUD'];
    syndicats.forEach(syndicat => {
        bfcData.voix[syndicat] = 0;
        bfcData.sieges[syndicat] = 0;
        bfcData.implantation[syndicat] = 0;
    });
    
    // Agréger les données de tous les départements
    departementsBFC.forEach(deptCode => {
        const data = departementData[deptCode];
        if (!data || !data.syndicats) return;
        
        syndicats.forEach(syndicat => {
            if (data.syndicats[syndicat]) {
                bfcData.voix[syndicat] += data.syndicats[syndicat].voix || 0;
                bfcData.sieges[syndicat] += data.syndicats[syndicat].sieges || 0;
                bfcData.implantation[syndicat] += data.syndicats[syndicat].implantation || 0;
            }
        });
    });
    
    // Calculer les pourcentages
    const totalVoix = Object.values(bfcData.voix).reduce((sum, val) => sum + val, 0);
    const totalSieges = Object.values(bfcData.sieges).reduce((sum, val) => sum + val, 0);
    const totalImplantation = Object.values(bfcData.implantation).reduce((sum, val) => sum + val, 0);
    
    syndicats.forEach(syndicat => {
        bfcData.voix[syndicat + '_pourcentage'] = totalVoix > 0 ? 
            (bfcData.voix[syndicat] / totalVoix * 100) : 0;
        
        bfcData.sieges[syndicat + '_pourcentage'] = totalSieges > 0 ? 
            (bfcData.sieges[syndicat] / totalSieges * 100) : 0;
        
        bfcData.implantation[syndicat + '_pourcentage'] = totalImplantation > 0 ? 
            (bfcData.implantation[syndicat] / totalImplantation * 100) : 0;
    });
    
    console.log('Données BFC agrégées:', 
                `CGT: ${bfcData.voix.CGT_pourcentage.toFixed(2)}%, `,
                `${bfcData.implantation.CGT} implantations`);
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

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initialisation de la page BFC');
    
    // Vérifier si nous sommes sur la page des départements
    if (document.querySelector('.dept-selector')) {
        initDepartementPage();
    }
    // Vérifier si nous sommes sur la page de comparaison
    else if (document.getElementById('key-indicators')) {
        initComparaisonPage();
    }
    // Vérifier si nous sommes sur la page de carte
    else if (document.getElementById('map')) {
        initCartePage();
    }
});

// Initialisation de la page des départements
function initDepartementPage() {
    console.log('Initialisation de la page des départements');
    
    // Charger les données du département par défaut (21)
    loadDepartementData('21').then(data => {
        if (data) {
            updateDepartementView('21');
        }
    });
    
    // Ajouter les gestionnaires d'événements pour les boutons de département
    document.querySelectorAll('.dept-selector .btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const deptCode = this.dataset.dept;
            
            // Mettre à jour les boutons
            document.querySelectorAll('.dept-selector .btn').forEach(b => {
                b.classList.remove('active');
            });
            this.classList.add('active');
            
            // Charger les données si elles ne sont pas déjà chargées
            if (!departementData[deptCode]) {
                loadDepartementData(deptCode).then(data => {
                    if (data) {
                        updateDepartementView(deptCode);
                    }
                });
            } else {
                updateDepartementView(deptCode);
            }
        });
    });
}

// Mise à jour de la vue du département
function updateDepartementView(deptCode) {
    console.log(`Mise à jour de la vue pour le département ${deptCode}`);
    
    const data = departementData[deptCode];
    if (!data) {
        console.error(`Pas de données pour le département ${deptCode}`);
        return;
    }
    
    // Mettre à jour le titre
    const titleElement = document.getElementById('dept-title');
    if (titleElement) {
        titleElement.textContent = `${data.nom} (${deptCode})`;
    }
    
    // Mettre à jour les statistiques
    updateDepartementStats(deptCode);
    
    // Mettre à jour les tableaux
    updateEntreprisesTable(deptCode);
    updateSyndicatsTable(deptCode);
}

// Mise à jour des statistiques du département
function updateDepartementStats(deptCode) {
    const statsContainer = document.getElementById('dept-stats');
    if (!statsContainer) return;
    
    const data = departementData[deptCode];
    if (!data || !data.syndicats || !data.syndicats.CGT) return;
    
    // Vider le conteneur
    statsContainer.innerHTML = '';
    
    // Créer les statistiques
    const cgtData = data.syndicats.CGT;
    const totalEntreprises = data.entreprises ? data.entreprises.length : 0;
    const totalSalaries = data.entreprises ? data.entreprises.reduce((sum, e) => sum + (e.salaries || 0), 0) : 0;
    
    // Pourcentage CGT
    createStatItem(statsContainer, cgtData.pourcentage ? cgtData.pourcentage.toFixed(2) + '%' : 'N/A', 'CGT');
    
    // Sièges CGT
    createStatItem(statsContainer, cgtData.sieges ? cgtData.sieges.toLocaleString() : 'N/A', 'Sièges CGT');
    
    // Nombre d'entreprises
    createStatItem(statsContainer, totalEntreprises.toLocaleString(), 'Entreprises');
    
    // Nombre de salariés
    createStatItem(statsContainer, totalSalaries.toLocaleString(), 'Salariés');
}

// Fonction pour créer un élément de statistique
function createStatItem(container, value, label) {
    const item = document.createElement('div');
    item.className = 'dept-stat-item';
    
    const valueDiv = document.createElement('div');
    valueDiv.className = 'dept-stat-value';
    valueDiv.textContent = value;
    
    const labelDiv = document.createElement('div');
    labelDiv.className = 'dept-stat-label';
    labelDiv.textContent = label;
    
    item.appendChild(valueDiv);
    item.appendChild(labelDiv);
    container.appendChild(item);
}

// Mise à jour du tableau des entreprises
function updateEntreprisesTable(deptCode) {
    const tableContainer = document.getElementById('entreprises-table-container');
    if (!tableContainer) return;
    
    const data = departementData[deptCode];
    if (!data || !data.entreprises || data.entreprises.length === 0) {
        tableContainer.innerHTML = '<p class="text-center">Aucune entreprise disponible pour ce département</p>';
        return;
    }
    
    // Créer le tableau
    let tableHtml = `
        <table class="table table-striped table-hover" id="entreprises-table">
            <thead>
                <tr>
                    <th>SIRET</th>
                    <th>Entreprise</th>
                    <th>Ville</th>
                    <th>CGT (%)</th>
                    <th>Sièges CGT</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    // Ajouter les lignes pour chaque entreprise
    data.entreprises.forEach(entreprise => {
        // Calculer le pourcentage CGT
        const cgtVoix = entreprise.syndicats?.CGT?.voix || 0;
        const totalVoix = Object.values(entreprise.syndicats || {}).reduce((sum, syndicat) => sum + (syndicat.voix || 0), 0);
        const cgtPourcentage = totalVoix > 0 ? (cgtVoix / totalVoix * 100).toFixed(2) : '0.00';
        
        tableHtml += `
            <tr>
                <td>${entreprise.siret || 'N/A'}</td>
                <td>${entreprise.nom || 'N/A'}</td>
                <td>${entreprise.ville || 'N/A'}</td>
                <td>${cgtPourcentage}%</td>
                <td>${entreprise.syndicats?.CGT?.sieges || 0}</td>
            </tr>
        `;
    });
    
    tableHtml += `
            </tbody>
        </table>
    `;
    
    // Mettre à jour le contenu
    tableContainer.innerHTML = tableHtml;
}

// Mise à jour du tableau des syndicats
function updateSyndicatsTable(deptCode) {
    const tableBody = document.querySelector('#syndicats-table tbody');
    if (!tableBody) return;
    
    const data = departementData[deptCode];
    if (!data || !data.syndicats) return;
    
    // Vider le tableau
    tableBody.innerHTML = '';
    
    // Ajouter les données pour chaque syndicat
    Object.entries(data.syndicats).forEach(([syndicat, syndicatData]) => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td><span style="display: inline-block; width: 15px; height: 15px; background-color: ${syndicatColors[syndicat]}; margin-right: 5px; border-radius: 3px;"></span> ${syndicat}</td>
            <td>${syndicatData.voix ? syndicatData.voix.toLocaleString() : 'N/A'}</td>
            <td>${syndicatData.pourcentage ? syndicatData.pourcentage.toFixed(2) + '%' : 'N/A'}</td>
            <td>${syndicatData.sieges ? syndicatData.sieges.toLocaleString() : 'N/A'}</td>
            <td>${syndicatData.implantation ? syndicatData.implantation.toLocaleString() : 'N/A'}</td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Initialisation de la page de comparaison
function initComparaisonPage() {
    console.log('Initialisation de la page de comparaison');
    
    // Charger toutes les données BFC
    loadAllBFCData().then(() => {
        // Mettre à jour les indicateurs clés
        updateKeyIndicators();
    });
}

// Mise à jour des indicateurs clés pour la comparaison
function updateKeyIndicators() {
    const keyIndicatorsContainer = document.getElementById('key-indicators');
    if (!keyIndicatorsContainer) return;
    
    // Vider le conteneur
    keyIndicatorsContainer.innerHTML = '';
    
    // Créer les indicateurs clés pour la CGT
    if (bfcData.voix.CGT) {
        // Pourcentage de voix
        const voixBFC = bfcData.voix.CGT_pourcentage || 0;
        const voixNational = 23.5; // Valeur fictive pour l'exemple
        const voixDiff = voixBFC - voixNational;
        
        const voixCard = createIndicatorCard(
            'Pourcentage de voix',
            voixBFC.toFixed(2) + '%',
            voixNational.toFixed(2) + '%',
            voixDiff.toFixed(2) + ' points',
            voixDiff >= 0
        );
        keyIndicatorsContainer.appendChild(voixCard);
        
        // Nombre de sièges
        const siegesBFC = bfcData.sieges.CGT || 0;
        const siegesNational = 15000; // Valeur fictive pour l'exemple
        const siegesPctBFC = bfcData.sieges.CGT_pourcentage || 0;
        const siegesPctNational = 22.8; // Valeur fictive pour l'exemple
        const siegesDiff = siegesPctBFC - siegesPctNational;
        
        const siegesCard = createIndicatorCard(
            'Nombre de sièges',
            siegesBFC.toLocaleString(),
            siegesNational.toLocaleString(),
            siegesDiff.toFixed(1) + '%',
            siegesDiff >= 0
        );
        keyIndicatorsContainer.appendChild(siegesCard);
        
        // Implantation
        const implantationBFC = bfcData.implantation.CGT || 0;
        const implantationNational = 25000; // Valeur fictive pour l'exemple
        const implantationPctBFC = bfcData.implantation.CGT_pourcentage || 0;
        const implantationPctNational = 24.2; // Valeur fictive pour l'exemple
        const implantationDiff = implantationPctBFC - implantationPctNational;
        
        const implantationCard = createIndicatorCard(
            'Implantation',
            implantationBFC.toLocaleString(),
            implantationNational.toLocaleString(),
            implantationDiff.toFixed(1) + '%',
            implantationDiff >= 0
        );
        keyIndicatorsContainer.appendChild(implantationCard);
    }
}

// Fonction pour créer une carte d'indicateur
function createIndicatorCard(title, bfcValue, nationalValue, diffValue, isPositive) {
    const col = document.createElement('div');
    col.className = 'col-md-4 mb-3';
    
    col.innerHTML = `
        <div class="card h-100">
            <div class="card-body text-center">
                <h5>${title}</h5>
                <div class="d-flex justify-content-around align-items-center mt-3">
                    <div>
                        <div class="bfc-value fs-3">${bfcValue}</div>
                        <div>BFC</div>
                    </div>
                    <div class="fs-4">vs</div>
                    <div>
                        <div class="national-value fs-3">${nationalValue}</div>
                        <div>National</div>
                    </div>
                </div>
                <div class="mt-2 ${isPositive ? 'diff-positive' : 'diff-negative'}">
                    <i class="bi bi-arrow-${isPositive ? 'up' : 'down'}"></i> ${isPositive ? '+' : ''}${diffValue}
                </div>
            </div>
        </div>
    `;
    
    return col;
}

// Initialisation de la page de carte
function initCartePage() {
    console.log('Initialisation de la page de carte');
    
    // Charger toutes les données BFC
    loadAllBFCData();
}

// Exposer les fonctions et variables globalement
window.BFCDataLoader = {
    departementsBFC,
    departementNames,
    syndicatColors,
    departementData,
    bfcData,
    loadDepartementData,
    processDepartementData,
    loadAllBFCData,
    getColor,
    updateDepartementView,
    updateDepartementStats,
    updateEntreprisesTable,
    updateSyndicatsTable,
    updateKeyIndicators
};
