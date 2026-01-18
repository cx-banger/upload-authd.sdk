// ============================================
// CONFIGURATION - À PERSONNALISER
// ============================================

const CONFIG = {
    // Configuration des utilisateurs avec leurs dossiers
    USERS: {
        'admin': {
            password: 'admin123',
            folder: 'admin',
            displayName: 'Administrateur'
        },
        'artiste1': {
            password: 'motdepasse1',
            folder: 'artiste1',
            displayName: 'Artiste 1'
        },
        'artiste2': {
            password: 'motdepasse2',
            folder: 'artiste2',
            displayName: 'Artiste 2'
        },
        'artiste3': {
            password: 'motdepasse3',
            folder: 'artiste3',
            displayName: 'Artiste 3'
        },
        'artiste4': {
            password: 'motdepasse4',
            folder: 'artiste4',
            displayName: 'Artiste 4'
        },
        'artiste5': {
            password: 'motdepasse5',
            folder: 'artiste5',
            displayName: 'Artiste 5'
        },
        'artiste6': {
            password: 'motdepasse6',
            folder: 'artiste6',
            displayName: 'Artiste 6'
        },
        'artiste7': {
            password: 'motdepasse7',
            folder: 'artiste7',
            displayName: 'Artiste 7'
        },
        'artiste8': {
            password: 'motdepasse8',
            folder: 'artiste8',
            displayName: 'Artiste 8'
        },
        'artiste9': {
            password: 'motdepasse9',
            folder: 'artiste9',
            displayName: 'Artiste 9'
        },
        'artiste10': {
            password: 'motdepasse10',
            folder: 'artiste10',
            displayName: 'Artiste 10'
        }
    },
    
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
const userDisplay = document.getElementById('userDisplay');

// Variable globale pour stocker l'utilisateur connecté
let currentUser = null;

// ============================================
// GESTION DE L'AUTHENTIFICATION
// ============================================

// Vérifier si déjà connecté au chargement
window.addEventListener('DOMContentLoaded', () => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showUploadPage();
    }
});

// Connexion
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const password = document.getElementById('password').value;
    
    // Chercher l'utilisateur correspondant au mot de passe
    let foundUser = null;
    for (const [username, userData] of Object.entries(CONFIG.USERS)) {
        if (userData.password === password) {
            foundUser = {
                username: username,
                folder: userData.folder,
                displayName: userData.displayName
            };
            break;
        }
    }
    
    if (foundUser) {
        currentUser = foundUser;
        localStorage.setItem('currentUser', JSON.stringify(foundUser));
        showUploadPage();
    } else {
        showError(loginError, 'Mot de passe incorrect.');
    }
});

// Déconnexion
logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('currentUser');
    currentUser = null;
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
    
    // Afficher le nom de l'utilisateur connecté
    if (userDisplay && currentUser) {
        userDisplay.textContent = `Connecté en tant que : ${currentUser.displayName}`;
    }
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
                    message: `✅ Succès : ${file.name} → ${currentUser.folder}/`
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
    // Construire le chemin avec le dossier de l'utilisateur
    const filePath = `${currentUser.folder}/${filename}`;
    const url = `${CONFIG.SUPABASE_URL}/storage/v1/object/${CONFIG.BUCKET_NAME}/${filePath}`;
    
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
