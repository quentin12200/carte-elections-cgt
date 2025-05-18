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
    // Charger les données pour chaque département de BFC
    const promises = departementsBFC.map(deptCode => 
        fetch(`json_data/departement_${deptCode}.json`)
            .then(response => response.json())
            .then(data => {
                departementData[deptCode] = data;
                return data;
            })
    );
    
    // Une fois toutes les données chargées
    Promise.all(promises)
        .then(() => {
            // Calculer les données agrégées pour la région BFC
            calculateBFCData();
            
            // Mettre à jour la coloration de la carte
            updateMapColoring();
            
            // Mettre à jour les statistiques régionales
            updateRegionalStats();
            
            // Mettre à jour le top des départements
            updateTopDepartements();
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
// Carte interactive pour la région Bourgogne-Franche-Comté
// Partie 2 : Fonctions d'initialisation et de mise à jour de la carte

// Fonction pour initialiser la couche GeoJSON
function initializeGeoJSON(geoData) {
    // Créer la couche GeoJSON avec les départements
    geoJsonLayer = L.geoJSON(geoData, {
        style: function(feature) {
            return {
                fillColor: '#f8d7da',
                weight: 2,
                opacity: 1,
                color: 'white',
                dashArray: '3',
                fillOpacity: 0.7
            };
        },
        onEachFeature: function(feature, layer) {
            // Ajouter les interactions pour chaque département
            layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight,
                click: onDepartementClick
            });
            
            // Ajouter les informations au département
            const deptCode = feature.properties.code;
            const deptName = departementNames[deptCode] || feature.properties.nom;
            
            // Créer le contenu de la popup
            layer.bindPopup(createPopupContent(deptCode, deptName));
        }
    }).addTo(map);
    
    // Mettre à jour la coloration initiale
    updateMapColoring();
}

// Fonction pour mettre en évidence un département au survol
function highlightFeature(e) {
    const layer = e.target;
    
    layer.setStyle({
        weight: 3,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.8
    });
    
    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
    
    // Mettre à jour les informations du département survolé
    updateDepartementInfo(layer.feature.properties.code);
}

// Fonction pour réinitialiser le style d'un département
function resetHighlight(e) {
    geoJsonLayer.resetStyle(e.target);
}

// Fonction pour gérer le clic sur un département
function onDepartementClick(e) {
    const deptCode = e.target.feature.properties.code;
    const deptName = departementNames[deptCode] || e.target.feature.properties.nom;
    
    // Mettre à jour le titre de la section entreprises
    document.querySelector('#entreprises-container .card-header h5').textContent = 
        `Entreprises du département ${deptName} (${deptCode})`;
    
    // Générer la liste des entreprises
    generateEntreprises(deptCode);
    
    // Zoomer sur le département
    map.fitBounds(e.target.getBounds());
    
    // Ajouter la classe de mise en évidence
    e.target.setStyle({
        weight: 3,
        color: '#e63946',
        dashArray: '5,5',
        fillOpacity: 0.8
    });
}

// Fonction pour créer le contenu de la popup d'un département
function createPopupContent(deptCode, deptName) {
    // Créer l'élément div pour la popup
    const popupDiv = document.createElement('div');
    popupDiv.className = 'dept-popup';
    
    // Ajouter le titre
    const title = document.createElement('div');
    title.className = 'popup-header';
    title.textContent = `${deptName} (${deptCode})`;
    popupDiv.appendChild(title);
    
    // Fonction pour ajouter une statistique
    const addStat = (label, value, unit = '') => {
        const statDiv = document.createElement('div');
        statDiv.className = 'popup-stats';
        
        const labelSpan = document.createElement('span');
        labelSpan.className = 'popup-label';
        labelSpan.textContent = `${label}: `;
        
        const valueSpan = document.createElement('span');
        valueSpan.className = 'popup-value';
        valueSpan.textContent = `${value}${unit}`;
        
        statDiv.appendChild(labelSpan);
        statDiv.appendChild(valueSpan);
        popupDiv.appendChild(statDiv);
    };
    
    // Ajouter des statistiques (à remplir dynamiquement plus tard)
    addStat('Chargement des données...', '');
    
    return popupDiv;
}

