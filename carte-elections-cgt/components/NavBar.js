'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NavBar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const result = await logout();
      if (result.success) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <nav>
      <ul className="flex space-x-4">
        {isAuthenticated ? (
          <>
            <li>
              <span className="text-white">
                Bonjour, {user?.first_name || 'Utilisateur'}
              </span>
            </li>
            {isAdmin && (
              <li>
                <Link href="/admin" className="hover:underline">
                  Administration
                </Link>
              </li>
            )}
            <li>
              <button 
                onClick={handleLogout} 
                disabled={isLoggingOut}
                className="hover:underline"
              >
                {isLoggingOut ? 'Déconnexion...' : 'Déconnexion'}
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link href="/login" className="hover:underline">
                Connexion
              </Link>
            </li>
            <li>
              <Link href="/inscription" className="hover:underline">
                Inscription
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
