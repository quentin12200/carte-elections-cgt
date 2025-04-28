-- Configuration des tables pour le système d'authentification
-- À exécuter dans l'éditeur SQL de Supabase

-- Table des utilisateurs
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL,
  first_name VARCHAR NOT NULL,
  last_name VARCHAR NOT NULL,
  organization VARCHAR NOT NULL,
  responsibility VARCHAR NOT NULL,
  is_approved BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des demandes d'inscription en attente
CREATE TABLE registration_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fonction pour mettre à jour le timestamp updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour le timestamp updated_at
CREATE TRIGGER update_registration_requests_updated_at
BEFORE UPDATE ON registration_requests
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Créer un utilisateur admin par défaut (à modifier avec vos propres valeurs)
-- Le mot de passe est 'admin123' (à changer en production)
INSERT INTO users (
  email,
  password,
  first_name,
  last_name,
  organization,
  responsibility,
  is_approved,
  is_admin
) VALUES (
  'admin@cgt.fr',
  '$2a$10$X7tUYySyWV.fJJLM4XN1B.TsYJfBVY1VK1YVJm5UPWUrvVJUTZXMK', -- bcrypt hash de 'admin123'
  'Admin',
  'CGT',
  'CGT National',
  'Administrateur',
  TRUE,
  TRUE
);
