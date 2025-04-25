# Cartographie des Élections Professionnelles CGT

Application web permettant de visualiser les résultats des élections professionnelles par département pour la CGT et autres syndicats.

## Fonctionnalités

- Carte interactive des départements français
- Visualisation des résultats par syndicat (CGT, CFDT, CGT-FO, CFTC, CFE-CGC, SOLIDAIRES, UNSA, AUTRES)
- Affichage détaillé des PV par département
- Filtrage des PV par collège électoral
- Statistiques de participation et répartition des voix

## Structure du projet

- `index.html` : Page d'accueil (redirection vers carte_data_csv.html)
- `carte_data_csv.html` : Affichage des départements sous forme de cartes
- `carte_syndicale.html` : Carte interactive de la France avec les résultats par département
- `pv_departement.html` : Détail des PV pour un département spécifique
- `json_data/` : Données des PV par département
- `json_data_ordonnees/` : Données agrégées par département
- `assets/` : Ressources (GeoJSON, etc.)
- `css/` : Feuilles de style
- `js/` : Scripts JavaScript

## Comment utiliser

1. Ouvrez `index.html` dans un navigateur web
2. Naviguez entre la vue liste et la carte interactive
3. Cliquez sur un département pour voir les détails des PV
4. Utilisez les filtres pour affiner les résultats

## Technologies utilisées

- HTML5, CSS3, JavaScript
- Bootstrap 5
- Leaflet.js pour la carte interactive
- D3.js pour les échelles de couleur
- DataTables pour les tableaux interactifs
- Font Awesome pour les icônes
