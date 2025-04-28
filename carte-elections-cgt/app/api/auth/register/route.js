import { NextResponse } from 'next/server';
import { registerUser } from '@/lib/auth';

export async function POST(request) {
  try {
    const userData = await request.json();
    
    // Validation des données
    if (!userData.email || !userData.password || !userData.first_name || !userData.last_name) {
      return NextResponse.json({ 
        success: false, 
        message: 'Données manquantes' 
      }, { status: 400 });
    }
    
    // Enregistrement de l'utilisateur
    await registerUser(userData);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Inscription réussie. Votre demande est en attente de validation par un administrateur.' 
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    
    // Gestion des erreurs spécifiques
    if (error.code === '23505') { // Code PostgreSQL pour violation de contrainte unique
      return NextResponse.json({ 
        success: false, 
        message: 'Cet email est déjà utilisé' 
      }, { status: 409 });
    }
    
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'Erreur lors de l\'inscription' 
    }, { status: 500 });
  }
}