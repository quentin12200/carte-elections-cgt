// Script pour la comparaison entre Bourgogne-Franche-Comté et National

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
    'SOLIDAIRES': '#f94144'
};

// Variables pour stocker les données
let departementData = {};
let nationalData = {};
let bfcData = {
    voix: {},
    sieges: {},
    implantation: {}
};

// Graphiques
let voixChart, siegesChart, departementsChart;

// Fonction pour charger les données
function loadData() {
    // Utiliser le processeur de données pour charger toutes les données BFC
    BFCDataProcessor.loadAllBFCData()
        .then(processedBFCData => {
            // Stocker les données des départements
            departementData = processedBFCData.departements;
            
            // Stocker les données agrégées pour la région BFC
            bfcData.voix = {};
            bfcData.sieges = {};
            bfcData.implantation = {};
            
            Object.keys(processedBFCData.syndicats).forEach(syndicat => {
                bfcData.voix[syndicat] = processedBFCData.syndicats[syndicat].voix;
                bfcData.voix[syndicat + '_pourcentage'] = processedBFCData.syndicats[syndicat].pourcentage;
                
                bfcData.sieges[syndicat] = processedBFCData.syndicats[syndicat].sieges;
                bfcData.sieges[syndicat + '_pourcentage'] = processedBFCData.syndicats[syndicat].pourcentageSieges;
                
                bfcData.implantation[syndicat] = processedBFCData.syndicats[syndicat].implantation;
                bfcData.implantation[syndicat + '_pourcentage'] = processedBFCData.syndicats[syndicat].pourcentageImplantation;
            });
            
            // Charger les données nationales
            return fetch('json_data/departement_CSE.json')
                .then(response => response.json())
                .then(data => {
                    // Traiter les données nationales avec le même processeur
                    nationalData = BFCDataProcessor.processDepartementData(data, 'national');
                    
                    // Mettre à jour les indicateurs clés
                    updateKeyIndicators();
                    
                    // Initialiser les graphiques
                    initCharts();
                    
                    // Mettre à jour le tableau détaillé
                    updateDetailedTable();
                });
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
    
    // Calculer les pourcentages
    const totalVoix = Object.values(bfcData.voix).reduce((sum, val) => sum + val, 0);
    const totalSieges = Object.values(bfcData.sieges).reduce((sum, val) => sum + val, 0);
    const totalImplantation = Object.values(bfcData.implantation).reduce((sum, val) => sum + val, 0);
    
    syndicats.forEach(syndicat => {
        bfcData.voix[syndicat + '_pourcentage'] = totalVoix > 0 ? (bfcData.voix[syndicat] / totalVoix * 100) : 0;
        bfcData.sieges[syndicat + '_pourcentage'] = totalSieges > 0 ? (bfcData.sieges[syndicat] / totalSieges * 100) : 0;
        bfcData.implantation[syndicat + '_pourcentage'] = totalImplantation > 0 ? (bfcData.implantation[syndicat] / totalImplantation * 100) : 0;
    });
}

// Fonction pour mettre à jour les indicateurs clés
function updateKeyIndicators() {
    const keyIndicatorsContainer = document.getElementById('key-indicators');
    if (!keyIndicatorsContainer) return;
    
    // Vider le conteneur
    keyIndicatorsContainer.innerHTML = '';
    
    // Créer les indicateurs clés pour la CGT
    if (bfcData.voix['CGT'] && nationalData.syndicats && nationalData.syndicats.CGT) {
        // Pourcentage de voix
        const voixBFC = bfcData.voix['CGT_pourcentage'];
        const voixNational = nationalData.syndicats.CGT.pourcentage || 0;
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
        const siegesBFC = bfcData.sieges['CGT'];
        const siegesNational = nationalData.syndicats.CGT.sieges || 0;
        const siegesPctBFC = (siegesBFC / Object.values(bfcData.sieges).reduce((sum, val) => sum + val, 0) * 100) || 0;
        const siegesPctNational = (siegesNational / Object.values(nationalData.syndicats).reduce((sum, s) => sum + (s.sieges || 0), 0) * 100) || 0;
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
        const implantationBFC = bfcData.implantation['CGT'];
        const implantationNational = nationalData.syndicats.CGT.implantation || 0;
        const implantationPctBFC = (implantationBFC / Object.values(bfcData.implantation).reduce((sum, val) => sum + val, 0) * 100) || 0;
        const implantationPctNational = (implantationNational / Object.values(nationalData.syndicats).reduce((sum, s) => sum + (s.implantation || 0), 0) * 100) || 0;
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

// Fonction pour initialiser les graphiques
function initCharts() {
    // Graphique des voix
    initVoixChart();
    
    // Graphique des sièges
    initSiegesChart();
    
    // Graphique par département
    initDepartementsChart();
}

// Fonction pour initialiser le graphique des voix
function initVoixChart() {
    const ctx = document.getElementById('voix-chart');
    if (!ctx) return;
    
    // Préparer les données
    const syndicats = ['CGT', 'CFDT', 'FO', 'CFE-CGC', 'CFTC', 'UNSA', 'SOLIDAIRES'];
    const bfcValues = syndicats.map(syndicat => bfcData.voix[syndicat + '_pourcentage'] || 0);
    const nationalValues = syndicats.map(syndicat => nationalData.syndicats && nationalData.syndicats[syndicat] ? 
        nationalData.syndicats[syndicat].pourcentage || 0 : 0);
    
    // Créer le graphique
    voixChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: syndicats,
            datasets: [
                {
                    label: 'BFC',
                    data: bfcValues,
                    backgroundColor: '#e63946',
                    borderColor: '#e63946',
                    borderWidth: 1
                },
                {
                    label: 'National',
                    data: nationalValues,
                    backgroundColor: '#1d3557',
                    borderColor: '#1d3557',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Pourcentage de voix'
                    }
                }
            }
        }
    });
}

