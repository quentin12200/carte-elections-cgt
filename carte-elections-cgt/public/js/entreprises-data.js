// Fichier de gestion des données pour la page toutes_entreprises.html
let allData = [], filteredData = [], dataTable;

// Fonction pour charger les données
async function loadData() {
    try {
        // Charger les données depuis le fichier CSV
        const response = await fetch('pv_data.csv');
        const csvText = await response.text();
        
        // Traiter les données CSV
        allData = processCSVData(csvText);
        
        // Remplir le sélecteur de départements
        populateDepartements();
        
        // Initialiser les données filtrées
        filteredData = [...allData];
        
        // Initialiser le tableau DataTables
        initDataTable();
        
        // Mettre à jour les statistiques
        updateStats();
        
        // Mettre à jour le top des entreprises
        updateTopEntreprises();
        
    } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        alert('Erreur lors du chargement des données. Veuillez réessayer.');
    }
}

// Fonction pour remplir le sélecteur de départements
function populateDepartements() {
    // Utiliser le mapping des départements pour remplir la liste déroulante
    const deptMapping = getDepartementMapping();
    
    // Extraire les départements uniques des données
    // Utiliser directement le champ deptCode qui a été rempli à partir de la colonne G (index 6)
    const departmentCodes = [...new Set(allData
        .filter(item => item.deptCode && item.deptCode.trim() !== '')
        .map(item => item.deptCode))];
    
    console.log('Départements trouvés dans les données:', departmentCodes.length); // Debug
    if (departmentCodes.length > 0) {
        console.log('Exemples de codes de département:', departmentCodes.slice(0, 5));
    }
    
    // Trier les départements numériquement
    departmentCodes.sort((a, b) => parseInt(a) - parseInt(b));
    
    // Remplir le sélecteur de départements
    const deptSelect = document.getElementById('filter-departement');
    deptSelect.innerHTML = '<option value="">Tous les départements</option>';
    
    // Si aucun département n'est trouvé dans les données, utiliser tous les départements du mapping
    if (departmentCodes.length === 0) {
        console.warn('Aucun département trouvé dans les données, utilisation de la liste complète');
        // Utiliser tous les départements du mapping
        Object.keys(deptMapping).sort((a, b) => parseInt(a) - parseInt(b)).forEach(deptCode => {
            const option = document.createElement('option');
            option.value = deptCode;
            option.textContent = `${deptCode} - ${deptMapping[deptCode]}`;
            deptSelect.appendChild(option);
        });
    } else {
        // Utiliser les départements trouvés dans les données
        departmentCodes.forEach(deptCode => {
            const option = document.createElement('option');
            option.value = deptCode;
            option.textContent = `${deptCode} - ${deptMapping[deptCode] || 'Département ' + deptCode}`;
            deptSelect.appendChild(option);
        });
    }
    
    // Note: Ce code est maintenant géré par les conditions ci-dessus
}

