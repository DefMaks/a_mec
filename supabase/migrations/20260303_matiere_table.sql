-- ====================================================================
-- SUPABASE POSTGRESQL: Création / Définition de la table `public.matiere`
-- Exécuter ce script dans le SQL Editor de Supabase si nécessaire
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.matiere (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom TEXT NOT NULL,
    code TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour la recherche rapide
CREATE INDEX IF NOT EXISTS idx_matiere_nom ON public.matiere (nom);
CREATE INDEX IF NOT EXISTS idx_matiere_code ON public.matiere (code);

-- Activer Row Level Security (RLS)
ALTER TABLE public.matiere ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
DROP POLICY IF EXISTS "Lecture publique des matieres" ON public.matiere;
CREATE POLICY "Lecture publique des matieres"
    ON public.matiere FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Modification des matieres par admin" ON public.matiere;
CREATE POLICY "Modification des matieres par admin"
    ON public.matiere FOR ALL
    USING (true)
    WITH CHECK (true);

-- Insertion des matières de base du programme national RDC si non présentes
INSERT INTO public.matiere (nom, code, description)
VALUES
    ('Mathématiques', 'MATH', 'Algèbre, Géométrie, Calcul & Mesures'),
    ('Langues Nationales', 'LNAT', 'Lingala, Swahili, Kikongo, Tshiluba (Lecture & Écriture)'),
    ('Français & Communication', 'FRAN', 'Vocabulaire, Expression Orale & Grammaire'),
    ('Étude du Milieu & Éveil', 'EVEI', 'Sciences d''Observation, Hygiène & Écosystèmes'),
    ('Sciences Sociales & Civisme', 'SOCI', 'Éducation Civique, Morale, Famille & Histoire'),
    ('Arts & Activités Pratiques', 'ARTS', 'Dessin, Chant, Musique & Travaux Manuels'),
    ('Physique & Technologie', 'PHYS', 'Mécanique, Énergie & Ondes'),
    ('Chimie', 'CHIM', 'Chimie Générale & Expérimentale'),
    ('Biologie / SVT', 'SVT', 'Sciences de la Vie et de la Terre'),
    ('Informatique & Numérique', 'INFO', 'Initiation au Numérique & Algorithmique'),
    ('Anglais', 'ANGL', 'English Grammar, Reading & Vocabulary')
ON CONFLICT DO NOTHING;