// Fonction pour mettre à jour le contenu d'une popup
function updatePopupContent(deptCode) {
    const data = departementData[deptCode];
    if (!data || !data.syndicats || !data.syndicats[currentSyndicat]) return;
    
    const syndicatData = data.syndicats[currentSyndicat];
    const popup = document.querySelector(`.dept-popup[data-dept="${deptCode}"]`);
    
    if (popup) {
        // Mettre à jour les statistiques
        const statsElements = popup.querySelectorAll('.popup-stats');
        
        if (statsElements.length >= 3) {
            // Mettre à jour les valeurs existantes
            statsElements[0].querySelector('.popup-value').textContent = 
                `${syndicatData.voix || 0} (${syndicatData.pourcentage || 0}%)`;
            
            statsElements[1].querySelector('.popup-value').textContent = 
                `${syndicatData.sieges || 0}`;
            
            statsElements[2].querySelector('.popup-value').textContent = 
                `${syndicatData.implantation || 0} entreprises`;
        }
    }
}

// Fonction pour mettre à jour la coloration de la carte
function updateMapColoring() {
    if (!geoJsonLayer) return;
    
    geoJsonLayer.eachLayer(function(layer) {
        const deptCode = layer.feature.properties.code;
        const data = departementData[deptCode];
        
        if (data && data.syndicats && data.syndicats[currentSyndicat]) {
            let value = 0;
            
            // Déterminer la valeur à utiliser pour la coloration
            switch (currentMetric) {
                case 'voix':
                    value = data.syndicats[currentSyndicat].pourcentage || 0;
                    break;
                case 'sieges':
                    value = data.syndicats[currentSyndicat].pourcentageSieges || 0;
                    break;
                case 'implantation':
                    value = data.syndicats[currentSyndicat].pourcentageImplantation || 0;
                    break;
            }
            
            // Mettre à jour le style du département
            layer.setStyle({
                fillColor: getColor(value),
                weight: 2,
                opacity: 1,
                color: 'white',
                dashArray: '3',
                fillOpacity: 0.7
            });
            
            // Mettre à jour le contenu de la popup
            updatePopupContent(deptCode);
        }
    });
    
    // Mettre à jour la légende
    updateColorLegend();
}

// Fonction pour mettre à jour les informations d'un département
function updateDepartementInfo(deptCode) {
    const data = departementData[deptCode];
    if (!data) return;
    
    // Mettre à jour les informations dans le panneau latéral
    // (Cette fonction sera implémentée dans la partie 3)
}
// Carte interactive pour la région Bourgogne-Franche-Comté
// Partie 3 : Fonctions pour les statistiques et les entreprises