// Fonction pour traiter les données CSV
function processCSVData(csvText) {
    // Remplacer les retours à la ligne Windows (CRLF) par des retours à la ligne Unix (LF)
    csvText = csvText.replace(/\r\n/g, '\n');
    
    // Nous allons maintenant utiliser les indices de colonnes plutôt que les noms pour éviter les problèmes d'encodage
    // Colonne G (index 6) = Département
    // Colonne H (index 7) = Région
    
    const lines = csvText.split('\n');
    const headers = lines[0].split(';').map(h => h.trim());
    
    // Stocker les données brutes de PV
    const rawData = [];
    
    // Stocker les entreprises par SIRET
    const entreprisesBySiret = {};
    
    console.log('Headers après correction d\'encodage:', headers); // Debug: afficher les en-têtes
    
    // Première étape : collecter toutes les données brutes de PV
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = line.split(';').map(v => v.trim());
        if (values.length < headers.length) continue; // Ignorer les lignes incomplètes
        
        const rowData = {};
        
        for (let j = 0; j < headers.length; j++) {
            rowData[headers[j]] = values[j] || '';
        }
        
        // Ajouter des champs calculés
        // Récupérer le code département directement depuis la colonne G (index 6)
        // Utiliser directement l'index de la colonne plutôt que son nom pour éviter les problèmes d'encodage
        rowData.deptCode = values[6] || '';
        
        // Ajouter un zéro devant les départements à un chiffre pour le tri
        if (rowData.deptCode && rowData.deptCode.length === 1) {
            rowData.deptCodeSort = '0' + rowData.deptCode;
        } else {
            rowData.deptCodeSort = rowData.deptCode;
        }
        
        // Récupérer le nom du département à partir du mapping
        const deptMapping = getDepartementMapping();
        rowData.deptNom = deptMapping[rowData.deptCode] || '';
        
        // Conserver la région
        rowData.region = rowData['Région'] || '';
        
        // Ajouter le PV aux données brutes
        rawData.push(rowData);
        
        // Regrouper par SIRET
        const siret = rowData['SIRET'];
        if (siret) {
            if (!entreprisesBySiret[siret]) {
                // Créer une nouvelle entreprise
                entreprisesBySiret[siret] = {
                    SIRET: siret,
                    'Raison sociale': rowData['Raison sociale'],
                    'Departement': values[6], // Colonne G = index 6
                    deptCode: rowData.deptCode,
                    deptNom: rowData.deptNom,
                    region: values[7] || '', // Colonne H = index 7 (Région)
                    'Region': values[7] || '',
                    'CP': rowData['CP'],
                    'Ville': rowData['Ville'],
                    'IDCC': rowData['IDCC'],
                    'Lib IDCC': rowData['Lib IDCC'],
                    pvs: [],
                    Inscrits: 0,
                    Votants: 0,
                    sve_total: 0,
                    CGT: 0,
                    CFDT: 0,
                    'CGT-FO': 0,
                    CFTC: 0,
                    'CFE-CGC': 0,
                    SOLIDAIRES: 0,
                    UNSA: 0,
                    AUTRES: 0
                };
            }
            
                        // Utiliser la fonction safeNumber définie globalement
            
            // Ajouter ce PV à l'entreprise avec des valeurs numériques sûres
            entreprisesBySiret[siret].pvs.push({
                'N°PV': rowData['N°PV'],
                'Date': rowData['Date'],
                'Coll': rowData['Coll'],
                'Inscrits': safeNumber(rowData['Inscrits']),
                'Votants': safeNumber(rowData['Votants']),
                'sve_total': safeNumber(rowData['sve_total']),
                'CGT': safeNumber(rowData['CGT']),
                'CFDT': safeNumber(rowData['CFDT']),
                'CGT-FO': safeNumber(rowData['CGT-FO']),
                'CFTC': safeNumber(rowData['CFTC']),
                'CFE-CGC': safeNumber(rowData['CFE-CGC']),
                'SOLIDAIRES': safeNumber(rowData['SOLIDAIRES']),
                'UNSA': safeNumber(rowData['UNSA']),
                'AUTRES': safeNumber(rowData['AUTRES'])
            });
            
            // Convertir les valeurs en nombres pour éviter les problèmes de calcul
            // S'assurer que les valeurs sont des nombres valides
            let inscrits = 0, votants = 0, sve = 0, cgt = 0, cfdt = 0, cgtfo = 0, cftc = 0, cfecgc = 0, solidaires = 0, unsa = 0, autres = 0;
            
            inscrits = safeNumber(rowData['Inscrits']);
            votants = safeNumber(rowData['Votants']);
            sve = safeNumber(rowData['sve_total']);
            cgt = safeNumber(rowData['CGT']);
            cfdt = safeNumber(rowData['CFDT']);
            cgtfo = safeNumber(rowData['CGT-FO']);
            cftc = safeNumber(rowData['CFTC']);
            cfecgc = safeNumber(rowData['CFE-CGC']);
            solidaires = safeNumber(rowData['SOLIDAIRES']);
            unsa = safeNumber(rowData['UNSA']);
            autres = safeNumber(rowData['AUTRES']);
            
            // Vérifier que les valeurs sont des nombres valides
            if (isNaN(inscrits) || isNaN(votants) || isNaN(sve)) {
                console.warn('Valeurs numériques invalides pour le PV:', rowData['NumPV'], 'SIRET:', siret);
            }
            
            // Additionner les valeurs numériques pour l'entreprise
            // Toutes les valeurs sont garanties d'être des nombres valides grâce à safeNumber
            entreprisesBySiret[siret].Inscrits += inscrits;
            entreprisesBySiret[siret].Votants += votants;
            entreprisesBySiret[siret].sve_total += sve;
            entreprisesBySiret[siret].CGT += cgt;
            entreprisesBySiret[siret].CFDT += cfdt;
            entreprisesBySiret[siret]['CGT-FO'] += cgtfo;
            entreprisesBySiret[siret].CFTC += cftc;
            entreprisesBySiret[siret]['CFE-CGC'] += cfecgc;
            entreprisesBySiret[siret].SOLIDAIRES += solidaires;
            entreprisesBySiret[siret].UNSA += unsa;
            entreprisesBySiret[siret].AUTRES += autres;
        }
    }
    
    // Deuxième étape : convertir les entreprises en tableau et calculer les champs dérivés
    const data = Object.values(entreprisesBySiret);
    
    console.log('Nombre total d\'entreprises (SIRET uniques):', data.length);
    
    // Calculer les totaux - méthode complètement réécrite pour éviter les erreurs
    let totalInscrits = 0;
    let totalVotants = 0;
    let totalSVE = 0;
    let totalCGT = 0;
    
    // Calculer les totaux en utilisant reduce pour plus de sécurité
    // Limiter les valeurs à des nombres raisonnables pour éviter les valeurs absurdes
    totalInscrits = data.reduce((sum, item) => {
        const val = safeNumber(item.Inscrits);
        // Vérifier que la valeur est raisonnable (moins de 100 000 par entreprise)
        return sum + (val > 100000 ? 0 : val);
    }, 0);
    
    totalVotants = data.reduce((sum, item) => {
        const val = safeNumber(item.Votants);
        // Vérifier que la valeur est raisonnable (moins de 100 000 par entreprise)
        return sum + (val > 100000 ? 0 : val);
    }, 0);
    
    totalSVE = data.reduce((sum, item) => {
        const val = safeNumber(item.sve_total);
        return sum + (val > 100000 ? 0 : val);
    }, 0);
    
    totalCGT = data.reduce((sum, item) => {
        const val = safeNumber(item.CGT);
        return sum + (val > 100000 ? 0 : val);
    }, 0);
    
    console.log('Total inscrits:', totalInscrits, 'Total votants:', totalVotants);
    console.log('Total SVE:', totalSVE, 'Total CGT:', totalCGT);
    
    // Calculer les champs dérivés pour chaque entreprise
    data.forEach(entreprise => {
        // Calculer le syndicat dominant
        const syndicats = ['CGT', 'CFDT', 'CGT-FO', 'CFTC', 'CFE-CGC', 'SOLIDAIRES', 'UNSA', 'AUTRES'];
        let maxVoix = -1;
        let syndicatDominant = '';
        
        for (const syndicat of syndicats) {
            const voix = entreprise[syndicat];
            if (voix > maxVoix) {
                maxVoix = voix;
                syndicatDominant = syndicat;
            }
        }
        
        entreprise.syndicatDominant = maxVoix > 0 ? syndicatDominant : 'Non défini';
        
        // Calculer le pourcentage CGT
        const sve = entreprise.sve_total;
        const cgtVoix = entreprise.CGT;
        entreprise.pourcentageCGT = sve > 0 ? (cgtVoix / sve * 100).toFixed(2) : '0.00';
        
        // Déterminer si la CGT est présente
        entreprise.cgtPresent = cgtVoix > 0;
        
        // Nombre de PV
        entreprise.nbPV = entreprise.pvs.length;
    });
    
    console.log('Données regroupées par SIRET:', data.length, 'entreprises'); // Debug
    if (data.length > 0) console.log('Premier élément:', data[0]); // Debug
    
    console.log('Données traitées:', data.length, 'lignes'); // Debug: afficher le nombre de lignes traitées
    if (data.length > 0) console.log('Premier élément:', data[0]); // Debug: afficher le premier élément
    
    return data;
}

