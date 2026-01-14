/**
 * Validation frontend pour l'upload de fichiers
 */
document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm');
    const fileInput = document.getElementById('fileInput');
    const clientError = document.getElementById('clientError');
    const submitBtn = document.getElementById('submitBtn');
    const progressArea = document.getElementById('progressArea');

    // Configuration (doit correspondre au backend)
    const MAX_SIZE = 50 * 1024 * 1024; // 50 Mo
    const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'mp3', 'wav', 'ogg'];

    uploadForm.addEventListener('submit', (e) => {
        const files = fileInput.files;
        clientError.style.display = 'none';
        clientError.textContent = '';

        if (files.length === 0) {
            e.preventDefault();
            showError('Veuillez sÃ©lectionner au moins un fichier.');
            return;
        }

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const extension = file.name.split('.').pop().toLowerCase();

            // VÃ©rification de l'extension
            if (!ALLOWED_EXTENSIONS.includes(extension)) {
                e.preventDefault();
                showError(`Le fichier "${file.name}" a une extension non autorisÃ©e.`);
                return;
            }

            // VÃ©rification de la taille
            if (file.size > MAX_SIZE) {
                e.preventDefault();
                showError(`Le fichier "${file.name}" dÃ©passe la limite de 50 Mo.`);
                return;
            }
        }

        // Si tout est OK, on affiche l'Ã©tat de chargement
        submitBtn.disabled = true;
        submitBtn.textContent = 'Upload en cours...';
        progressArea.style.display = 'block';
    });

    function showError(message) {
        clientError.textContent = message;
        clientError.style.display = 'block';
        window.scrollTo(0, 0);
    }
});
