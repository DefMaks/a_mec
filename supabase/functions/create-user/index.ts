// Supabase Edge Function: create-user
// Endpoint officiel: https://fkuyjdfmpdzpaycfopmd.supabase.co/functions/v1/create-user
//
// Colonnes réelles vérifiées de public.profiles:
// - id (uuid, PK)
// - user_id (uuid)
// - nom_complet (text)
// - role (text)
// - ecole_id (uuid)
// - profile_status (boolean)
// - created_at (timestamptz)
//
// L'email et le numéro de téléphone sont conservés de manière sécurisée dans auth.users
// et injectés dans user_metadata.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AffectationInput {
  classe_id: string;
  role_professeur?: 'titulaire' | 'enseignant' | 'co-enseignant';
}

interface CreateUserPayload {
  email?: string;
  phone?: string;
  telephone?: string;
  password?: string;
  nom_complet: string;
  role: 'teacher' | 'admin' | 'super_admin' | 'parent';
  ecole_id?: string;
  specialite?: string;
  profile_status?: boolean;
  email_confirm?: boolean;
  phone_confirm?: boolean;
  affectations?: AffectationInput[];
  assigned_class_ids?: string[];
  titulaire_class_ids?: string[];
}

serve(async (req) => {
  // 1. Pré-vol CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  let createdAuthUserId: string | null = null;
  let supabaseAdmin: any = null;

  try {
    // 2. Initialiser le client Admin Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Variables SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquantes dans l\'environnement Edge.');
    }

    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // 3. Lire et valider le payload
    const payload: CreateUserPayload = await req.json();

    const nomComplet = (payload.nom_complet || '').trim();
    const rawRole = (payload.role || 'teacher').toLowerCase();
    const role = (['teacher', 'admin', 'super_admin', 'parent'].includes(rawRole) ? rawRole : 'teacher') as
      | 'teacher'
      | 'admin'
      | 'super_admin'
      | 'parent';

    const email = payload.email?.trim() || null;
    const phone = (payload.phone || payload.telephone)?.trim() || null;
    const ecoleId = payload.ecole_id || '64c583de-e9e2-456b-8942-164656544661'; // Académie du Salut par défaut
    const specialite = payload.specialite?.trim() || null;

    if (!nomComplet) {
      return new Response(
        JSON.stringify({ error: 'Le nom complet (nom_complet) est requis.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!email && !phone) {
      return new Response(
        JSON.stringify({ error: 'Un email ou un numéro de téléphone est obligatoire.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mot de passe sécurisé (fourni ou généré automatiquement)
    const finalPassword = payload.password && payload.password.length >= 6
      ? payload.password
      : `Ads_${Math.random().toString(36).slice(-8)}!2026`;

    // 4. Étape 1 : Création du compte dans auth.users
    const authCreateOptions: any = {
      password: finalPassword,
      email_confirm: payload.email_confirm ?? true,
      phone_confirm: payload.phone_confirm ?? true,
      user_metadata: {
        nom_complet: nomComplet,
        role: role,
        ecole_id: ecoleId,
        telephone: phone,
      },
    };

    if (email) authCreateOptions.email = email;
    if (phone) authCreateOptions.phone = phone;

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser(authCreateOptions);

    if (authError || !authData?.user) {
      return new Response(
        JSON.stringify({ error: authError?.message || 'Échec de la création dans auth.users.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    createdAuthUserId = authData.user.id;

    // 5. Étape 2 : Création ou mise à jour dans public.profiles
    // Uniquement les colonnes qui existent physiquement dans la table profiles
    const profileInsertData: any = {
      id: createdAuthUserId,
      user_id: createdAuthUserId,
      nom_complet: nomComplet,
      role: role,
      ecole_id: ecoleId,
      profile_status: payload.profile_status ?? true,
      created_at: new Date().toISOString(),
    };

    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert(profileInsertData)
      .select('id, user_id, nom_complet, role, ecole_id, profile_status')
      .single();

    if (profileError) {
      throw new Error(`Erreur insertion profiles: ${profileError.message}`);
    }

    const finalProfileId = profileData?.id || createdAuthUserId;

    // 6. Étape 3 : Si rôle 'teacher', insertion dans public.teacher
    if (role === 'teacher') {
      const { error: teacherError } = await supabaseAdmin
        .from('teacher')
        .insert({
          profile_id: finalProfileId,
          specialite: specialite,
        });

      if (teacherError) {
        console.warn('Avertissement insertion public.teacher:', teacherError.message);
      }
    }

    // 7. Étape 4 : Affectation immédiate aux classes dans public.classe_professeur
    const normalizedAffectations: AffectationInput[] = [];

    if (Array.isArray(payload.affectations) && payload.affectations.length > 0) {
      payload.affectations.forEach((aff) => {
        if (aff.classe_id) {
          normalizedAffectations.push({
            classe_id: aff.classe_id,
            role_professeur: aff.role_professeur || 'enseignant',
          });
        }
      });
    } else if (Array.isArray(payload.assigned_class_ids)) {
      const titulaireSet = new Set(payload.titulaire_class_ids || []);
      payload.assigned_class_ids.forEach((cid) => {
        normalizedAffectations.push({
          classe_id: cid,
          role_professeur: titulaireSet.has(cid) ? 'titulaire' : 'enseignant',
        });
      });
    }

    let assignedCount = 0;
    if (role === 'teacher' && normalizedAffectations.length > 0) {
      // Dédupliquer par classe_id
      const uniqueAffectationsMap = new Map<string, AffectationInput>();
      normalizedAffectations.forEach((aff) => uniqueAffectationsMap.set(aff.classe_id, aff));

      const rowsToInsert = Array.from(uniqueAffectationsMap.values()).map((aff) => ({
        classe_id: aff.classe_id,
        professeur_id: finalProfileId,
        role_professeur: aff.role_professeur || 'enseignant',
      }));

      const { data: cpData, error: cpError } = await supabaseAdmin
        .from('classe_professeur')
        .insert(rowsToInsert)
        .select('classe_id');

      if (cpError) {
        console.warn('Avertissement affectation classe_professeur:', cpError.message);
      } else {
        assignedCount = cpData?.length || rowsToInsert.length;
      }

      // Si titulaire spécifié, mettre à jour titulaire_id sur classes
      const titulaireAffs = rowsToInsert.filter((r) => r.role_professeur === 'titulaire');
      for (const tAff of titulaireAffs) {
        await supabaseAdmin
          .from('classes')
          .update({ titulaire_id: finalProfileId })
          .eq('id', tAff.classe_id);
      }
    }

    // 8. Réponse de succès
    return new Response(
      JSON.stringify({
        success: true,
        user_id: createdAuthUserId,
        profile_id: finalProfileId,
        role: role,
        nom_complet: nomComplet,
        email: email,
        telephone: phone,
        assigned_classes: assignedCount,
        temporary_password: finalPassword,
        message: 'Utilisateur créé et auto-confirmé avec succès (auth.users, profiles, teacher, classe_professeur).',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    // 9. Stratégie de Compensation (Rollback automatique de auth.users si échec du profil)
    if (createdAuthUserId && supabaseAdmin) {
      try {
        console.error('Rollback déclenché pour auth user:', createdAuthUserId);
        await supabaseAdmin.auth.admin.deleteUser(createdAuthUserId);
      } catch (rollbackErr: any) {
        console.error('Échec du rollback:', rollbackErr?.message);
      }
    }

    return new Response(
      JSON.stringify({
        error: err.message || 'Erreur interne lors de la création de l\'utilisateur.',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
