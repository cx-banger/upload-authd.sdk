// ============================================
// CONFIGURATION - À PERSONNALISER
// ============================================

const CONFIG = {
    // Mot de passe pour accéder à l'application
    PASSWORD: 'admin123',
    
    // Configuration Supabase
    SUPABASE_URL: 'https://hrzmagjjobctkfxayokt.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhyem1hZ2pqb2JjdGtmeGF5b2t0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5MDMyMTYsImV4cCI6MjA3NDQ3OTIxNn0.gCwV9AllAS10-TwMoJNfrO3IVKfgOcWBMxYIBCaaIH8',
    BUCKET_NAME: 'sons',
    
    // Paramètres d'upload
    MAX_FILE_SIZE: 50 * 1024 * 1024, // 50 Mo
    ALLOWED_EXTENSIONS: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'mp3', 'wav', 'ogg']
};

// ============================================
// ÉLÉMENTS DOM
// ============================================

const loginPage = document.getElementById('loginPage');
const uploadPage = document.getElementById('uploadPage');
const loginForm = document.getElementById('loginForm');
const uploadForm = document.getElementById('uploadForm');
const loginError = document.getElementById('loginError');
const clientError = document.getElementById('clientError');
const results = document.getElementById('results');
const fileInput = document.getElementById('fileInput');
const submitBtn = document.getElementById('submitBtn');
const logoutBtn = document.getElementById('logoutBtn');
const progressArea = document.getElementById('progressArea');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');

// ============================================
// GESTION DE L'AUTHENTIFICATION
// ============================================

// Vérifier si déjà connecté au chargement
window.addEventListener('DOMContentLoaded', () => {
    const isAuthenticated = localStorage.getItem('authenticated') === 'true';
    if (isAuthenticated) {
        showUploadPage();
    }
});

// Connexion
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const password = document.getElementById('password').value;
    
    if (password === CONFIG.PASSWORD) {
        localStorage.setItem('authenticated', 'true');
        showUploadPage();
    } else {
        showError(loginError, 'Mot de passe incorrect.');
    }
});

// Déconnexion
logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('authenticated');
    showLoginPage();
});

function showLoginPage() {
    loginPage.style.display = 'block';
    uploadPage.style.display = 'none';
    document.getElementById('password').value = '';
    loginError.style.display = 'none';
}

function showUploadPage() {
    loginPage.style.display = 'none';
    uploadPage.style.display = 'block';
}

// ============================================
// VALIDATION ET UPLOAD
// ============================================

uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const files = Array.from(fileInput.files);
    clientError.style.display = 'none';
    results.style.display = 'none';
    results.innerHTML = '';
    
    // Validation
    for (const file of files) {
        const ext = file.name.split('.').pop().toLowerCase();
        
        if (!CONFIG.ALLOWED_EXTENSIONS.includes(ext)) {
            showError(clientError, `Le fichier "${file.name}" a une extension non autorisée.`);
            return;
        }
        
        if (file.size > CONFIG.MAX_FILE_SIZE) {
            showError(clientError, `Le fichier "${file.name}" dépasse la limite de 50 Mo.`);
            return;
        }
    }
    
    // Upload
    await uploadFiles(files);
});

async function uploadFiles(files) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Upload en cours...';
    progressArea.style.display = 'block';
    
    const uploadResults = [];
    let completed = 0;
    
    for (const file of files) {
        try {
            const filename = generateUniqueFilename(file.name);
            progressText.textContent = `Upload de ${file.name}...`;
            
            const { data, error } = await uploadToSupabase(file, filename);
            
            if (error) {
                uploadResults.push({
                    success: false,
                    message: `❌ Erreur pour ${file.name}: ${error.message}`
                });
            } else {
                uploadResults.push({
                    success: true,
                    message: `✅ Succès : ${file.name}`
                });
            }
            
            completed++;
            const progress = (completed / files.length) * 100;
            progressBar.style.width = progress + '%';
            
        } catch (err) {
            uploadResults.push({
                success: false,
                message: `❌ Erreur pour ${file.name}: ${err.message}`
            });
        }
    }
    
    // Afficher les résultats
    displayResults(uploadResults);
    
    // Réinitialiser
    submitBtn.disabled = false;
    submitBtn.textContent = 'Uploader les fichiers';
    progressArea.style.display = 'none';
    progressBar.style.width = '0%';
    fileInput.value = '';
}

async function uploadToSupabase(file, filename) {
    const url = `${CONFIG.SUPABASE_URL}/storage/v1/object/${CONFIG.BUCKET_NAME}/${filename}`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
            'Content-Type': file.type || 'application/octet-stream',
            'x-upsert': 'true'
        },
        body: file
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        return { data: null, error: { message: errorData.message || 'Erreur inconnue' } };
    }
    
    const data = await response.json();
    return { data, error: null };
}

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

function generateUniqueFilename(originalName) {
    // Nettoyer les caractères spéciaux pour la sécurité
    // Les fichiers avec le même nom s'écraseront (x-upsert: true)
    return originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function showError(element, message) {
    element.textContent = message;
    element.style.display = 'block';
    window.scrollTo(0, 0);
}

function displayResults(uploadResults) {
    results.innerHTML = '';
    uploadResults.forEach(result => {
        const div = document.createElement('div');
        div.className = result.success ? 'message success' : 'message error';
        div.textContent = result.message;
        results.appendChild(div);
    });
    results.style.display = 'block';
}
