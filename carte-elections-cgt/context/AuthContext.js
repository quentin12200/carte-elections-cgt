'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { setCookie, getCookie, removeCookie } from '@/lib/cookies';

// Création du contexte d'authentification
const AuthContext = createContext();

// Hook personnalisé pour utiliser le contexte d'authentification
export function useAuth() {
  return useContext(AuthContext);
}

// Fournisseur du contexte d'authentification
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Vérifier l'état d'authentification au chargement
  useEffect(() => {
    async function checkAuthStatus() {
      try {
        // Vérifier si un cookie d'authentification côté client existe
        const clientToken = getCookie('auth_token_client');
        
        if (!clientToken) {
          setLoading(false);
          return;
        }
        
        const response = await fetch('/api/auth/me');
        
        if (response.ok) {
          const data = await response.json();
          if (data.authenticated && data.user) {
            setUser(data.user);
          }
        } else {
          // En cas d'erreur, supprimer le cookie côté client
          removeCookie('auth_token_client');
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
        // En cas d'erreur, supprimer le cookie côté client
        removeCookie('auth_token_client');
      } finally {
        setLoading(false);
      }
    }

    checkAuthStatus();
  }, []);

  // Fonction de connexion
  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Échec de la connexion");
      }

      const data = await response.json();
      
      // Stockage du token dans un cookie côté client pour référence
      if (data.token) {
        setCookie('auth_token_client', data.token, { expires: 7 }); // Expire dans 7 jours
      }
      
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Fonction de déconnexion
  const logout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error("Échec de la déconnexion");
      }

      // Supprimer le cookie côté client
      removeCookie('auth_token_client');
      
      setUser(null);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Valeur du contexte
  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.is_admin || false,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