// Fonction pour initialiser le graphique des sièges
function initSiegesChart() {
    const ctx = document.getElementById('sieges-chart');
    if (!ctx) return;
    
    // Préparer les données
    const syndicats = ['CGT', 'CFDT', 'FO', 'CFE-CGC', 'CFTC', 'UNSA', 'SOLIDAIRES'];
    const bfcValues = syndicats.map(syndicat => bfcData.sieges[syndicat + '_pourcentage'] || 0);
    
    // Calculer les pourcentages nationaux
    const totalSiegesNational = Object.values(nationalData.syndicats || {}).reduce((sum, s) => sum + (s.sieges || 0), 0);
    const nationalValues = syndicats.map(syndicat => 
        nationalData.syndicats && nationalData.syndicats[syndicat] && totalSiegesNational > 0 ? 
        (nationalData.syndicats[syndicat].sieges || 0) / totalSiegesNational * 100 : 0
    );
    
    // Créer le graphique
    siegesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: syndicats,
            datasets: [
                {
                    label: 'BFC',
                    data: bfcValues,
                    backgroundColor: '#e63946',
                    borderColor: '#e63946',
                    borderWidth: 1
                },
                {
                    label: 'National',
                    data: nationalValues,
                    backgroundColor: '#1d3557',
                    borderColor: '#1d3557',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Pourcentage de sièges'
                    }
                }
            }
        }
    });
}

