<?php
/**
 * Configuration du site - Version JWT pour Vercel
 */

// Mot de passe commun pour l'accès au site
define('ACCESS_PASSWORD', 'admin123');

// IMPORTANT : Générez une clé secrète forte et unique !
// Utilisez : openssl rand -base64 32
define('JWT_SECRET', 'CHANGEZ_CETTE_CLE_SECRETE_TRES_LONGUE_ET_ALEATOIRE_32_CARACTERES_MINIMUM');

// Configuration Supabase
define('SUPABASE_URL', 'https://VOTRE_PROJET_ID.supabase.co');
define('SUPABASE_SERVICE_ROLE_KEY', 'VOTRE_SERVICE_ROLE_KEY');
define('SUPABASE_BUCKET_NAME', 'uploads');

// Paramètres d'upload
define('MAX_FILE_SIZE', 50 * 1024 * 1024); // 50 Mo
define('ALLOWED_EXTENSIONS', [
    'jpg', 'jpeg', 'png', 'gif', // Images
    'pdf',                       // Documents
    'mp3', 'wav', 'ogg'          // Sons
]);

/**
 * Génère un JWT simple (sans bibliothèque externe)
 */
function generateJWT($payload) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload = json_encode($payload);
    
    $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, JWT_SECRET, true);
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    
    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

/**
 * Vérifie et décode un JWT
 */
function verifyJWT($jwt) {
    if (empty($jwt)) {
        return false;
    }
    
    $tokenParts = explode('.', $jwt);
    if (count($tokenParts) !== 3) {
        return false;
    }
    
    list($header, $payload, $signature) = $tokenParts;
    
    // Vérification de la signature
    $validSignature = hash_hmac('sha256', $header . "." . $payload, JWT_SECRET, true);
    $validBase64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($validSignature));
    
    if ($signature !== $validBase64Signature) {
        return false;
    }
    
    // Décodage du payload
    $payloadJson = base64_decode(str_replace(['-', '_'], ['+', '/'], $payload));
    $data = json_decode($payloadJson, true);
    
    // Vérification de l'expiration
    if (isset($data['exp']) && $data['exp'] < time()) {
        return false;
    }
    
    return $data;
}

/**
 * Vérifie si l'utilisateur est authentifié via JWT
 */
function check_auth() {
    $token = $_COOKIE['auth_token'] ?? '';
    $payload = verifyJWT($token);
    
    if (!$payload || !isset($payload['authenticated']) || $payload['authenticated'] !== true) {
        header('Location: /login.php');
        exit;
    }
    
    return $payload;
}

/**
 * Définit le cookie JWT
 */
function setAuthCookie($token) {
    // Cookie sécurisé avec durée de 24h
    setcookie('auth_token', $token, [
        'expires' => time() + 86400, // 24 heures
        'path' => '/',
        'secure' => true,      // HTTPS uniquement
        'httponly' => true,    // Pas accessible via JavaScript
        'samesite' => 'Strict' // Protection CSRF
    ]);
}

/**
 * Supprime le cookie d'authentification
 */
function clearAuthCookie() {
    setcookie('auth_token', '', [
        'expires' => time() - 3600,
        'path' => '/',
        'secure' => true,
        'httponly' => true,
        'samesite' => 'Strict'
    ]);
}
?>
