// Fichier de gestion des données pour la page comparaison_cycles.html
let dataCycle3 = [], dataCycle4 = [], entreprisesBySiret = {}, filteredData = [], dataTable;

// Fonction pour charger les données des deux cycles
async function loadData() {
    try {
        // Afficher le chargement
        document.getElementById('loading').style.display = 'flex';
        document.getElementById('table-container').style.display = 'none';
        
        // Charger les données du cycle 3
        const responseCycle3 = await fetch('pv-cycle3_2025-04-26.csv');
        const csvTextCycle3 = await responseCycle3.text();
        
        // Charger les données du cycle 4
        const responseCycle4 = await fetch('pv_data.csv');
        const csvTextCycle4 = await responseCycle4.text();
        
        // Traiter les données CSV
        dataCycle3 = processCSVDataCycle3(csvTextCycle3);
        dataCycle4 = processCSVDataCycle4(csvTextCycle4);
        
        // Fusionner les données par SIRET
        mergeDataBySiret();
        
        // Remplir le sélecteur de départements
        populateDepartements();
        
        // Initialiser les données filtrées
        filteredData = Object.values(entreprisesBySiret);
        
        // Initialiser le tableau DataTables
        initDataTable();
        
        // Mettre à jour les statistiques
        updateStats();
        
        // Cacher le chargement et afficher le tableau
        document.getElementById('loading').style.display = 'none';
        document.getElementById('table-container').style.display = 'block';
        
    } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        alert('Erreur lors du chargement des données. Veuillez réessayer.');
        document.getElementById('loading').style.display = 'none';
    }
}

// Fonction pour traiter les données CSV du cycle 3
function processCSVDataCycle3(csvText) {
    // Remplacer les retours à la ligne Windows (CRLF) par des retours à la ligne Unix (LF)
    csvText = csvText.replace(/\r\n/g, '\n');
    
    const lines = csvText.split('\n');
    const headers = lines[0].split(';').map(h => h.trim());
    
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = line.split(';').map(v => v.trim());
        if (values.length < headers.length) continue; // Ignorer les lignes incomplètes
        
        const rowData = {};
        
        for (let j = 0; j < headers.length; j++) {
            rowData[headers[j]] = values[j] || '';
        }
        
        // Vérifier que le SIRET existe
        if (!rowData['siret']) continue;
        
        // Ajouter des champs calculés
        rowData.deptCode = rowData['departement'] || '';
        
        // Ajouter un zéro devant les départements à un chiffre pour le tri
        if (rowData.deptCode && rowData.deptCode.length === 1) {
            rowData.deptCodeSort = '0' + rowData.deptCode;
        } else {
            rowData.deptCodeSort = rowData.deptCode;
        }
        
        // Récupérer le nom du département à partir du mapping
        const deptMapping = getDepartementMapping();
        rowData.deptNom = deptMapping[rowData.deptCode] || '';
        
        // Convertir les valeurs numériques
        rowData.inscrits = safeNumber(rowData['num_inscrits']);
        rowData.votants = safeNumber(rowData['num_votants']);
        rowData.sve = safeNumber(rowData['num_sve']);
        rowData.cgt = safeNumber(rowData['score_CGT']);
        rowData.cfdt = safeNumber(rowData['score_CFDT']);
        rowData.fo = safeNumber(rowData['score_FO']);
        rowData.cftc = safeNumber(rowData['score_CFTC']);
        rowData.cgc = safeNumber(rowData['score_CGC']);
        rowData.unsa = safeNumber(rowData['score_UNSA']);
        rowData.solidaires = safeNumber(rowData['score_SOLIDAIRE']);
        rowData.autres = safeNumber(rowData['score_AUTRE']);
        
        // Calculer les pourcentages
        rowData.pct_cgt = rowData.sve > 0 ? (rowData.cgt / rowData.sve * 100) : 0;
        rowData.pct_cfdt = rowData.sve > 0 ? (rowData.cfdt / rowData.sve * 100) : 0;
        rowData.pct_fo = rowData.sve > 0 ? (rowData.fo / rowData.sve * 100) : 0;
        rowData.pct_cftc = rowData.sve > 0 ? (rowData.cftc / rowData.sve * 100) : 0;
        rowData.pct_cgc = rowData.sve > 0 ? (rowData.cgc / rowData.sve * 100) : 0;
        rowData.pct_unsa = rowData.sve > 0 ? (rowData.unsa / rowData.sve * 100) : 0;
        rowData.pct_solidaires = rowData.sve > 0 ? (rowData.solidaires / rowData.sve * 100) : 0;
        rowData.pct_autres = rowData.sve > 0 ? (rowData.autres / rowData.sve * 100) : 0;
        
        // Déterminer le syndicat dominant
        rowData.syndicat_dominant = determinerSyndicatDominant(
            rowData.pct_cgt, rowData.pct_cfdt, rowData.pct_fo, 
            rowData.pct_cftc, rowData.pct_cgc, rowData.pct_unsa, 
            rowData.pct_solidaires, rowData.pct_autres
        );
        
        data.push(rowData);
    }
    
    return data;
}

