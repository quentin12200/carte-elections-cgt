// Fusionne les données des deux cycles par SIRET
function mergeDataBySiret(cycle3Data, cycle4Data) {
    console.log("mergeDataBySiret: cycle3Data", cycle3Data);
    console.log("mergeDataBySiret: cycle4Data", cycle4Data);
    const mergedData = {};
    cycle3Data.forEach(row => {
        const siret = row.siret;
        mergedData[siret] = { cycle3: row, cycle4: null };
    });
    cycle4Data.forEach(row => {
        const siret = row.siret;
        if (mergedData[siret]) {
            mergedData[siret].cycle4 = row;
        } else {
            mergedData[siret] = { cycle3: null, cycle4: row };
        }
    });
    console.log("mergeDataBySiret: mergedData", mergedData);
    return Object.values(mergedData);
}

// Détermine le syndicat dominant pour une entreprise donnée
function determinerSyndicatDominant(data) {
    console.log("determinerSyndicatDominant: data", data);
    const syndicats = Object.keys(data).filter(key => key.startsWith('SYNDICAT_'));
    let dominant = null;
    let maxScore = -Infinity;
    syndicats.forEach(syndicat => {
        const score = safeNumber(data[syndicat]);
        if (score > maxScore) {
            maxScore = score;
            dominant = syndicat;
        }
    });
    console.log("determinerSyndicatDominant: dominant", dominant);
    return dominant;
}

// Remplit le sélecteur de départements
function populateDepartements(departements) {
    console.log("populateDepartements: departements", departements);
    const select = document.getElementById('departement-select');
    departements.forEach(dep => {
        const option = document.createElement('option');
        option.value = dep.code;
        option.textContent = `${dep.code} - ${dep.name}`;
        select.appendChild(option);
    });
}

// Initialise le tableau de données avec DataTables
function initDataTable(data) {
    console.log("initDataTable: données transmises au tableau", data);
    $('#data-table').DataTable({
        data: data,
        columns: [
            { title: "SIRET", data: "cycle3.siret" },
            { title: "Nom Entreprise", data: "cycle3.raison_sociale" },
            { title: "Département", data: "cycle3.departement" },
            { title: "Cycle 3 - Inscrits", data: "cycle3.num_inscrits" },
            { title: "Cycle 3 - CGT", data: "cycle3.score_CGT" },
            { title: "Cycle 4 - Inscrits", data: "cycle4.num_inscrits" },
            { title: "Cycle 4 - CGT", data: "cycle4.score_CGT" },
            { 
                title: "Évolution CGT", 
                data: null,
                render: function (data) {
                    const score3 = safeNumber(data.cycle3?.score_CGT);
                    const score4 = safeNumber(data.cycle4?.score_CGT);
                    return score3 > 0 ? ((score4 - score3) / score3 * 100).toFixed(2) + "%" : "N/A";
                }
            }
        ],
        language: {
            url: "//cdn.datatables.net/plug-ins/1.13.4/i18n/fr-FR.json"
        }
    });
}

// Applique les filtres sur les données
function applyFilters(data, filters) {
    console.log("applyFilters: data", data, "filters", filters);
    return data.filter(row => {
        if (filters.departement && row.DEPARTEMENT !== filters.departement) return false;
        if (filters.entreprise && !row.NOM_ENTREPRISE.includes(filters.entreprise)) return false;
        if (filters.presenceCGT && !row.cycle4.CGT) return false;
        return true;
    });
}

// Réinitialise les filtres
function resetFilters() {
    console.log("resetFilters called");
    document.getElementById('departement-select').value = '';
    document.getElementById('entreprise-input').value = '';
    document.getElementById('presence-cgt-checkbox').checked = false;
}

// Calcule et affiche les statistiques
function updateStats(data) {
    console.log("updateStats: data", data);
    const totalCycle3 = data.reduce((sum, row) => sum + safeNumber(row.cycle3.CGT), 0);
    const totalCycle4 = data.reduce((sum, row) => sum + safeNumber(row.cycle4.CGT), 0);
    const evolution = ((totalCycle4 - totalCycle3) / totalCycle3) * 100;

    document.getElementById('stats-total-cycle3').textContent = totalCycle3.toFixed(2);
    document.getElementById('stats-total-cycle4').textContent = totalCycle4.toFixed(2);
    document.getElementById('stats-evolution').textContent = `${evolution.toFixed(2)}%`;
}

// Convertit une valeur en nombre en toute sécurité
function safeNumber(value) {
    console.log("safeNumber: value", value);
    return isNaN(parseFloat(value)) ? 0 : parseFloat(value);
}

// Récupère le mapping des départements
function getDepartementMapping() {
    console.log("getDepartementMapping called");
    return [
        { code: '01', name: 'Ain' },
        { code: '02', name: 'Aisne' },
        // ... autres départements ...
    ];
}
