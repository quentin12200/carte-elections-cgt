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
            // Vérifier si la navbar existe
            const navbar = document.querySelector('.navbar-nav');
            if (navbar) {
                // Créer un élément de liste pour le bouton de déconnexion
                const logoutItem = document.createElement('li');
                logoutItem.className = 'nav-item ms-3';
                
                // Créer le bouton de déconnexion
                const logoutButton = document.createElement('button');
                logoutButton.className = 'btn btn-outline-light btn-sm';
                logoutButton.textContent = 'Déconnexion';
                logoutButton.onclick = function() {
                    localStorage.removeItem('authenticated');
                    window.location.href = 'login.html';
                };
                
                // Ajouter le bouton à l'élément de liste
                logoutItem.appendChild(logoutButton);
                
                // Ajouter l'élément de liste à la navbar
                navbar.appendChild(logoutItem);
            }
        }, 500); // Attendre 500ms pour s'assurer que le DOM est chargé
    }
});
