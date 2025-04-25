# Cartographie des Résultats Syndicaux - CGT

## Cahier des charges

### 1. Présentation générale

L'application "Cartographie des Résultats Syndicaux - CGT" est un outil de visualisation des données issues de la mesure de représentativité du 8 avril 2025 pour le cycle 4. Elle permet d'explorer les résultats des élections syndicales par département, région et entreprise, avec un focus particulier sur les résultats de la CGT.

Cette application web offre plusieurs vues complémentaires des données :
- Une vue par département sous forme de tableau
- Une carte interactive de la France
- Une liste complète des entreprises et de leurs résultats électoraux

### 2. Structure des données

Les données sont organisées selon la structure suivante :

- Une **entreprise** est identifiée par un **SIRET unique**
- Dans une entreprise, il y a des **collèges électoraux** qui correspondent à des **PV** (procès-verbaux)
- Une entreprise est donc un ensemble de PV pour un même SIRET

Les données principales comprennent :
- Les informations sur l'entreprise (SIRET, raison sociale, département, ville, etc.)
- Les résultats électoraux par syndicat (CGT, CFDT, CGT-FO, CFTC, CFE-CGC, SOLIDAIRES, UNSA, AUTRES)
- Les statistiques globales (nombre d'inscrits, de votants, de suffrages valablement exprimés)

### 3. Fonctionnalités principales

#### 3.1 Page d'accueil

La page d'accueil présente l'application et permet d'accéder aux différentes vues :
- Vue par département
- Carte interactive
- Liste des entreprises

#### 3.2 Vue par département (carte_data_csv.html)

Cette vue permet de consulter les résultats par département sous forme de tableau. Elle offre les fonctionnalités suivantes :
- Sélection d'un département
- Affichage des résultats globaux pour le département sélectionné
- Tri et filtrage des données
- Export des données (CSV, Excel, PDF)

#### 3.3 Carte interactive (carte_syndicale.html)

La carte interactive permet de visualiser les résultats sur une carte de France. Elle offre les fonctionnalités suivantes :
- Affichage des départements colorés selon le syndicat dominant
- Affichage des statistiques au survol d'un département
- Zoom et déplacement sur la carte
- Filtrage des données par syndicat

#### 3.4 Liste des entreprises (toutes_entreprises.html)

Cette vue permet de consulter la liste complète des entreprises et leurs résultats électoraux. Elle offre les fonctionnalités suivantes :

- **Filtrage avancé** :
  - Par département
  - Par nom d'entreprise
  - Par syndicat dominant
  - Par présence ou absence de la CGT
  - Par nombre d'inscrits
  - Par pourcentage de la CGT

- **Tableau interactif** :
  - Tri par colonne
  - Pagination
  - Affichage des scores et pourcentages
  - Mise en évidence des pourcentages importants (> 20%)

- **Statistiques globales** :
  - Nombre total d'entreprises
  - Nombre total d'inscrits
  - Nombre total de votants
  - Nombre total de suffrages valablement exprimés (SVE)
  - Répartition des voix par syndicat

- **Top 10 des entreprises** par nombre d'inscrits

- **Export des données** :
  - Copie
  - CSV
  - Excel
  - PDF
  - Impression

### 4. Guide d'utilisation

#### 4.1 Navigation générale

1. Accédez à la page d'accueil de l'application
2. Choisissez la vue qui vous intéresse :
   - "Vue par département" pour consulter les résultats par département
   - "Carte interactive" pour visualiser les résultats sur une carte de France
   - "Liste des entreprises" pour consulter la liste complète des entreprises

#### 4.2 Utilisation de la vue par département

1. Sélectionnez un département dans la liste déroulante
2. Consultez les résultats globaux pour le département sélectionné
3. Utilisez les options de tri et de filtrage pour affiner votre recherche
4. Exportez les données si nécessaire

#### 4.3 Utilisation de la carte interactive

1. Survolez un département pour afficher ses statistiques
2. Cliquez sur un département pour afficher ses résultats détaillés
3. Utilisez les boutons de zoom pour agrandir ou réduire la carte
4. Filtrez les données par syndicat si nécessaire

#### 4.4 Utilisation de la liste des entreprises

1. **Filtrage des données** :
   - Sélectionnez un département dans la liste déroulante
   - Saisissez un nom d'entreprise dans le champ de recherche
   - Sélectionnez un syndicat dominant
   - Choisissez si vous voulez voir les entreprises où la CGT est présente ou absente
   - Définissez des plages pour le nombre d'inscrits et le pourcentage de la CGT
   - Cliquez sur "Appliquer" pour filtrer les données
   - Cliquez sur "Réinitialiser" pour effacer tous les filtres

2. **Consultation du tableau** :
   - Triez les données en cliquant sur les en-têtes de colonnes
   - Naviguez entre les pages avec les boutons de pagination
   - Consultez les scores et pourcentages pour chaque syndicat
   - Les pourcentages supérieurs à 20% sont mis en évidence en rouge

3. **Consultation des détails** :
   - Cliquez sur le bouton "X PV" pour voir les détails des PV d'une entreprise

4. **Export des données** :
   - Utilisez les boutons d'export (Copie, CSV, Excel, PDF, Imprimer) pour exporter les données filtrées

### 5. Aspects techniques

#### 5.1 Technologies utilisées

- **Frontend** :
  - HTML5, CSS3, JavaScript
  - Bootstrap 5 pour la mise en page et les composants UI
  - DataTables pour les tableaux interactifs
  - Font Awesome pour les icônes
  - D3.js pour la carte interactive

- **Données** :
  - Format CSV pour le stockage des données
  - Traitement côté client en JavaScript

#### 5.2 Structure du projet

- **Fichiers HTML** :
  - `index.html` : Page d'accueil
  - `carte_data_csv.html` : Vue par département
  - `carte_syndicale.html` : Carte interactive
  - `toutes_entreprises.html` : Liste des entreprises

- **Fichiers JavaScript** :
  - `js/entreprises-data.js` : Logique pour la liste des entreprises
  - Autres fichiers JS pour les différentes vues

- **Fichiers CSS** :
  - Styles intégrés dans les fichiers HTML

- **Données** :
  - `pv_data.csv` : Données principales des PV

### 6. Maintenance et évolution

#### 6.1 Mise à jour des données

Pour mettre à jour les données :
1. Remplacez le fichier `pv_data.csv` par la nouvelle version
2. Assurez-vous que la structure des colonnes reste identique
3. Déployez les modifications sur le serveur

#### 6.2 Évolutions possibles

- Ajout d'une fonctionnalité de comparaison avec les cycles précédents
- Ajout de graphiques pour visualiser l'évolution des résultats
- Intégration d'une API pour récupérer les données en temps réel
- Amélioration de la performance pour les grands volumes de données
- Ajout d'une fonctionnalité d'export des résultats par email

### 7. Conclusion

L'application "Cartographie des Résultats Syndicaux - CGT" est un outil puissant pour explorer et analyser les résultats des élections syndicales. Elle offre plusieurs vues complémentaires des données et permet un filtrage avancé pour répondre aux besoins spécifiques des utilisateurs.

Grâce à son interface intuitive et ses fonctionnalités avancées, elle facilite la compréhension des résultats et permet d'identifier rapidement les tendances et les points forts de la CGT dans les différentes entreprises et régions de France.
