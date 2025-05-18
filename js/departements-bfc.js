// Script pour la page de détails par département de la Bourgogne-Franche-Comté

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

// Variables globales
let currentDept = '21'; // Département par défaut
let departementData = {};
let deptChart, secteursChart;
let entreprisesTable, syndicatsTable;

// Fonction pour charger les données d'un département
function loadDepartementData(deptCode) {
    // Utiliser le processeur de données pour charger et traiter les données
    BFCDataProcessor.loadAndProcessDepartementData(deptCode)
        .then(processedData => {
            if (processedData) {
                departementData[deptCode] = processedData;
                updateDepartementView(deptCode);
            }
        })
        .catch(error => {
            console.error(`Erreur lors du chargement des données pour le département ${deptCode}:`, error);
        });
}

// Fonction pour mettre à jour la vue du département
function updateDepartementView(deptCode) {
    const data = departementData[deptCode];
    if (!data) return;
    
    // Mettre à jour le titre
    document.getElementById('dept-title').textContent = `${departementNames[deptCode]} (${deptCode})`;
    
    // Mettre à jour les statistiques
    updateDepartementStats(deptCode);
    
    // Mettre à jour le graphique
    updateDepartementChart(deptCode);
    
    // Mettre à jour les tableaux
    updateEntreprisesTable(deptCode);
    updateSyndicatsTable(deptCode);
    
    // Mettre à jour le graphique des secteurs
    updateSecteursChart(deptCode);
}

// Fonction pour mettre à jour les statistiques du département
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

// Fonction pour mettre à jour le graphique du département
function updateDepartementChart(deptCode) {
    const ctx = document.getElementById('dept-chart');
    if (!ctx) return;
    
    const data = departementData[deptCode];
    if (!data || !data.syndicats) return;
    
    // Préparer les données
    const syndicats = Object.keys(data.syndicats);
    const values = syndicats.map(syndicat => data.syndicats[syndicat].pourcentage || 0);
    const colors = syndicats.map(syndicat => syndicatColors[syndicat] || '#999');
    
    // Détruire le graphique existant s'il existe
    if (deptChart) {
        deptChart.destroy();
    }
    
    // Créer le graphique
    deptChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: syndicats,
            datasets: [
                {
                    label: 'Pourcentage de voix',
                    data: values,
                    backgroundColor: colors,
                    borderColor: colors,
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
            },
            plugins: {
                title: {
                    display: true,
                    text: `Répartition des voix par syndicat - ${departementNames[deptCode]} (${deptCode})`
                }
            }
        }
    });
}