// Fonction pour traiter les données CSV du cycle 4
function processCSVDataCycle4(csvText) {
    // Remplacer les retours à la ligne Windows (CRLF) par des retours à la ligne Unix (LF)
    csvText = csvText.replace(/\r\n/g, '\n');
    
    const lines = csvText.split('\n');
    const headers = lines[0].split(';').map(h => h.trim());
    
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = line.split(';').map(v => v.trim());
        if (values.length < headers.length) continue; // Ignorer les lignes incomplètes
        
        const rowData = {};
        
        for (let j = 0; j < headers.length; j++) {
            rowData[headers[j]] = values[j] || '';
        }
        
        // Vérifier que le SIRET existe
        if (!rowData['SIRET']) continue;
        
        // Ajouter des champs calculés
        rowData.deptCode = rowData['Département'] || '';
        
        // Ajouter un zéro devant les départements à un chiffre pour le tri
        if (rowData.deptCode && rowData.deptCode.length === 1) {
            rowData.deptCodeSort = '0' + rowData.deptCode;
        } else {
            rowData.deptCodeSort = rowData.deptCode;
        }
        
        // Récupérer le nom du département à partir du mapping
        const deptMapping = getDepartementMapping();
        rowData.deptNom = deptMapping[rowData.deptCode] || '';
        
        // Convertir les valeurs numériques
        rowData.inscrits = safeNumber(rowData['Inscrits']);
        rowData.votants = safeNumber(rowData['Votants']);
        rowData.sve = safeNumber(rowData['sve_total']);
        rowData.cgt = safeNumber(rowData['CGT']);
        rowData.cfdt = safeNumber(rowData['CFDT']);
        rowData.fo = safeNumber(rowData['CGT-FO']);
        rowData.cftc = safeNumber(rowData['CFTC']);
        rowData.cgc = safeNumber(rowData['CFE-CGC']);
        rowData.unsa = safeNumber(rowData['UNSA']);
        rowData.solidaires = safeNumber(rowData['SOLIDAIRES']);
        rowData.autres = safeNumber(rowData['AUTRES']);
        
        // Calculer les pourcentages
        rowData.pct_cgt = rowData.sve > 0 ? (rowData.cgt / rowData.sve * 100) : 0;
        rowData.pct_cfdt = rowData.sve > 0 ? (rowData.cfdt / rowData.sve * 100) : 0;
        rowData.pct_fo = rowData.sve > 0 ? (rowData.fo / rowData.sve * 100) : 0;
        rowData.pct_cftc = rowData.sve > 0 ? (rowData.cftc / rowData.sve * 100) : 0;
        rowData.pct_cgc = rowData.sve > 0 ? (rowData.cgc / rowData.sve * 100) : 0;
        rowData.pct_unsa = rowData.sve > 0 ? (rowData.unsa / rowData.sve * 100) : 0;
        rowData.pct_solidaires = rowData.sve > 0 ? (rowData.solidaires / rowData.sve * 100) : 0;
        rowData.pct_autres = rowData.sve > 0 ? (rowData.autres / rowData.sve * 100) : 0;
        
        // Déterminer le syndicat dominant
        rowData.syndicat_dominant = determinerSyndicatDominant(
            rowData.pct_cgt, rowData.pct_cfdt, rowData.pct_fo, 
            rowData.pct_cftc, rowData.pct_cgc, rowData.pct_unsa, 
            rowData.pct_solidaires, rowData.pct_autres
        );
        
        data.push(rowData);
    }
    
    return data;
}
