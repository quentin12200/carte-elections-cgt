import { NextResponse } from 'next/server';
import { getPendingRequests } from '../../../../lib/auth';
import { getAuthToken, verifyAuthToken } from '../../../../lib/auth';

export async function GET() {
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
    
    // Récupérer les demandes en attente
    const requests = await getPendingRequests();
    
    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Erreur lors de la récupération des demandes:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des demandes' },
      { status: 500 }
    );
  }
}