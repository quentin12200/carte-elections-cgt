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