// Fonction pour initialiser le graphique par département
function initDepartementsChart() {
    const ctx = document.getElementById('departements-chart');
    if (!ctx) return;
    
    // Préparer les données
    const deptLabels = departementsBFC.map(code => departementNames[code] || code);
    const deptValues = departementsBFC.map(code => {
        const data = departementData[code];
        return data && data.syndicats && data.syndicats.CGT ? 
            data.syndicats.CGT.pourcentage || 0 : 0;
    });
    
    // Ligne pour la moyenne nationale
    const nationalAvg = nationalData.syndicats && nationalData.syndicats.CGT ? 
        nationalData.syndicats.CGT.pourcentage || 0 : 0;
    
    // Ligne pour la moyenne BFC
    const bfcAvg = bfcData.voix['CGT_pourcentage'] || 0;
    
    // Créer le graphique
    departementsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: deptLabels,
            datasets: [
                {
                    label: 'Pourcentage CGT',
                    data: deptValues,
                    backgroundColor: '#e63946',
                    borderColor: '#e63946',
                    borderWidth: 1
                },
                {
                    label: 'Moyenne nationale',
                    data: Array(deptLabels.length).fill(nationalAvg),
                    type: 'line',
                    borderColor: '#1d3557',
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: false
                },
                {
                    label: 'Moyenne BFC',
                    data: Array(deptLabels.length).fill(bfcAvg),
                    type: 'line',
                    borderColor: '#e63946',
                    borderDash: [5, 5],
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Pourcentage de voix CGT'
                    }
                }
            }
        }
    });
}

// Fonction pour mettre à jour le tableau détaillé
function updateDetailedTable() {
    const tableBody = document.querySelector('#detailed-table tbody');
    if (!tableBody) return;
    
    // Vider le tableau
    tableBody.innerHTML = '';
    
    // Ajouter les données pour chaque syndicat
    const syndicats = ['CGT', 'CFDT', 'FO', 'CFE-CGC', 'CFTC', 'UNSA', 'SOLIDAIRES'];
    
    syndicats.forEach(syndicat => {
        const row = document.createElement('tr');
        
        // Données BFC
        const voixBFC = bfcData.voix[syndicat] || 0;
        const pctBFC = bfcData.voix[syndicat + '_pourcentage'] || 0;
        const siegesBFC = bfcData.sieges[syndicat] || 0;
        const implantationBFC = bfcData.implantation[syndicat] || 0;
        
        // Données nationales
        const voixNational = nationalData.syndicats && nationalData.syndicats[syndicat] ? 
            nationalData.syndicats[syndicat].voix || 0 : 0;
        const pctNational = nationalData.syndicats && nationalData.syndicats[syndicat] ? 
            nationalData.syndicats[syndicat].pourcentage || 0 : 0;
        const siegesNational = nationalData.syndicats && nationalData.syndicats[syndicat] ? 
            nationalData.syndicats[syndicat].sieges || 0 : 0;
        const implantationNational = nationalData.syndicats && nationalData.syndicats[syndicat] ? 
            nationalData.syndicats[syndicat].implantation || 0 : 0;
        
        // Écart
        const ecart = pctBFC - pctNational;
        const ecartClass = ecart > 0 ? 'diff-positive' : (ecart < 0 ? 'diff-negative' : '');
        const ecartPrefix = ecart > 0 ? '+' : '';
        
        row.innerHTML = `
            <td><span class="syndicat-icon" style="background-color: ${syndicatColors[syndicat]};"></span> ${syndicat}</td>
            <td>${voixBFC.toLocaleString()}</td>
            <td class="${syndicat === 'CGT' ? 'bfc-value' : ''}">${pctBFC.toFixed(2)}%</td>
            <td>${voixNational.toLocaleString()}</td>
            <td class="${syndicat === 'CGT' ? 'national-value' : ''}">${pctNational.toFixed(2)}%</td>
            <td class="${ecartClass}">${ecartPrefix}${ecart.toFixed(2)}</td>
            <td>${siegesBFC.toLocaleString()}</td>
            <td>${siegesNational.toLocaleString()}</td>
            <td>${implantationBFC.toLocaleString()}</td>
            <td>${implantationNational.toLocaleString()}</td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Vérifier l'authentification au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    // Vérifier l'authentification
    if (!localStorage.getItem('authenticated')) {
        window.location.href = 'login.html';
        return;
    }
    
    // Charger les données
    loadData();
});
