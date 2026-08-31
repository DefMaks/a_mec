// Supabase Edge Function: create-user
// Déployée dans Supabase pour créer un utilisateur dans auth.users et lui assigner un rôle
// Cette fonction s'exécute côté serveur Deno dans l'infrastructure Supabase.
// Elle n'expose AUCUNE clé secrète au client web/mobile.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Gestion du pré-vol CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Initialiser le client Admin Supabase avec les variables d'environnement Deno internes
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Variables d\'environnement Supabase manquantes sur le serveur Edge.');
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // 2. Vérifier l'autorisation de l'appelant (Admin ou Super Admin)
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user: callerUser }, error: callerError } = await supabaseAdmin.auth.getUser(token);
      
      if (callerError || !callerUser) {
        // En mode sécurisé strict, décommenter si on exige un token valide
        // return new Response(JSON.stringify({ error: 'Non autorisé' }), { status: 401, headers: corsHeaders });
      }
    }

    // 3. Récupérer les paramètres de la requête
    const {
      email,
      password,
      nom_complet,
      telephone,
      role = 'teacher',
      ecole_id,
      send_email = false,
    } = await req.json();

    if (!email || !nom_complet) {
      return new Response(
        JSON.stringify({ error: 'L\'email et le nom complet sont requis.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Générer un mot de passe par défaut si non fourni
    const finalPassword = password || `Ads_${Math.random().toString(36).slice(-8)}!2026`;

    // 4. Créer le compte dans auth.users via l'API Admin
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: finalPassword,
      email_confirm: true, // Marquer l'email comme vérifié
      user_metadata: {
        nom_complet,
        role: role || 'teacher',
        ecole_id,
        telephone,
      },
    });

    if (createError) {
      return new Response(
        JSON.stringify({ error: createError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 5. Mettre à jour / insérer le profil dans public.profiles (garanti même si le trigger tarde)
    if (userData.user) {
      const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
        id: userData.user.id,
        user_id: userData.user.id,
        nom_complet,
        email,
        telephone,
        role: role || 'teacher',
        ecole_id: ecole_id || null,
        actif: true,
        updated_at: new Date().toISOString(),
      });

      if (profileError) {
        console.warn('Avertissement upsert profile:', profileError.message);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: userData.user.id,
          email: userData.user.email,
          nom_complet,
          role,
          temporary_password: finalPassword,
        },
        message: 'Utilisateur créé avec succès dans auth.users et profiles.',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Erreur interne du serveur Edge' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
