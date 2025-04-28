// Fonctions d'authentification
import { supabase } from './supabase';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_change_this';

/**
 * Enregistre un nouvel utilisateur
 */
export async function registerUser(userData) {
  // Hash du mot de passe
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  
  // Insérer l'utilisateur dans la base de données
  const { data: user, error: userError } = await supabase
    .from('users')
    .insert({
      email: userData.email,
      password: hashedPassword,
      first_name: userData.first_name,
      last_name: userData.last_name,
      organization: userData.organization,
      responsibility: userData.responsibility,
      is_approved: false,
      is_admin: false
    })
    .select('id')
    .single();
  
  if (userError) throw userError;
  
  // Créer une demande d'inscription
  const { error: requestError } = await supabase
    .from('registration_requests')
    .insert({
      user_id: user.id,
      status: 'pending'
    });
  
  if (requestError) throw requestError;
  
  return { success: true };
}

/**
 * Connecte un utilisateur
 */
export async function loginUser(email, password) {
  // Récupérer l'utilisateur
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();
  
  if (userError) throw userError;
  if (!user) throw new Error('Utilisateur non trouvé');
  
  // Vérifier si l'utilisateur est approuvé
  if (!user.is_approved) {
    throw new Error('Votre compte n\'a pas encore été approuvé par un administrateur');
  }
  
  // Vérifier le mot de passe
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) throw new Error('Mot de passe incorrect');
  
  // Créer un token JWT
  const token = jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      is_admin: user.is_admin 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  return { user, token };
}

/**
 * Définit le cookie d'authentification
 */
export function setAuthCookie(token) {
  cookies().set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 jours
    path: '/'
  });
}

/**
 * Supprime le cookie d'authentification
 */
export function removeAuthCookie() {
  cookies().delete('auth_token');
}

/**
 * Récupère le token d'authentification
 */
export function getAuthToken() {
  return cookies().get('auth_token')?.value;
}

/**
 * Vérifie le token d'authentification
 */
export function verifyAuthToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Approuve un utilisateur
 */
export async function approveUser(userId, requestId) {
  // Mettre à jour le statut de l'utilisateur
  const { error: userError } = await supabase
    .from('users')
    .update({ is_approved: true })
    .eq('id', userId);
  
  if (userError) throw userError;
  
  // Mettre à jour le statut de la demande
  const { error: requestError } = await supabase
    .from('registration_requests')
    .update({ status: 'approved' })
    .eq('id', requestId);
  
  if (requestError) throw requestError;
  
  return { success: true };
}

/**
 * Rejette un utilisateur
 */
export async function rejectUser(userId, requestId) {
  // Mettre à jour le statut de la demande
  const { error: requestError } = await supabase
    .from('registration_requests')
    .update({ status: 'rejected' })
    .eq('id', requestId);
  
  if (requestError) throw requestError;
  
  return { success: true };
}

/**
 * Récupère les demandes d'inscription en attente
 */
export async function getPendingRequests() {
  const { data, error } = await supabase
    .from('registration_requests')
    .select(`
      id,
      user_id,
      status,
      created_at,
      users:user_id (
        id,
        first_name,
        last_name,
        email,
        organization,
        responsibility,
        created_at
      )
    `)
    .eq('status', 'pending');
  
  if (error) throw error;
  
  // Transformer les données pour faciliter l'utilisation
  const requests = data.map(request => ({
    id: request.id,
    user_id: request.user_id,
    status: request.status,
    created_at: request.created_at,
    user: request.users
  }));
  
  return requests;
}