// Fonction pour mettre à jour le tableau des entreprises
function updateEntreprisesTable(deptCode) {
    const tableBody = document.querySelector('#entreprises-table tbody');
    if (!tableBody) return;
    
    const data = departementData[deptCode];
    if (!data || !data.entreprises) return;
    
    // Vider le tableau
    tableBody.innerHTML = '';
    
    // Ajouter les données pour chaque entreprise
    data.entreprises.forEach(entreprise => {
        const row = document.createElement('tr');
        
        // Calculer le pourcentage CGT
        const cgtVoix = entreprise.syndicats?.CGT?.voix || 0;
        const totalVoix = Object.values(entreprise.syndicats || {}).reduce((sum, syndicat) => sum + (syndicat.voix || 0), 0);
        const cgtPourcentage = totalVoix > 0 ? (cgtVoix / totalVoix * 100).toFixed(2) : '0.00';
        
        row.innerHTML = `
            <td>${entreprise.siret || 'N/A'}</td>
            <td>${entreprise.nom || 'N/A'}</td>
            <td>${entreprise.ville || 'N/A'}</td>
            <td>${entreprise.salaries ? entreprise.salaries.toLocaleString() : 'N/A'}</td>
            <td>${cgtPourcentage}%</td>
            <td>${entreprise.syndicats?.CGT?.sieges || 0}</td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Initialiser ou rafraîchir DataTables
    if (entreprisesTable) {
        entreprisesTable.destroy();
    }
    
    entreprisesTable = new DataTable('#entreprises-table', {
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/fr-FR.json'
        },
        dom: 'Bfrtip',
        buttons: [
            'copy', 'csv', 'excel', 'pdf', 'print'
        ],
        pageLength: 10
    });
}

// Fonction pour mettre à jour le tableau des syndicats
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
    
    // Initialiser ou rafraîchir DataTables
    if (syndicatsTable) {
        syndicatsTable.destroy();
    }
    
    syndicatsTable = new DataTable('#syndicats-table', {
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/fr-FR.json'
        },
        dom: 'Bfrtip',
        buttons: [
            'copy', 'csv', 'excel', 'pdf', 'print'
        ],
        pageLength: 10
    });
}

// Fonction pour mettre à jour le graphique des secteurs d'activité
function updateSecteursChart(deptCode) {
    const ctx = document.getElementById('secteurs-chart');
    if (!ctx) return;
    
    const data = departementData[deptCode];
    if (!data || !data.entreprises || data.entreprises.length === 0) return;
    
    // Regrouper les entreprises par secteur d'activité
    const secteurs = {};
    
    data.entreprises.forEach(entreprise => {
        const secteur = entreprise.secteur || 'Non spécifié';
        if (!secteurs[secteur]) {
            secteurs[secteur] = {
                count: 0,
                salaries: 0,
                cgtVoix: 0,
                totalVoix: 0
            };
        }
        
        secteurs[secteur].count++;
        secteurs[secteur].salaries += entreprise.salaries || 0;
        
        // Calculer les voix CGT et totales
        const cgtVoix = entreprise.syndicats?.CGT?.voix || 0;
        const totalVoix = Object.values(entreprise.syndicats || {}).reduce((sum, syndicat) => sum + (syndicat.voix || 0), 0);
        
        secteurs[secteur].cgtVoix += cgtVoix;
        secteurs[secteur].totalVoix += totalVoix;
    });
    
    // Calculer les pourcentages CGT par secteur
    Object.values(secteurs).forEach(secteur => {
        secteur.cgtPourcentage = secteur.totalVoix > 0 ? (secteur.cgtVoix / secteur.totalVoix * 100) : 0;
    });
    
    // Préparer les données pour le graphique
    const secteurLabels = Object.keys(secteurs);
    const secteurValues = secteurLabels.map(label => secteurs[label].cgtPourcentage);
    const secteurCounts = secteurLabels.map(label => secteurs[label].count);
    
    // Détruire le graphique existant s'il existe
    if (secteursChart) {
        secteursChart.destroy();
    }
    
    // Créer le graphique
    secteursChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: secteurLabels,
            datasets: [
                {
                    label: 'Pourcentage CGT',
                    data: secteurValues,
                    backgroundColor: '#e63946',
                    borderColor: '#e63946',
                    borderWidth: 1,
                    yAxisID: 'y'
                },
                {
                    label: 'Nombre d\'entreprises',
                    data: secteurCounts,
                    type: 'line',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgb(75, 192, 192)',
                    borderWidth: 2,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Pourcentage CGT'
                    }
                },
                y1: {
                    beginAtZero: true,
                    position: 'right',
                    grid: {
                        drawOnChartArea: false
                    },
                    title: {
                        display: true,
                        text: 'Nombre d\'entreprises'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: `Performance CGT par secteur d'activité - ${departementNames[deptCode]} (${deptCode})`
                }
            }
        }
    });
}

// Fonction pour changer de département
function changeDepartement(deptCode) {
    // Mettre à jour le département actuel
    currentDept = deptCode;
    
    // Mettre à jour les boutons
    document.querySelectorAll('.dept-selector .btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`.dept-selector .btn[data-dept="${deptCode}"]`).classList.add('active');
    
    // Charger les données si elles ne sont pas déjà chargées
    if (!departementData[deptCode]) {
        loadDepartementData(deptCode);
    } else {
        updateDepartementView(deptCode);
    }
}

// Initialisation au chargement du document
document.addEventListener('DOMContentLoaded', function() {
    // Vérifier l'authentification
    if (!localStorage.getItem('authenticated')) {
        window.location.href = 'login.html';
        return;
    }
    
    // Charger les données du département par défaut
    loadDepartementData(currentDept);
    
    // Ajouter les gestionnaires d'événements pour les boutons de département
    document.querySelectorAll('.dept-selector .btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const deptCode = this.dataset.dept;
            changeDepartement(deptCode);
        });
    });
});
