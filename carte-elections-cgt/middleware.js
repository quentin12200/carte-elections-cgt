// Middleware pour protéger les routes
import { NextResponse } from 'next/server';
import { verifyAuthToken } from './lib/auth';

export function middleware(request) {
  // Récupérer le token d'authentification
  const token = request.cookies.get('auth_token')?.value;
  
  // Si aucun token n'est trouvé, rediriger vers la page de connexion
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Vérifier si le token est valide
  const user = verifyAuthToken(token);
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Vérifier si l'utilisateur est admin pour la page admin
  if (request.nextUrl.pathname.startsWith('/admin') && !user.is_admin) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

// Définir les routes à protéger
export const config = {
  matcher: [
    '/admin/:path*',
    '/carte_data_csv',
    '/carte_syndicale',
    '/toutes_entreprises',
    '/pv_departement'
  ],
};
