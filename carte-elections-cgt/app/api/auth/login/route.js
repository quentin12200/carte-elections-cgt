import { NextResponse } from 'next/server';
import { loginUser, setAuthCookie } from '@/lib/auth';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json({ 
        success: false, 
        message: 'Email et mot de passe requis' 
      }, { status: 400 });
    }
    
    const { user, token } = await loginUser(email, password);
    
    const response = NextResponse.json({ 
      success: true, 
      token: token, // Inclure le token dans la réponse pour le stockage côté client
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        organization: user.organization,
        responsibility: user.responsibility,
        is_admin: user.is_admin
      }
    });
    
    // Définir le cookie d'authentification
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      path: '/'
    });
    
    return response;
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'Identifiants incorrects' 
    }, { status: 401 });
  }
}