<?php
require_once 'config.php';

$error = '';

// Vérifier si déjà authentifié
$token = $_COOKIE['auth_token'] ?? '';
if (verifyJWT($token)) {
    header('Location: /upload.php');
    exit;
}

// Traitement du formulaire de connexion
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $password = $_POST['password'] ?? '';
    
    if ($password === ACCESS_PASSWORD) {
        // Créer le JWT avec expiration de 24h
        $payload = [
            'authenticated' => true,
            'iat' => time(),           // Issued at
            'exp' => time() + 86400    // Expire dans 24h
        ];
        
        $token = generateJWT($payload);
        setAuthCookie($token);
        
        header('Location: /upload.php');
        exit;
    } else {
        $error = "Mot de passe incorrect.";
    }
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Connexion - Upload Supabase</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>Connexion</h1>
        <p>Veuillez saisir le mot de passe pour accéder à l'outil d'upload.</p>
        
        <?php if ($error): ?>
            <div class="error"><?php echo htmlspecialchars($error); ?></div>
        <?php endif; ?>
        
        <form method="POST" action="/login.php">
            <div class="form-group">
                <label for="password">Mot de passe :</label>
                <input type="password" name="password" id="password" required autofocus>
            </div>
            <button type="submit">Se connecter</button>
        </form>
    </div>
</body>
</html>
