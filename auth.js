// Script de protection pour les pages du site CGT
document.addEventListener('DOMContentLoaded', function() {
    // Vérifier si l'utilisateur est authentifié
    const authenticated = localStorage.getItem('authenticated');
    
    // Si nous ne sommes pas sur la page de login et que l'utilisateur n'est pas authentifié
    if (!window.location.href.includes('login.html') && (!authenticated || authenticated !== 'true')) {
        // Rediriger vers la page de connexion
        window.location.href = 'login.html';
        return;
    }
    
    // Si nous sommes sur une page protégée, ajouter un bouton de déconnexion
    if (authenticated === 'true' && !window.location.href.includes('login.html')) {
        // Attendre que le DOM soit complètement chargé
        setTimeout(function() {
            // Essayer d'ajouter le bouton de déconnexion à la barre de navigation
            addLogoutButton();
        }, 500); // Attendre 500ms pour s'assurer que le DOM est chargé
    }
    
    // Fonction pour ajouter le bouton de déconnexion
    function addLogoutButton() {
        // Essayer d'abord d'ajouter à la navbar si elle existe
        const navbar = document.querySelector('.navbar-nav');
        if (navbar) {
            // Créer un élément de liste pour le bouton de déconnexion
            const logoutItem = document.createElement('li');
            logoutItem.className = 'nav-item ms-3';
            
            // Créer le bouton de déconnexion
            const logoutButton = document.createElement('button');
            logoutButton.className = 'btn btn-outline-light btn-sm';
            logoutButton.textContent = 'Déconnexion';
            logoutButton.onclick = logout;
            
            // Ajouter le bouton à l'élément de liste
            logoutItem.appendChild(logoutButton);
            
            // Ajouter l'élément de liste à la navbar
            navbar.appendChild(logoutItem);
            return;
        }
        
        // Si la navbar n'existe pas, créer un bouton flottant
        const logoutDiv = document.createElement('div');
        logoutDiv.style.position = 'fixed';
        logoutDiv.style.top = '20px';
        logoutDiv.style.right = '20px';
        logoutDiv.style.zIndex = '9999';
        
        const logoutButton = document.createElement('button');
        logoutButton.className = 'btn btn-danger';
        logoutButton.innerHTML = '<i class="fas fa-sign-out-alt"></i> Déconnexion';
        logoutButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
        logoutButton.onclick = logout;
        
        logoutDiv.appendChild(logoutButton);
        document.body.appendChild(logoutDiv);
    }
    
    // Fonction de déconnexion
    function logout() {
        localStorage.removeItem('authenticated');
        window.location.href = 'login.html';
    }
});
