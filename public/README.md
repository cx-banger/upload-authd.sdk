# Système de Gestion d'Upload Multi-Utilisateurs

Application web de gestion d'upload de fichiers vers Supabase Storage avec authentification multi-utilisateurs et isolation des dossiers par utilisateur.

## Table des matières

- [Architecture](#architecture)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Déploiement](#déploiement)
- [Gestion des utilisateurs](#gestion-des-utilisateurs)
- [Sécurité](#sécurité)
- [Structure des fichiers](#structure-des-fichiers)
- [Maintenance](#maintenance)
- [Dépannage](#dépannage)

## Architecture

### Vue d'ensemble

L'application est une solution statique déployée sur GitHub Pages qui communique directement avec Supabase Storage via l'API REST. Elle implémente :

- Authentification par mot de passe côté client
- Upload direct navigateur vers Supabase (sans serveur intermédiaire)
- Isolation des fichiers par utilisateur via structure de dossiers
- Validation des fichiers (type, taille)
- Interface responsive avec retour visuel en temps réel

### Technologies utilisées

- **Frontend** : HTML5, CSS3, JavaScript ES6+
- **Backend** : Supabase Storage API
- **Hébergement** : GitHub Pages
- **Authentification** : Session localStorage

### Flux de données

```
Utilisateur → Mot de passe → Validation client → Upload fichier
                                                        ↓
                                                  Supabase Storage
                                                        ↓
                                              sons/{dossier_utilisateur}/
```

## Prérequis

### Compte Supabase

- Projet Supabase actif
- Bucket Storage créé (nom : `sons`)
- Dossiers utilisateurs créés dans le bucket
- Clé API `anon` (publique)

### Compte GitHub

- Repository GitHub avec GitHub Pages activé
- Accès en écriture au repository

### Navigateur compatible

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Installation

### 1. Cloner le repository

```bash
git clone https://github.com/votre-username/votre-repo.git
cd votre-repo
```

### 2. Structure de fichiers requise

```
votre-repo/
├── index.html          # Interface utilisateur
├── app.js             # Logique applicative
├── style.css          # Feuille de style
└── README.md          # Documentation
```

### 3. Configuration Supabase

#### Créer le bucket

1. Accéder à Supabase Dashboard → Storage
2. Créer un nouveau bucket nommé `sons`
3. Activer l'option "Public bucket"

#### Créer les dossiers utilisateurs

Créer manuellement les dossiers suivants dans le bucket `sons` :
- `admin`
- `artiste1` à `artiste10`

#### Configurer les politiques RLS

Exécuter dans SQL Editor :

```sql
-- Politique d'upload public
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT TO public
WITH CHECK (bucket_id = 'sons');

-- Politique de lecture publique
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'sons');
```

## Configuration

### Paramètres de l'application

Ouvrir `app.js` et configurer les constantes :

#### Configuration Supabase

```javascript
SUPABASE_URL: 'https://votre-projet-id.supabase.co',
SUPABASE_ANON_KEY: 'votre_cle_anon_ici',
BUCKET_NAME: 'sons',
```

Pour obtenir ces informations :
1. Supabase Dashboard → Settings → API
2. Copier "Project URL" → `SUPABASE_URL`
3. Copier "anon public" key → `SUPABASE_ANON_KEY`

#### Configuration des utilisateurs

```javascript
USERS: {
    'identifiant': {
        password: 'mot_de_passe_securise',
        folder: 'nom_du_dossier',
        displayName: 'Nom affiché'
    }
}
```

**Important** : Modifier tous les mots de passe par défaut avant le déploiement en production.

#### Paramètres d'upload

```javascript
MAX_FILE_SIZE: 50 * 1024 * 1024,  // Taille maximale en octets (défaut: 50 Mo)
ALLOWED_EXTENSIONS: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'mp3', 'wav', 'ogg']
```

### Personnalisation des utilisateurs

Pour modifier un utilisateur existant :

```javascript
'artiste1': {
    password: 'nouveau_mot_de_passe',  // Remplacer
    folder: 'artiste1',                 // Conserver (doit correspondre au dossier Supabase)
    displayName: 'Nom Artiste'          // Personnaliser
}
```

Pour ajouter un nouvel utilisateur :

```javascript
'artiste11': {
    password: 'mot_de_passe_artiste11',
    folder: 'artiste11',
    displayName: 'Artiste 11'
}
```

Ne pas oublier de créer le dossier correspondant sur Supabase Storage.

## Déploiement

### GitHub Pages

#### Activation

1. Accéder au repository GitHub
2. Settings → Pages
3. Source : "Deploy from a branch"
4. Branch : `main`, dossier : `/ (root)`
5. Enregistrer

#### Vérification

L'application sera accessible à :
```
https://votre-username.github.io/nom-du-repo/
```

Délai de déploiement : 1 à 2 minutes après le commit.

#### Mises à jour

Chaque commit sur la branche `main` déclenche un redéploiement automatique.

### Déploiement alternatif

L'application peut également être déployée sur :
- Netlify
- Vercel (en mode statique)
- Cloudflare Pages
- Tout hébergeur supportant les sites statiques

## Gestion des utilisateurs

### Structure des accès

Chaque utilisateur dispose de :
- Un mot de passe unique
- Un dossier dédié sur Supabase Storage
- Un nom d'affichage personnalisable

### Matrice des utilisateurs par défaut

| Identifiant | Mot de passe | Dossier | Nom affiché |
|-------------|--------------|---------|-------------|
| admin | admin123 | admin | Administrateur |
| artiste1 | motdepasse1 | artiste1 | Artiste 1 |
| artiste2 | motdepasse2 | artiste2 | Artiste 2 |
| artiste3 | motdepasse3 | artiste3 | Artiste 3 |
| artiste4 | motdepasse4 | artiste4 | Artiste 4 |
| artiste5 | motdepasse5 | artiste5 | Artiste 5 |
| artiste6 | motdepasse6 | artiste6 | Artiste 6 |
| artiste7 | motdepasse7 | artiste7 | Artiste 7 |
| artiste8 | motdepasse8 | artiste8 | Artiste 8 |
| artiste9 | motdepasse9 | artiste9 | Artiste 9 |
| artiste10 | motdepasse10 | artiste10 | Artiste 10 |

### Rotation des mots de passe

1. Modifier le mot de passe dans `app.js`
2. Commiter et pusher les modifications
3. Communiquer le nouveau mot de passe à l'utilisateur concerné
4. Attendre le redéploiement GitHub Pages (1-2 minutes)

### Suppression d'un utilisateur

1. Retirer l'entrée correspondante dans `CONFIG.USERS`
2. Commiter les modifications
3. Optionnel : Supprimer le dossier sur Supabase Storage

## Sécurité

### Modèle de sécurité

**Niveau actuel** : Sécurité par obscurité (usage interne)

L'authentification est effectuée côté client. Les mots de passe sont visibles dans le code source JavaScript. Ce modèle est acceptable pour :
- Usage interne limité
- Environnements de confiance
- Accès restreint à l'URL de déploiement

**Non recommandé pour** :
- Applications publiques
- Données sensibles
- Conformité réglementaire stricte

### Limitations de sécurité

- Mots de passe stockés en clair dans le code source
- Pas de limitation de tentatives de connexion
- Clé API `anon` exposée publiquement (comportement normal pour Supabase)
- Session stockée dans `localStorage` (vulnérable au XSS)
- Pas d'isolation stricte entre utilisateurs au niveau RLS

### Recommandations de sécurisation

Pour un environnement de production critique :

1. **Implémenter Supabase Auth**
   - Créer des comptes utilisateurs réels
   - Utiliser Row Level Security basé sur `auth.uid()`
   - Activer l'authentification par email

2. **Politiques RLS par utilisateur**
```sql
CREATE POLICY "User specific upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'sons' AND 
  (storage.foldername(name))[1] = auth.uid()
);
```

3. **HTTPS obligatoire**
   - GitHub Pages fournit HTTPS par défaut
   - Vérifier l'absence de contenu mixte

4. **Audit des accès**
   - Activer les logs Supabase
   - Surveiller les uploads suspects

### Bonnes pratiques

- Modifier tous les mots de passe par défaut
- Utiliser des mots de passe complexes (12+ caractères, alphanumérique + symboles)
- Communiquer les mots de passe via canal sécurisé (pas d'email non chiffré)
- Rotation régulière des mots de passe
- Limiter l'accès à l'URL GitHub Pages

## Structure des fichiers

### Organisation sur Supabase Storage

```
sons/                           # Bucket principal
├── admin/                      # Dossier administrateur
│   ├── document1.pdf
│   └── rapport.pdf
├── artiste1/                   # Dossier artiste 1
│   ├── chanson1.mp3
│   ├── chanson2.mp3
│   └── cover.jpg
├── artiste2/                   # Dossier artiste 2
...
└── artiste10/                  # Dossier artiste 10
```

### Nommage des fichiers

Les fichiers uploadés conservent leur nom original après nettoyage :
- Caractères autorisés : `a-z A-Z 0-9 . _ -`
- Caractères interdits remplacés par `_`
- Gestion de l'écrasement : activée (`x-upsert: true`)

Exemples de transformation :
- `Ma Chanson (2024).mp3` → `Ma_Chanson__2024_.mp3`
- `Photo été.jpg` → `Photo_été.jpg`
- `document-final.pdf` → `document-final.pdf`

### Comportement en cas de doublon

Lorsqu'un fichier portant le même nom est uploadé à nouveau :
- Le fichier existant est **écrasé**
- Aucun historique n'est conservé
- Message de confirmation affiché à l'utilisateur

## Maintenance

### Surveillance

#### Métriques à suivre

- Taille totale du bucket Supabase
- Nombre de fichiers par dossier
- Quota de stockage utilisé

#### Accès Supabase Dashboard

```
https://supabase.com/dashboard/project/hrzmagjjobctkfxayokt/storage/files/buckets/sons
```

#### Navigation par dossier

```
.../buckets/sons?path=artiste1
.../buckets/sons?path=artiste2
...
```

### Opérations courantes

#### Consultation des fichiers

Via Supabase Dashboard → Storage → sons → sélectionner le dossier

#### Suppression de fichiers

1. Accéder au dossier concerné
2. Sélectionner le(s) fichier(s)
3. Cliquer sur "Delete"
4. Confirmer

#### Sauvegarde

Supabase ne propose pas de backup automatique du Storage en plan gratuit. Pour sauvegarder :

1. Utiliser l'API Supabase pour lister les fichiers
2. Télécharger via script automatisé
3. Stocker localement ou sur service tiers

### Limites de quota

#### Plan gratuit Supabase

- Stockage : 1 Go
- Bande passante : 2 Go/mois
- Fichiers : illimité

#### Dépassement

En cas de dépassement, considérer :
- Upgrade vers plan payant Supabase
- Nettoyage des fichiers obsolètes
- Migration vers autre solution de stockage

## Dépannage

### Erreurs courantes

#### "new row violates row-level security policy"

**Cause** : Politiques RLS mal configurées ou absentes

**Solution** :
1. Vérifier les politiques dans Supabase Dashboard → Storage → Policies
2. Exécuter à nouveau les scripts SQL de configuration
3. Vérifier que `bucket_id = 'sons'` dans les politiques

#### "Failed to fetch" lors de l'upload

**Cause** : Configuration Supabase incorrecte

**Solution** :
1. Vérifier `SUPABASE_URL` dans `app.js`
2. Vérifier `SUPABASE_ANON_KEY` (doit être la clé `anon`, pas `service_role`)
3. Vérifier la connectivité réseau
4. Ouvrir la console navigateur (F12) pour détails

#### Authentification refusée malgré bon mot de passe

**Cause** : Sensibilité à la casse ou espaces parasites

**Solution** :
1. Vérifier la casse exacte du mot de passe
2. Vider le cache navigateur
3. Vérifier l'absence d'espaces avant/après le mot de passe
4. Consulter la console JavaScript pour erreurs

#### Fichier uploadé dans mauvais dossier

**Cause** : Mapping utilisateur/dossier incorrect

**Solution** :
1. Vérifier la correspondance dans `CONFIG.USERS`
2. S'assurer que `folder` correspond au nom exact du dossier Supabase
3. Vérifier que `currentUser` est correctement défini

#### Upload échoue pour fichiers > 50 Mo

**Cause** : Limite de taille configurée

**Solution** :
1. Modifier `MAX_FILE_SIZE` dans `app.js` si nécessaire
2. Vérifier les limites du plan Supabase
3. Considérer la compression des fichiers

### Diagnostic

#### Activer le mode debug

Ouvrir la console développeur (F12) :
- Onglet "Console" : erreurs JavaScript
- Onglet "Network" : requêtes HTTP vers Supabase
- Onglet "Application" : contenu `localStorage`

#### Vérifier la session utilisateur

Dans la console :
```javascript
JSON.parse(localStorage.getItem('currentUser'))
```

Retourne l'utilisateur connecté et son dossier cible.

#### Tester l'API Supabase directement

```bash
curl -X POST \
  https://hrzmagjjobctkfxayokt.supabase.co/storage/v1/object/sons/test.txt \
  -H "Authorization: Bearer VOTRE_CLE_ANON" \
  -H "Content-Type: text/plain" \
  --data "test"
```

### Support

Pour assistance supplémentaire :
- Documentation Supabase : https://supabase.com/docs
- Documentation GitHub Pages : https://pages.github.com

## Changelog

### Version 1.0.0 (Actuelle)

- Authentification multi-utilisateurs (11 utilisateurs)
- Upload direct vers Supabase Storage
- Validation client des fichiers
- Interface responsive
- Barre de progression d'upload
- Gestion des sessions persistantes
- Support formats : images, PDF, audio

## Licence

Propriétaire. Tous droits réservés.

## Contact

Pour toute question concernant cette application, contacter l'administrateur système.
