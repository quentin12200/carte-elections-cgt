import pandas as pd
import json
import os

# Chemin vers le fichier Excel
excel_file = 'PV_FINAUX_TPE_AGRI_PAR_DPT_TYPE.xlsx'

# Répertoire de sortie pour les fichiers JSON
output_dir = 'json_data'

# Créer le répertoire s'il n'existe pas
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

# Lire le fichier Excel
print(f"Lecture du fichier Excel: {excel_file}")
try:
    # Essayer de lire le fichier en supposant que la première feuille contient les données
    df = pd.read_excel(excel_file)
    
    # Afficher les premières lignes pour comprendre la structure
    print("\nAperçu des données:")
    print(df.head())
    
    # Afficher les noms des colonnes
    print("\nNoms des colonnes:")
    print(df.columns.tolist())
    
    # Regrouper par département
    print("\nTraitement des données par département...")
    
    # Utiliser la colonne 'Département' pour le code département
    dept_col = 'Département'
    
    if dept_col not in df.columns:
        print(f"ATTENTION: La colonne '{dept_col}' n'existe pas dans le fichier Excel.")
        print("Colonnes disponibles:", df.columns.tolist())
        print("Utilisation de la première colonne comme code département par défaut.")
        dept_col = df.columns[0]
    
    # Créer un dictionnaire pour stocker les PV par département
    depts_data = {}
    
    # Traiter chaque ligne
    for _, row in df.iterrows():
        dept_code = str(row[dept_col]).zfill(2) if isinstance(row[dept_col], (int, float)) else str(row[dept_col])
        
        # Ignorer les lignes sans code département valide
        if not dept_code or pd.isna(dept_code) or dept_code == 'nan':
            continue
        
        # Nettoyer le code département (enlever les espaces, etc.)
        dept_code = dept_code.strip()
        
        # Créer une entrée pour ce département s'il n'existe pas déjà
        if dept_code not in depts_data:
            depts_data[dept_code] = []
        
        # Convertir la ligne en dictionnaire
        row_dict = row.to_dict()
        
        # Remplacer les valeurs NaN par None (qui sera converti en null en JSON)
        for key, value in row_dict.items():
            if pd.isna(value):
                row_dict[key] = None
                
        depts_data[dept_code].append(row_dict)
    
    # Créer un fichier JSON pour chaque département
    for dept_code, pv_list in depts_data.items():
        output_file = os.path.join(output_dir, f'departement_{dept_code}.json')
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(pv_list, f, ensure_ascii=False, indent=2, default=str)
        print(f"Fichier créé: {output_file} avec {len(pv_list)} PV")
    
    print(f"\nConversion terminée. {len(depts_data)} fichiers JSON ont été créés dans le répertoire '{output_dir}'.")

except Exception as e:
    print(f"Erreur lors de la conversion: {e}")
