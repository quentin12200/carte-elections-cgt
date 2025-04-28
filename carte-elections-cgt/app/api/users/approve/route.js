import { NextResponse } from 'next/server';
import { approveUser } from '../../../../lib/auth';
import { getAuthToken, verifyAuthToken } from '../../../../lib/auth';

export async function POST(request) {
  try {
    // Vérifier l'authentification
    const token = getAuthToken();
    if (!token) {
      return NextResponse.json(
        { message: 'Non authentifié' },
        { status: 401 }
      );
    }
    
    // Vérifier si l'utilisateur est admin
    const user = verifyAuthToken(token);
    if (!user || !user.is_admin) {
      return NextResponse.json(
        { message: 'Accès non autorisé' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    
    if (!body.requestId || !body.userId) {
      return NextResponse.json(
        { message: 'ID de demande et ID d\'utilisateur requis' },
        { status: 400 }
      );
    }
    
    // Approuver l'utilisateur
    await approveUser(body.userId, body.requestId);
    
    return NextResponse.json({ message: 'Utilisateur approuvé avec succès' });
  } catch (error) {
    console.error('Erreur lors de l\'approbation:', error);
    return NextResponse.json(
      { message: 'Erreur lors de l\'approbation de l\'utilisateur' },
      { status: 500 }
    );
  }
}