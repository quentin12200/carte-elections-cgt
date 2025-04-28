'use client';

import Cookies from 'js-cookie';

// Définir un cookie côté client
export function setCookie(name, value, options = {}) {
  Cookies.set(name, value, {
    ...options,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
}

// Récupérer un cookie côté client
export function getCookie(name) {
  return Cookies.get(name);
}

// Supprimer un cookie côté client
export function removeCookie(name) {
  Cookies.remove(name);
}
