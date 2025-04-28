import { NextResponse } from 'next/server';
import { getAuthToken, verifyAuthToken } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function GET(request) {
  try {
    // Récupérer le token d'authentification
    const token = getAuthToken();
    
    if (!token) {
      return NextResponse.json({ 
        authenticated: false,
        message: 'Non authentifié' 
      }, { status: 401 });
    }
    
    // Vérifier le token
    const decoded = verifyAuthToken(token);
    
    if (!decoded) {
      return NextResponse.json({ 
        authenticated: false,
        message: 'Token invalide' 
      }, { status: 401 });
    }
    
    // Récupérer les informations de l'utilisateur
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, organization, responsibility, is_admin, created_at')
      .eq('id', decoded.id)
      .single();
    
    if (error || !user) {
      return NextResponse.json({ 
        authenticated: false,
        message: 'Utilisateur non trouvé' 
      }, { status: 401 });
    }
    
    return NextResponse.json({
      authenticated: true,
      user
    });
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'authentification:', error);
    return NextResponse.json({ 
      authenticated: false,
      message: 'Erreur serveur' 
    }, { status: 500 });
  }
}
