'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    organization: '',
    email: '',
    responsibility: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          organization: formData.organization,
          email: formData.email,
          responsibility: formData.responsibility,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Une erreur est survenue lors de l'inscription");
      }

      setSuccess(true);
      // Rediriger après 3 secondes
      setTimeout(() => {
        router.push('/login');
      }, 3000);
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
          <h1 className="text-xl font-bold text-white text-center">Inscription</h1>
        </div>
        <div className="p-8">
          {success ? (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
              <p>Votre inscription a été enregistrée avec succès!</p>
              <p>Un administrateur va examiner votre demande. Vous recevrez une notification par email lorsque votre compte sera activé.</p>
              <p>Redirection vers la page de connexion...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                  {error}
                </div>
              )}
              
              <div className="mb-4">
                <label htmlFor="last_name" className="block text-gray-700 text-sm font-bold mb-2">
                  Nom
                </label>
                <input
                  type="text"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  suppressHydrationWarning
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="first_name" className="block text-gray-700 text-sm font-bold mb-2">
                  Prénom
                </label>
                <input
                  type="text"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  suppressHydrationWarning
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="organization" className="block text-gray-700 text-sm font-bold mb-2">
                  Nom de l'organisation CGT
                </label>
                <input
                  type="text"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="organization"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  required
                  suppressHydrationWarning
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  suppressHydrationWarning
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="responsibility" className="block text-gray-700 text-sm font-bold mb-2">
                  Responsabilité
                </label>
                <input
                  type="text"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="responsibility"
                  name="responsibility"
                  value={formData.responsibility}
                  onChange={handleChange}
                  required
                  suppressHydrationWarning
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
                  Mot de passe
                </label>
                <input
                  type="password"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  suppressHydrationWarning
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-bold mb-2">
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={8}
                  suppressHydrationWarning
                />
              </div>
              
              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                  disabled={loading}
                >
                  {loading ? 'Inscription en cours...' : 'S\'inscrire'}
                </button>
              </div>
              
              <div className="mt-4 text-center">
                <p className="text-sm">
                  Déjà inscrit? <Link href="/login" className="text-red-600 hover:text-red-800">Se connecter</Link>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
