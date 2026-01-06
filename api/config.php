<?php
session_start();

ini_set('session.use_cookies', 1);
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 1); // HTTPS (Vercel)
ini_set('session.use_strict_mode', 1);

/**
 * Configuration du site - Version JWT pour Vercel
 */

// Mot de passe commun pour l'accès au site
define('ACCESS_PASSWORD', getenv('ACCESS_PASSWORD') ?: 'admin123');

// Clé secrète JWT
define('JWT_SECRET', getenv('JWT_SECRET') ?: 't4hdQz7RhfmjXbqSZCvJbwnItfUbHFucakO/709pj0w=');

// Configuration Supabase
define('SUPABASE_URL', getenv('SUPABASE_URL') ?: 'https://hrzmagjjobctkfxayokt.supabase.co');
define('SUPABASE_SERVICE_ROLE_KEY', getenv('SUPABASE_SERVICE_ROLE_KEY') ?: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhyem1hZ2pqb2JjdGtmeGF5b2t0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODkwMzIxNiwiZXhwIjoyMDc0NDc5MjE2fQ.vTOT_WPZoAS9qy_1mXkgCemwWBTNYjo1unSeOYYxpS8');
define('SUPABASE_BUCKET_NAME', getenv('SUPABASE_BUCKET_NAME') ?: 'sons');

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
        header('Location: /api/login.php');
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
