-- ============================================
-- CONFIGURATION SUPABASE STORAGE RLS
-- Pour permettre l'upload depuis GitHub Pages
-- ============================================

-- 1. POLITIQUE D'UPLOAD (INSERT)
-- Permet à n'importe qui d'uploader des fichiers dans le bucket 'sons'
-- ATTENTION : Cette politique est OUVERTE. En production, ajoutez des restrictions.

CREATE POLICY "Allow public uploads"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'sons'
);

-- 2. POLITIQUE DE LECTURE (SELECT)
-- Permet à tout le monde de voir et télécharger les fichiers uploadés

CREATE POLICY "Allow public read access"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'sons'
);

-- 3. (OPTIONNEL) POLITIQUE DE SUPPRESSION
-- Si vous voulez permettre la suppression de fichiers
-- Décommentez si nécessaire :

-- CREATE POLICY "Allow public delete"
-- ON storage.objects
-- FOR DELETE
-- TO public
-- USING (
--   bucket_id = 'sons'
-- );

-- ============================================
-- VÉRIFICATION DE LA CONFIGURATION
-- ============================================

-- Pour vérifier que les politiques sont bien créées :
-- SELECT * FROM pg_policies WHERE tablename = 'objects';

-- ============================================
-- SÉCURITÉ AVANCÉE (OPTIONNEL)
-- ============================================

-- Si vous voulez limiter l'upload à certaines extensions :
/*
CREATE POLICY "Allow specific file types"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'sons' 
  AND (
    (storage.extension(name) = 'mp3') OR
    (storage.extension(name) = 'wav') OR
    (storage.extension(name) = 'ogg') OR
    (storage.extension(name) = 'jpg') OR
    (storage.extension(name) = 'jpeg') OR
    (storage.extension(name) = 'png') OR
    (storage.extension(name) = 'gif') OR
    (storage.extension(name) = 'pdf')
  )
);
*/

-- Si vous voulez limiter la taille des fichiers (50 Mo) :
/*
CREATE POLICY "Limit file size"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'sons'
  AND (pg_column_size(metadata) < 52428800) -- 50 MB en octets
);
*/
