-- ====================================================================
-- SUPABASE POSTGRESQL TRIGGER: Synchronisation auth.users -> public.profiles
-- Exécuter ce script dans le SQL Editor de Supabase
-- ====================================================================

-- 1. S'assurer que le type enum de rôle existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'teacher', 'parent');
    END IF;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Fonction trigger exécutée à chaque création d'un auth.user
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
    v_nom_complet TEXT;
    v_role TEXT;
    v_telephone TEXT;
    v_ecole_id UUID;
BEGIN
    -- Extraction des métadonnées fournies lors de la création
    v_nom_complet := COALESCE(
        NEW.raw_user_meta_data->>'nom_complet',
        NEW.raw_user_meta_data->>'name',
        split_part(NEW.email, '@', 1)
    );
    
    v_role := COALESCE(
        NEW.raw_user_meta_data->>'role',
        'teacher'
    );
    
    v_telephone := NEW.raw_user_meta_data->>'telephone';
    
    IF NEW.raw_user_meta_data->>'ecole_id' IS NOT NULL AND NEW.raw_user_meta_data->>'ecole_id' <> '' THEN
        v_ecole_id := (NEW.raw_user_meta_data->>'ecole_id')::uuid;
    ELSE
        v_ecole_id := NULL;
    END IF;

    -- Insertion ou mise à jour automatique dans public.profiles
    INSERT INTO public.profiles (
        id,
        user_id,
        email,
        nom_complet,
        role,
        telephone,
        ecole_id,
        actif,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        NEW.id,
        NEW.email,
        v_nom_complet,
        v_role,
        v_telephone,
        v_ecole_id,
        true,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        nom_complet = EXCLUDED.nom_complet,
        role = EXCLUDED.role,
        telephone = COALESCE(EXCLUDED.telephone, profiles.telephone),
        ecole_id = COALESCE(EXCLUDED.ecole_id, profiles.ecole_id),
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Attacher le trigger sur la table auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- 4. Politiques RLS (Row Level Security) recommandées pour public.profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Lecture publique ou authentifiée des profils
DROP POLICY IF EXISTS "Lecture des profils" ON public.profiles;
CREATE POLICY "Lecture des profils"
    ON public.profiles FOR SELECT
    USING (true);

-- Mise à jour de son propre profil
DROP POLICY IF EXISTS "Modification de son propre profil" ON public.profiles;
CREATE POLICY "Modification de son propre profil"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Insertion de profils par les utilisateurs authentifiés ou par le service
DROP POLICY IF EXISTS "Insertion profil administrateur" ON public.profiles;
CREATE POLICY "Insertion profil administrateur"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id OR auth.role() = 'service_role' OR auth.role() = 'authenticated');