// Fonction pour mettre à jour les statistiques régionales
function updateRegionalStats() {
    const statsContainer = document.getElementById('national-stats');
    if (!statsContainer) return;
    
    // Vider le conteneur
    statsContainer.innerHTML = '';
    
    // Créer la section pour les statistiques de la région BFC
    const regionTitle = document.createElement('h6');
    regionTitle.className = 'region-title';
    regionTitle.textContent = 'Région Bourgogne-Franche-Comté';
    statsContainer.appendChild(regionTitle);
    
    // Ajouter les statistiques pour le syndicat actuel
    const syndicatData = {
        voix: bfcData.voix[currentSyndicat] || 0,
        sieges: bfcData.sieges[currentSyndicat] || 0,
        implantation: bfcData.implantation[currentSyndicat] || 0
    };
    
    // Calculer les pourcentages
    const totalVoix = Object.values(bfcData.voix).reduce((sum, val) => sum + val, 0);
    const totalSieges = Object.values(bfcData.sieges).reduce((sum, val) => sum + val, 0);
    const totalImplantation = Object.values(bfcData.implantation).reduce((sum, val) => sum + val, 0);
    
    const pourcentageVoix = totalVoix > 0 ? (syndicatData.voix / totalVoix * 100).toFixed(2) : 0;
    const pourcentageSieges = totalSieges > 0 ? (syndicatData.sieges / totalSieges * 100).toFixed(2) : 0;
    const pourcentageImplantation = totalImplantation > 0 ? (syndicatData.implantation / totalImplantation * 100).toFixed(2) : 0;
    
    // Créer les boîtes de statistiques
    createStatBox(statsContainer, 'Voix', syndicatData.voix, pourcentageVoix + '%');
    createStatBox(statsContainer, 'Sièges', syndicatData.sieges, pourcentageSieges + '%');
    createStatBox(statsContainer, 'Implantation', syndicatData.implantation, pourcentageImplantation + '%');
    
    // Ajouter une comparaison avec le national (si disponible)
    if (nationalData && nationalData.syndicats && nationalData.syndicats[currentSyndicat]) {
        const nationalSyndicat = nationalData.syndicats[currentSyndicat];
        
        const comparisonDiv = document.createElement('div');
        comparisonDiv.className = 'region-highlight mt-3';
        
        const comparisonTitle = document.createElement('h6');
        comparisonTitle.textContent = 'Comparaison avec le national';
        comparisonDiv.appendChild(comparisonTitle);
        
        // Comparer les pourcentages
        if (nationalSyndicat.pourcentage) {
            const diff = (pourcentageVoix - nationalSyndicat.pourcentage).toFixed(2);
            const diffClass = diff > 0 ? 'comparison-up' : (diff < 0 ? 'comparison-down' : 'comparison-neutral');
            const diffIcon = diff > 0 ? '↑' : (diff < 0 ? '↓' : '→');
            
            const comparisonText = document.createElement('p');
            comparisonText.innerHTML = `BFC: <strong>${pourcentageVoix}%</strong> vs National: <strong>${nationalSyndicat.pourcentage}%</strong> <span class="${diffClass}">${diffIcon} ${Math.abs(diff)}%</span>`;
            comparisonDiv.appendChild(comparisonText);
        }
        
        statsContainer.appendChild(comparisonDiv);
    }
}

// Fonction pour créer une boîte de statistiques
function createStatBox(container, label, value, percentage) {
    const box = document.createElement('div');
    box.className = 'stats-box';
    
    const valueDiv = document.createElement('div');
    valueDiv.className = 'stats-value';
    valueDiv.textContent = value.toLocaleString();
    
    const labelDiv = document.createElement('div');
    labelDiv.className = 'stats-label';
    labelDiv.textContent = `${label} (${percentage})`;
    
    box.appendChild(valueDiv);
    box.appendChild(labelDiv);
    container.appendChild(box);
}

// Fonction pour mettre à jour le top des départements
function updateTopDepartements() {
    const container = document.getElementById('top-departements');
    if (!container) return;
    
    // Vider le conteneur
    container.innerHTML = '';
    
    // Créer un tableau avec les données des départements
    const deptArray = departementsBFC.map(deptCode => {
        const data = departementData[deptCode];
        if (!data || !data.syndicats || !data.syndicats[currentSyndicat]) {
            return { deptCode, value: 0 };
        }
        
        let value = 0;
        switch (currentMetric) {
            case 'voix':
                value = data.syndicats[currentSyndicat].pourcentage || 0;
                break;
            case 'sieges':
                value = data.syndicats[currentSyndicat].pourcentageSieges || 0;
                break;
            case 'implantation':
                value = data.syndicats[currentSyndicat].pourcentageImplantation || 0;
                break;
        }
        
        return { deptCode, value };
    });
    
    // Trier les départements par valeur décroissante
    deptArray.sort((a, b) => b.value - a.value);
    
    // Créer la liste des top départements
    const list = document.createElement('ul');
    list.className = 'list-group';
    
    deptArray.forEach((dept, index) => {
        const item = document.createElement('li');
        item.className = 'list-group-item d-flex justify-content-between align-items-center';
        
        const deptName = departementNames[dept.deptCode] || dept.deptCode;
        item.innerHTML = `
            <span>${index + 1}. ${deptName} (${dept.deptCode})</span>
            <span class="badge bg-danger rounded-pill">${dept.value.toFixed(2)}%</span>
        `;
        
        // Ajouter un événement de clic pour zoomer sur le département
        item.addEventListener('click', () => {
            // Trouver la couche correspondant au département
            geoJsonLayer.eachLayer(layer => {
                if (layer.feature.properties.code === dept.deptCode) {
                    // Zoomer sur le département
                    map.fitBounds(layer.getBounds());
                    
                    // Simuler un clic sur le département
                    onDepartementClick({ target: layer });
                }
            });
        });
        
        list.appendChild(item);
    });
    
    container.appendChild(list);
}

