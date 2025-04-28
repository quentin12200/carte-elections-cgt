'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(email, password);
      
      if (!result.success) {
        throw new Error(result.error || "Identifiants incorrects");
      }

      // Redirection après connexion réussie
      router.push('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto mt-10 px-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
        <div className="bg-red-600 p-4">
          <h1 className="text-xl font-bold text-white text-center">Connexion</h1>
        </div>
        <div className="p-8">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                {error}
              </div>
            )}
            
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
                Email
              </label>
              <input
                type="email"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                suppressHydrationWarning
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                suppressHydrationWarning
              />
            </div>
            
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                disabled={loading}
              >
                {loading ? 'Connexion en cours...' : 'Se connecter'}
              </button>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-sm">
                Pas encore de compte? <Link href="/inscription" className="text-red-600 hover:text-red-800">S'inscrire</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
