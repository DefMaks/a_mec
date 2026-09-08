import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/config';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Redirection des utilisateurs non authentifiés vers la page login
  if (
    !user &&
    !pathname.startsWith('/login') &&
    !pathname.startsWith('/auth')
  ) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Vérification basique des rôles via les métadonnées (si disponibles) pour sécuriser le middleware
  // Note: Pour une sécurité maximale, on devrait interroger la table public.profiles
  // mais cela nécessite une requête supplémentaire. L'approche JWT/metadata est plus performante
  // pour le middleware.
  if (user && user.user_metadata) {
    const role = user.user_metadata.role as string;

    // Si on essaie d'accéder à l'admin sans être super_admin ou admin
    if (pathname.startsWith('/admin') && role !== 'super_admin' && role !== 'admin') {
       const url = request.nextUrl.clone();
       url.pathname = '/'; // redirige vers le dashboard par défaut (qui sera géré par RoleGuard)
       return NextResponse.redirect(url);
    }

    // Si on essaie d'accéder à l'espace enseignant sans être teacher ou super_admin
    if (pathname.startsWith('/teacher') && role !== 'super_admin' && role !== 'teacher') {
       const url = request.nextUrl.clone();
       url.pathname = '/';
       return NextResponse.redirect(url);
    }

    // Si on essaie d'accéder à l'espace parent sans être parent ou super_admin
    if (pathname.startsWith('/parent') && role !== 'super_admin' && role !== 'parent') {
       const url = request.nextUrl.clone();
       url.pathname = '/';
       return NextResponse.redirect(url);
    }

    // Si on essaie d'accéder à l'espace étudiant sans être student ou super_admin
    if (pathname.startsWith('/student') && role !== 'super_admin' && role !== 'student' && role !== 'eleve') {
       const url = request.nextUrl.clone();
       url.pathname = '/';
       return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