// Fonction pour mettre à jour la légende des couleurs
function updateColorLegend() {
    const container = document.getElementById('color-legend');
    if (!container) return;
    
    // Vider le conteneur
    container.innerHTML = '';
    
    // Créer le titre de la légende
    const title = document.createElement('div');
    title.className = 'mb-2';
    
    let metricLabel = '';
    switch (currentMetric) {
        case 'voix':
            metricLabel = 'Pourcentage de voix';
            break;
        case 'sieges':
            metricLabel = 'Pourcentage de sièges';
            break;
        case 'implantation':
            metricLabel = 'Pourcentage d\'implantation';
            break;
    }
    
    title.textContent = `${metricLabel} ${currentSyndicat}`;
    container.appendChild(title);
    
    // Définir les paliers pour la légende
    const grades = [0, 10, 15, 20, 30, 40, 50];
    
    // Créer les éléments de la légende
    grades.forEach((grade, index) => {
        const item = document.createElement('div');
        item.className = 'legend-item';
        
        const color = document.createElement('div');
        color.className = 'legend-color';
        color.style.backgroundColor = getColor(grade);
        
        const label = document.createElement('div');
        label.className = 'legend-label';
        
        if (index === grades.length - 1) {
            label.textContent = `${grade}% +`;
        } else {
            label.textContent = `${grade}% – ${grades[index + 1]}%`;
        }
        
        item.appendChild(color);
        item.appendChild(label);
        container.appendChild(item);
    });
}

