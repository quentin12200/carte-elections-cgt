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
