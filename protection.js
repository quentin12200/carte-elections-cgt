// Script de protection pour toutes les pages
document.addEventListener('DOMContentLoaded', function() {
    // Vérifier si l'utilisateur est authentifié
    const authenticated = localStorage.getItem('authenticated');
    
    // Si nous ne sommes pas sur la page de login et que l'utilisateur n'est pas authentifié
    if (!window.location.href.includes('login.html') && (!authenticated || authenticated !== 'true')) {
        // Rediriger vers la page de connexion
        window.location.href = 'login.html';
    }
});
