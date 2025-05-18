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