// Fonction pour générer la liste des entreprises d'un département
function generateEntreprises(deptCode) {
    const container = document.getElementById('entreprises-table-container');
    if (!container) return;
    
    // Vider le conteneur
    container.innerHTML = '';
    
    const data = departementData[deptCode];
    if (!data || !data.entreprises || data.entreprises.length === 0) {
        container.innerHTML = '<p class="text-center">Aucune entreprise disponible pour ce département</p>';
        return;
    }
    
    // Créer le tableau
    const table = document.createElement('table');
    table.className = 'table table-striped table-hover';
    table.id = 'entreprises-table';
    
    // Créer l'en-tête du tableau
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>SIRET</th>
            <th>Entreprise</th>
            <th>Ville</th>
            <th>CGT (%)</th>
            <th>Sièges CGT</th>
        </tr>
    `;
    table.appendChild(thead);
    
    // Créer le corps du tableau
    const tbody = document.createElement('tbody');
    
    data.entreprises.forEach(entreprise => {
        const tr = document.createElement('tr');
        tr.className = 'table-row-animate';
        
        // Calculer le pourcentage CGT
        const cgtVoix = entreprise.syndicats?.CGT?.voix || 0;
        const totalVoix = Object.values(entreprise.syndicats || {}).reduce((sum, syndicat) => sum + (syndicat.voix || 0), 0);
        const cgtPourcentage = totalVoix > 0 ? (cgtVoix / totalVoix * 100).toFixed(2) : '0.00';
        
        tr.innerHTML = `
            <td>${entreprise.siret || 'N/A'}</td>
            <td>${entreprise.nom || 'N/A'}</td>
            <td>${entreprise.ville || 'N/A'}</td>
            <td>${cgtPourcentage}%</td>
            <td>${entreprise.syndicats?.CGT?.sieges || 0}</td>
        `;
        
        tbody.appendChild(tr);
    });
    
    table.appendChild(tbody);
    container.appendChild(table);
    
    // Initialiser DataTables
    $(document).ready(function() {
        $('#entreprises-table').DataTable({
            language: {
                url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/fr-FR.json'
            },
            dom: 'Bfrtip',
            buttons: [
                'copy', 'csv', 'excel', 'pdf', 'print'
            ],
            pageLength: 10
        });
    });
}
// Carte interactive pour la région Bourgogne-Franche-Comté
// Partie 4 : Gestionnaires d'événements et initialisation

// Fonction pour activer/désactiver le mode sombre
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    
    // Mettre à jour l'icône du bouton
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
        const icon = darkModeToggle.querySelector('i');
        if (document.body.classList.contains('dark-mode')) {
            icon.className = 'bi bi-sun-fill';
        } else {
            icon.className = 'bi bi-moon-fill';
        }
    }
    
    // Sauvegarder la préférence dans le localStorage
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

// Fonction pour activer/désactiver le mode présentation
function togglePresentationMode() {
    document.body.classList.toggle('fullscreen-mode');
    
    const exitBtn = document.getElementById('exit-fullscreen-btn');
    const presentationBtn = document.getElementById('presentation-btn');
    
    if (document.body.classList.contains('fullscreen-mode')) {
        // Activer le mode présentation
        exitBtn.style.display = 'block';
        presentationBtn.style.display = 'none';
        
        // Demander le mode plein écran si disponible
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) {
            document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) {
            document.documentElement.msRequestFullscreen();
        }
    } else {
        // Désactiver le mode présentation
        exitBtn.style.display = 'none';
        presentationBtn.style.display = 'block';
        
        // Quitter le mode plein écran si actif
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
    
    // Redimensionner la carte pour qu'elle s'adapte correctement
    if (map) {
        setTimeout(() => {
            map.invalidateSize();
        }, 100);
    }
}

// Fonction pour charger les données nationales (pour comparaison)
function loadNationalData() {
    fetch('json_data/departement_CSE.json')
        .then(response => response.json())
        .then(data => {
            nationalData = data;
            updateRegionalStats();
        })
        .catch(error => {
            console.error('Erreur lors du chargement des données nationales:', error);
        });
}

// Initialisation au chargement du document
document.addEventListener('DOMContentLoaded', function() {
    // Vérifier l'authentification
    if (!localStorage.getItem('authenticated')) {
        window.location.href = 'login.html';
        return;
    }
    
    // Initialiser la carte
    initMap();
    
    // Charger les données
    loadData();
    
    // Charger les données nationales
    loadNationalData();
    
    // Gestionnaire d'événements pour les sélecteurs
    // Sélecteur de syndicat
    document.querySelectorAll('#syndicat-selector .btn-selector').forEach(button => {
        button.addEventListener('click', function() {
            // Désélectionner tous les boutons
            document.querySelectorAll('#syndicat-selector .btn-selector').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Sélectionner le bouton cliqué
            this.classList.add('active');
            
            // Mettre à jour le syndicat actuel
            currentSyndicat = this.dataset.syndicat;
            
            // Mettre à jour la carte et les statistiques
            updateMapColoring();
            updateRegionalStats();
            updateTopDepartements();
        });
    });
    
    // Sélecteur de métrique
    document.querySelectorAll('#metric-selector .btn-selector').forEach(button => {
        button.addEventListener('click', function() {
            // Désélectionner tous les boutons
            document.querySelectorAll('#metric-selector .btn-selector').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Sélectionner le bouton cliqué
            this.classList.add('active');
            
            // Mettre à jour la métrique actuelle
            currentMetric = this.dataset.metric;
            
            // Mettre à jour la carte et les statistiques
            updateMapColoring();
            updateTopDepartements();
        });
    });
    
    // Gestionnaire d'événements pour le bouton de mode sombre
    document.getElementById('dark-mode-toggle').addEventListener('click', toggleDarkMode);
    
    // Gestionnaire d'événements pour le bouton de mode présentation
    document.getElementById('presentation-btn').addEventListener('click', togglePresentationMode);
    document.getElementById('exit-fullscreen-btn').addEventListener('click', togglePresentationMode);
    
    // Appliquer le mode sombre si sauvegardé
    if (localStorage.getItem('darkMode') === 'true') {
        toggleDarkMode();
    }
    
    // Gérer la sortie du mode plein écran avec la touche Echap
    document.addEventListener('fullscreenchange', function() {
        if (!document.fullscreenElement && document.body.classList.contains('fullscreen-mode')) {
            // L'utilisateur a quitté le mode plein écran avec Echap
            document.body.classList.remove('fullscreen-mode');
            document.getElementById('exit-fullscreen-btn').style.display = 'none';
            document.getElementById('presentation-btn').style.display = 'block';
            
            // Redimensionner la carte
            if (map) {
                setTimeout(() => {
                    map.invalidateSize();
                }, 100);
            }
        }
    });
});
