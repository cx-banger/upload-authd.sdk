<?php
require_once 'config.php';
check_auth();

$results = [];

/**
 * Fonction pour uploader un fichier vers Supabase Storage via API REST
 */
function uploadToSupabase($filePath, $fileName, $mimeType) {
    $url = SUPABASE_URL . '/storage/v1/object/' . SUPABASE_BUCKET_NAME . '/' . $fileName;
    
    $fileData = file_get_contents($filePath);
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
    curl_setopt($ch, CURLOPT_POSTFIELDS, $fileData);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . SUPABASE_SERVICE_ROLE_KEY,
        'Content-Type: ' . $mimeType,
        'x-upsert: true'
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode >= 200 && $httpCode < 300) {
        return ['success' => true, 'message' => "Succès : $fileName"];
    } else {
        $errorData = json_decode($response, true);
        $errorMsg = $errorData['message'] ?? 'Erreur inconnue';
        return ['success' => false, 'message' => "Erreur pour $fileName : $errorMsg (Code $httpCode)"];
    }
}

// Traitement de l'upload
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['files'])) {
    $files = $_FILES['files'];
    $fileCount = count($files['name']);
    
    for ($i = 0; $i < $fileCount; $i++) {
        $name = $files['name'][$i];
        $tmpName = $files['tmp_name'][$i];
        $size = $files['size'][$i];
        $error = $files['error'][$i];
        
        if ($error !== UPLOAD_ERR_OK) {
            $results[] = ['success' => false, 'message' => "Erreur d'upload PHP pour $name (Code $error)"];
            continue;
        }
        
        // Validation de la taille
        if ($size > MAX_FILE_SIZE) {
            $results[] = ['success' => false, 'message' => "$name est trop lourd (Max 50Mo)"];
            continue;
        }
        
        // Validation de l'extension
        $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
        if (!in_array($ext, ALLOWED_EXTENSIONS)) {
            $results[] = ['success' => false, 'message' => "Type de fichier non autorisé pour $name"];
            continue;
        }
        
        // Sécurisation du nom de fichier (unique et propre)
        $safeName = preg_replace('/[^a-zA-Z0-9._-]/', '_', pathinfo($name, PATHINFO_FILENAME));
        $uniqueName = time() . '_' . bin2hex(random_bytes(4)) . '_' . $safeName . '.' . $ext;
        
        // Détection du type MIME
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $tmpName);
        finfo_close($finfo);
        
        // Upload vers Supabase
        $results[] = uploadToSupabase($tmpName, $uniqueName, $mimeType);
    }
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Upload de fichiers - Supabase</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Upload de fichiers</h1>
            <a href="/logout.php" class="logout-btn">Déconnexion</a>
        </div>
        
        <p>Sélectionnez des images (jpg, png, gif), documents (pdf) ou sons (mp3, wav, ogg).</p>
        <p>Taille max : 50 Mo par fichier.</p>

        <?php if (!empty($results)): ?>
            <div class="results">
                <?php foreach ($results as $res): ?>
                    <div class="message <?php echo $res['success'] ? 'success' : 'error'; ?>">
                        <?php echo htmlspecialchars($res['message']); ?>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>

        <form id="uploadForm" method="POST" enctype="multipart/form-data" action="/upload.php">
            <div class="form-group">
                <input type="file" name="files[]" id="fileInput" multiple required>
            </div>
            <div id="clientError" class="error" style="display:none;"></div>
            <button type="submit" id="submitBtn">Uploader les fichiers</button>
        </form>
        
        <div id="progressArea" style="display:none; margin-top: 20px;">
            <p>Upload en cours...</p>
        </div>
    </div>

    <script src="script.js"></script>
</body>
</html>