// Fonction pour initialiser le tableau DataTables
function initDataTable() {
    console.log('Initialisation du tableau avec', filteredData.length, 'lignes'); // Debug
    
    dataTable = $('#entreprises-table').DataTable({
        data: filteredData,
        columns: [
            { 
                data: null, 
                render: function(d) {
                    // Utiliser directement le code département
                    const deptCode = d.deptCode || '';
                    
                    // Récupérer le nom du département à partir du mapping
                    const deptMapping = getDepartementMapping();
                    const deptNom = deptMapping[deptCode] || '';
                    
                    // Afficher le code et le nom du département
                    return deptCode ? `${deptCode} - ${deptNom}` : '';
                }
            },
            { data: 'Raison sociale' },
            { data: 'SIRET' },
            { data: 'Inscrits', render: d => d ? safeNumber(d).toLocaleString() : '0' },
            { data: 'Votants', render: d => d ? safeNumber(d).toLocaleString() : '0' },
            { data: 'sve_total', render: d => d ? safeNumber(d).toLocaleString() : '0' },
            { 
                data: 'CGT', 
                render: (d, t, r) => {
                    if (t !== 'display') return d;
                    const val = safeNumber(d);
                    const pct = r.pourcentageCGT;
                    return `<div class="score-cell">
                              <div class="score-value">${val.toLocaleString()}</div>
                              <div class="score-percent ${pct > 20 ? 'high-percent' : ''}">${pct}%</div>
                            </div>`;
                }
            },
            { 
                data: 'CFDT', 
                render: (d, t, r) => {
                    if (t !== 'display') return d;
                    const val = safeNumber(d);
                    const pct = r.sve_total > 0 ? (val / safeNumber(r.sve_total) * 100).toFixed(2) : '0.00';
                    return `<div class="score-cell">
                              <div class="score-value">${val.toLocaleString()}</div>
                              <div class="score-percent ${pct > 20 ? 'high-percent' : ''}">${pct}%</div>
                            </div>`;
                }
            },
            { 
                data: 'CGT-FO', 
                render: (d, t, r) => {
                    if (t !== 'display') return d;
                    const val = safeNumber(d);
                    const pct = r.sve_total > 0 ? (val / safeNumber(r.sve_total) * 100).toFixed(2) : '0.00';
                    return `<div class="score-cell">
                              <div class="score-value">${val.toLocaleString()}</div>
                              <div class="score-percent ${pct > 20 ? 'high-percent' : ''}">${pct}%</div>
                            </div>`;
                }
            },
            { 
                data: 'CFTC', 
                render: (d, t, r) => {
                    if (t !== 'display') return d;
                    const val = safeNumber(d);
                    const pct = r.sve_total > 0 ? (val / safeNumber(r.sve_total) * 100).toFixed(2) : '0.00';
                    return `<div class="score-cell">
                              <div class="score-value">${val.toLocaleString()}</div>
                              <div class="score-percent ${pct > 20 ? 'high-percent' : ''}">${pct}%</div>
                            </div>`;
                }
            },
            { 
                data: 'CFE-CGC', 
                render: (d, t, r) => {
                    if (t !== 'display') return d;
                    const val = safeNumber(d);
                    const pct = r.sve_total > 0 ? (val / safeNumber(r.sve_total) * 100).toFixed(2) : '0.00';
                    return `<div class="score-cell">
                              <div class="score-value">${val.toLocaleString()}</div>
                              <div class="score-percent ${pct > 20 ? 'high-percent' : ''}">${pct}%</div>
                            </div>`;
                }
            },
            { 
                data: 'SOLIDAIRES', 
                render: (d, t, r) => {
                    if (t !== 'display') return d;
                    const val = safeNumber(d);
                    const pct = r.sve_total > 0 ? (val / safeNumber(r.sve_total) * 100).toFixed(2) : '0.00';
                    return `<div class="score-cell">
                              <div class="score-value">${val.toLocaleString()}</div>
                              <div class="score-percent ${pct > 20 ? 'high-percent' : ''}">${pct}%</div>
                            </div>`;
                }
            },
            { 
                data: 'UNSA', 
                render: (d, t, r) => {
                    if (t !== 'display') return d;
                    const val = safeNumber(d);
                    const pct = r.sve_total > 0 ? (val / safeNumber(r.sve_total) * 100).toFixed(2) : '0.00';
                    return `<div class="score-cell">
                              <div class="score-value">${val.toLocaleString()}</div>
                              <div class="score-percent ${pct > 20 ? 'high-percent' : ''}">${pct}%</div>
                            </div>`;
                }
            },
            { 
                data: 'AUTRES', 
                render: (d, t, r) => {
                    if (t !== 'display') return d;
                    const val = safeNumber(d);
                    const pct = r.sve_total > 0 ? (val / safeNumber(r.sve_total) * 100).toFixed(2) : '0.00';
                    return `<div class="score-cell">
                              <div class="score-value">${val.toLocaleString()}</div>
                              <div class="score-percent ${pct > 20 ? 'high-percent' : ''}">${pct}%</div>
                            </div>`;
                }
            },
            { data: 'syndicatDominant', render: d => d ? `<span class="badge badge-${d.toLowerCase().replace(/[^a-z]+/g, '')}">${d}</span>` : '' },
            { data: null, render: d => `<button class="btn btn-sm btn-primary view-details" data-dept="${d.deptCode || ''}" data-siret="${d.SIRET || ''}" title="Voir les ${d.nbPV || 0} PV de cette entreprise"><i class="fas fa-eye"></i> ${d.nbPV || 0} PV</button>` }
        ],
        dom: 'Bfrtip',
        buttons: ['copy', 'csv', 'excel', 'pdf', 'print'],
        pageLength: 25,
        language: { url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/fr-FR.json' },
        responsive: true,
        order: [[3, 'desc']]
    });
    
    $('#entreprises-table').on('click', '.view-details', function() {
        const dept = $(this).data('dept');
        const siret = $(this).data('siret');
        window.location.href = `pv_departement.html?dept=${dept}&siret=${siret}`;
    });
}

// Fonction pour appliquer les filtres
function applyFilters() {
    const f = {
        dept: $('#filter-departement').val(),
        entreprise: $('#filter-entreprise').val().toLowerCase(),
        syn: $('#filter-syndicat').val(),
        pres: $('#filter-presence-cgt').val(),
        minI: $('#filter-inscrits-min').val(),
        maxI: $('#filter-inscrits-max').val(),
        minP: $('#filter-pourcentage-min').val(),
        maxP: $('#filter-pourcentage-max').val()
    };
    
    filteredData = allData.filter(item => {
        if (f.dept && item.deptCode !== f.dept) return false;
        if (f.entreprise && !item['Raison sociale'].toLowerCase().includes(f.entreprise)) return false;
        if (f.syn && item.syndicatDominant !== f.syn) return false;
        if (f.pres === 'present' && !item.cgtPresent) return false;
        if (f.pres === 'absent' && item.cgtPresent) return false;
        
        const ins = parseInt(item.Inscrits || 0);
        if (f.minI && ins < parseInt(f.minI)) return false;
        if (f.maxI && ins > parseInt(f.maxI)) return false;
        
        const pct = parseFloat(item.pourcentageCGT);
        if (f.minP && pct < parseFloat(f.minP)) return false;
        if (f.maxP && pct > parseFloat(f.maxP)) return false;
        
        return true;
    });
    
    dataTable.clear().rows.add(filteredData).draw();
    updateStats();
    updateTopEntreprises();
}

// Fonction pour réinitialiser les filtres
function resetFilters() {
    ['filter-departement', 'filter-entreprise', 'filter-syndicat', 'filter-presence-cgt', 
     'filter-inscrits-min', 'filter-inscrits-max', 'filter-pourcentage-min', 'filter-pourcentage-max']
        .forEach(id => document.getElementById(id).value = '');
    
    filteredData = [...allData];
    dataTable.clear().rows.add(filteredData).draw();
    updateStats();
    updateTopEntreprises();
}

// Fonction pour mettre à jour les statistiques
function updateStats() {
    const stats = {
        totalEntreprises: filteredData.length,
        totalInscrits: 0,
        totalVotants: 0,
        totalSVE: 0,
        voix: {},
        pourcentages: {},
        syndicatDominant: {}
    };
    
    ['CGT', 'CFDT', 'CGT-FO', 'CFTC', 'CFE-CGC', 'SOLIDAIRES', 'UNSA', 'AUTRES'].forEach(s => {
        stats.voix[s] = 0;
        stats.pourcentages[s] = 0;
        stats.syndicatDominant[s] = 0;
    });
    
    filteredData.forEach(item => {
        // Utiliser safeNumber et limiter les valeurs aberrantes (> 100000)
        const inscrits = safeNumber(item.Inscrits);
        const votants = safeNumber(item.Votants);
        const sve = safeNumber(item.sve_total);
        
        stats.totalInscrits += (inscrits > 100000 ? 0 : inscrits);
        stats.totalVotants += (votants > 100000 ? 0 : votants);
        stats.totalSVE += (sve > 100000 ? 0 : sve);
        
        ['CGT', 'CFDT', 'CGT-FO', 'CFTC', 'CFE-CGC', 'SOLIDAIRES', 'UNSA', 'AUTRES'].forEach(s => {
            const val = safeNumber(item[s]);
            stats.voix[s] += (val > 100000 ? 0 : val);
        });
        
        if (item.syndicatDominant) {
            stats.syndicatDominant[item.syndicatDominant]++;
        }
    });
    
    Object.keys(stats.voix).forEach(s => {
        stats.pourcentages[s] = stats.totalSVE > 0 ? ((stats.voix[s] / stats.totalSVE * 100).toFixed(2)) : '0.00';
    });
    
    const cont = document.getElementById('global-stats');
    // Fonction pour formater les nombres avec vérification des valeurs aberrantes
    const fmt = n => {
        // Vérifier que n est un nombre valide et raisonnable
        if (isNaN(n) || n === null || n === undefined) return '0';
        if (n > 100000000) return '0'; // Valeur clairement aberrante
        return Math.round(n).toLocaleString();
    };
    
    let html = `<div class="row text-center">`;
    [['Entreprises', 'totalEntreprises'], ['Inscrits', 'totalInscrits'], ['Votants', 'totalVotants'], ['SVE', 'totalSVE']]
        .forEach(([label, k]) => {
            html += `<div class="col"><h3>${fmt(stats[k])}</h3><p>${label}</p></div>`;
        });
    
    html += `</div><hr><table class="table table-sm"><thead><tr><th>Syndicat</th><th>Voix</th><th>%</th><th>Entreprises dom.</th></tr></thead><tbody>`;
    
    Object.keys(stats.voix).forEach(s => {
        html += `<tr><td>${s}</td><td>${fmt(stats.voix[s])}</td><td>${stats.pourcentages[s]}%</td><td>${stats.syndicatDominant[s]}</td></tr>`;
    });
    
    html += `</tbody></table>`;
    cont.innerHTML = html;
}

// Fonction pour mettre à jour le top des entreprises
function updateTopEntreprises() {
    const top = filteredData.slice()
        .sort((a, b) => parseInt(b.Inscrits || 0) - parseInt(a.Inscrits || 0))
        .slice(0, 10);
    
    const cont = document.getElementById('top-entreprises');
    let html = '<div class="list-group">';
    
    top.forEach(item => {
        html += `<a href="pv_departement.html?dept=${item.deptCode}&siret=${item.SIRET}" 
                   class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                   <span>${item['Raison sociale']} <small class="text-muted">(${item.deptCode})</small></span>
                   <span class="badge bg-primary rounded-pill">${parseInt(item.Inscrits || 0).toLocaleString()}</span>
                 </a>`;
    });
    
    html += '</div>';
    cont.innerHTML = html;
}

// Initialisation des événements
// Ne pas ajouter un second event listener pour loadData car il est déjà appelé dans le HTML
// document.addEventListener('DOMContentLoaded', loadData);

// Fonction pour convertir en nombre sûr - définie globalement pour être utilisée partout
function safeNumber(val) {
    if (val === undefined || val === null || val === '') return 0;
    const num = Number(val);
    return isNaN(num) ? 0 : num;
}

// Fonction pour récupérer le mapping des départements
function getDepartementMapping() {
    return {
        '01': 'Ain',
        '02': 'Aisne',
        '03': 'Allier',
        '04': 'Alpes-de-Haute-Provence',
        '05': 'Hautes-Alpes',
        '06': 'Alpes-Maritimes',
        '07': 'Ardèche',
        '08': 'Ardennes',
        '09': 'Ariège',
        '10': 'Aube',
        '11': 'Aude',
        '12': 'Aveyron',
        '13': 'Bouches-du-Rhône',
        '14': 'Calvados',
        '15': 'Cantal',
        '16': 'Charente',
        '17': 'Charente-Maritime',
        '18': 'Cher',
        '19': 'Corrèze',
        '2A': 'Corse-du-Sud',
        '2B': 'Haute-Corse',
        '21': 'Côte-d\'Or',
        '22': 'Côtes-d\'Armor',
        '23': 'Creuse',
        '24': 'Dordogne',
        '25': 'Doubs',
        '26': 'Drôme',
        '27': 'Eure',
        '28': 'Eure-et-Loir',
        '29': 'Finistère',
        '30': 'Gard',
        '31': 'Haute-Garonne',
        '32': 'Gers',
        '33': 'Gironde',
        '34': 'Hérault',
        '35': 'Ille-et-Vilaine',
        '36': 'Indre',
        '37': 'Indre-et-Loire',
        '38': 'Isère',
        '39': 'Jura',
        '40': 'Landes',
        '41': 'Loir-et-Cher',
        '42': 'Loire',
        '43': 'Haute-Loire',
        '44': 'Loire-Atlantique',
        '45': 'Loiret',
        '46': 'Lot',
        '47': 'Lot-et-Garonne',
        '48': 'Lozère',
        '49': 'Maine-et-Loire',
        '50': 'Manche',
        '51': 'Marne',
        '52': 'Haute-Marne',
        '53': 'Mayenne',
        '54': 'Meurthe-et-Moselle',
        '55': 'Meuse',
        '56': 'Morbihan',
        '57': 'Moselle',
        '58': 'Nièvre',
        '59': 'Nord',
        '60': 'Oise',
        '61': 'Orne',
        '62': 'Pas-de-Calais',
        '63': 'Puy-de-Dôme',
        '64': 'Pyrénées-Atlantiques',
        '65': 'Hautes-Pyrénées',
        '66': 'Pyrénées-Orientales',
        '67': 'Bas-Rhin',
        '68': 'Haut-Rhin',
        '69': 'Rhône',
        '70': 'Haute-Saône',
        '71': 'Saône-et-Loire',
        '72': 'Sarthe',
        '73': 'Savoie',
        '74': 'Haute-Savoie',
        '75': 'Paris',
        '76': 'Seine-Maritime',
        '77': 'Seine-et-Marne',
        '78': 'Yvelines',
        '79': 'Deux-Sèvres',
        '80': 'Somme',
        '81': 'Tarn',
        '82': 'Tarn-et-Garonne',
        '83': 'Var',
        '84': 'Vaucluse',
        '85': 'Vendée',
        '86': 'Vienne',
        '87': 'Haute-Vienne',
        '88': 'Vosges',
        '89': 'Yonne',
        '90': 'Territoire de Belfort',
        '91': 'Essonne',
        '92': 'Hauts-de-Seine',
        '93': 'Seine-Saint-Denis',
        '94': 'Val-de-Marne',
        '95': 'Val-d\'Oise',
        '971': 'Guadeloupe',
        '972': 'Martinique',
        '973': 'Guyane',
        '974': 'La Réunion',
        '976': 'Mayotte'
    };
}
document.getElementById('apply-filters').addEventListener('click', applyFilters);
document.getElementById('reset-filters').addEventListener('click', resetFilters);

// Gestion du mode sombre
function initDarkMode() {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const body = document.body;
    
    if (localStorage.getItem('darkMode') === 'true') {
        body.classList.add('dark-mode');
        darkModeToggle.innerHTML = '<i class="bi bi-sun"></i> Mode clair';
    }
    
    darkModeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        const isDark = body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDark);
        darkModeToggle.innerHTML = isDark ? '<i class="bi bi-sun"></i> Mode clair' : '<i class="bi bi-moon"></i> Mode sombre';
    });
}

document.addEventListener('DOMContentLoaded', initDarkMode);
