import './globals.css';
import { Metadata } from 'next';

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
        <header className="bg-red-600 text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <a href="/" className="text-xl font-bold">Cartographie CGT</a>
            <nav>
              <ul className="flex space-x-4">
                <li>
                  <a href="/login" className="hover:underline">Connexion</a>
                </li>
                <li>
                  <a href="/inscription" className="hover:underline">Inscription</a>
                </li>
              </ul>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}