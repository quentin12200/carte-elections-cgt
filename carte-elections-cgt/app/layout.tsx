import './globals.css';
import { Metadata } from 'next';
import Link from 'next/link';
import { AuthProvider } from '@/context/AuthContext';
import NavBar from '@/components/NavBar';

export const metadata: Metadata = {
  title: 'Cartographie des Résultats Syndicaux - CGT',
  description: 'Outil de visualisation des données issues de la mesure de représentativité pour le cycle 4',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <AuthProvider>
          <header className="bg-red-600 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
              <Link href="/" className="text-xl font-bold">Cartographie CGT</Link>
              <NavBar />
            </div>
          </header>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}