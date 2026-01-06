# Migration vers JWT pour Vercel

## 🔄 Changements principaux

### Architecture modifiée
- ❌ **Avant** : Sessions PHP (`$_SESSION`)
- ✅ **Après** : Tokens JWT stockés en cookies sécurisés

### Avantages
- ✅ Compatible avec l'architecture serverless de Vercel
- ✅ Pas de dépendance à l'état serveur
- ✅ Sécurité renforcée avec HTTPS + HttpOnly
- ✅ Expiration automatique des tokens (24h)

## 📦 Installation sur Vercel

### 1. Préparer le projet

```bash
# Cloner votre projet
git clone votre-repo.git
cd votre-repo

# Installer Vercel CLI (optionnel)
npm i -g vercel
```

### 2. Générer une clé JWT secrète

```bash
# Linux/Mac
openssl rand -base64 32

# Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

**Copiez la clé générée**, vous en aurez besoin !

### 3. Configurer les variables d'environnement

Dans le dashboard Vercel (**Settings → Environment Variables**), ajoutez :

| Variable | Valeur | Exemple |
|----------|--------|---------|
| `ACCESS_PASSWORD` | Votre mot de passe | `MonMotDePasse2024!` |
| `JWT_SECRET` | Clé générée à l'étape 2 | `a8fH3k9L...` (≥32 caractères) |
| `SUPABASE_URL` | URL de votre projet | `https://xxxxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service_role | `eyJhbGciOi...` |
| `SUPABASE_BUCKET_NAME` | Nom du bucket | `uploads` |

### 4. Mettre à jour config.php

Modifiez `config.php` pour utiliser les variables d'environnement :

```php
<?php
// Remplacer les define() par :
define('ACCESS_PASSWORD', getenv('ACCESS_PASSWORD') ?: 'admin123');
define('JWT_SECRET', getenv('JWT_SECRET') ?: 'CHANGEZ_MOI');
define('SUPABASE_URL', getenv('SUPABASE_URL'));
define('SUPABASE_SERVICE_ROLE_KEY', getenv('SUPABASE_SERVICE_ROLE_KEY'));
define('SUPABASE_BUCKET_NAME', getenv('SUPABASE_BUCKET_NAME') ?: 'uploads');
?>
```

### 5. Déployer

```bash
# Via Vercel CLI
vercel

# Ou via Git
git add .
git commit -m "Migration vers JWT pour Vercel"
git push
```

Le déploiement automatique se fera depuis GitHub/GitLab.

## 🔒 Sécurité

### Points de vigilance

1. **Clé JWT secrète**
   - ⚠️ Ne JAMAIS commiter la vraie clé dans Git
   - ✅ Utilisez uniquement les variables d'environnement Vercel
   - ✅ Générez une clé de minimum 32 caractères

2. **Cookies sécurisés**
   - ✅ `HttpOnly` : Protège contre XSS
   - ✅ `Secure` : HTTPS obligatoire
   - ✅ `SameSite=Strict` : Protection CSRF

3. **Validation**
   - ✅ Vérification de signature JWT
   - ✅ Expiration automatique (24h)
   - ✅ Validation côté serveur ET client

## 🧪 Tests

### Tester localement avec Vercel Dev

```bash
# Installer les dépendances
npm install -g vercel

# Créer .env local
cp .env.example .env
# Éditer .env avec vos vraies valeurs

# Lancer en local
vercel dev
```

Ouvrez : `http://localhost:3000`

### Vérifier l'authentification

1. Accédez à `/login.php`
2. Entrez le mot de passe
3. Vérifiez que vous êtes redirigé vers `/upload.php`
4. Ouvrez les DevTools → Application → Cookies
5. Vérifiez la présence de `auth_token` avec les flags `HttpOnly` et `Secure`

## 🐛 Dépannage

### Erreur : "Cannot modify header information"
- **Cause** : Espace ou caractère avant `<?php`
- **Solution** : Vérifiez qu'il n'y a RIEN avant `<?php` dans tous les fichiers

### Erreur : "Invalid JWT"
- **Cause** : Clé JWT_SECRET différente ou non définie
- **Solution** : Vérifiez les variables d'environnement dans Vercel

### Upload échoue avec erreur 500
- **Cause** : Limite de taille dépassée ou timeout
- **Solution** : Vercel limite à 4.5 Mo par défaut pour le plan gratuit
- **Alternative** : Upgrade vers Vercel Pro ou utilisez un upload direct client→Supabase

### Cookie non défini
- **Cause** : Site non HTTPS ou configuration cookie incorrecte
- **Solution** : Vérifiez que votre domaine Vercel utilise HTTPS (automatique)

## 📋 Checklist de déploiement

- [ ] Clé JWT générée et ajoutée dans Vercel
- [ ] Variables Supabase configurées
- [ ] Bucket Supabase créé et accessible
- [ ] `vercel.json` présent dans le projet
- [ ] Code mis à jour avec les nouvelles fonctions JWT
- [ ] Test local effectué avec `vercel dev`
- [ ] Déploiement réussi
- [ ] Test de connexion sur production
- [ ] Test d'upload fonctionnel

## 🚀 Prochaines améliorations possibles

- [ ] Upload direct client → Supabase (contourner limite 4.5 Mo)
- [ ] Refresh token pour sessions plus longues
- [ ] Rate limiting anti-bruteforce
- [ ] Multi-utilisateurs avec rôles
- [ ] Historique des uploads
- [ ] Preview des fichiers uploadés

## 📚 Ressources

- [Documentation Vercel PHP](https://vercel.com/docs/functions/serverless-functions/runtimes/php)
- [JWT.io](https://jwt.io/) - Debugger JWT
- [Supabase Storage](https://supabase.com/docs/guides/storage)

---

**Questions ?** Consultez les logs Vercel : Dashboard → Deployments → Function Logs
