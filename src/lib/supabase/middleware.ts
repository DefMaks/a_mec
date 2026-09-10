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

  // Vérification stricte des rôles via la table public.profiles pour éviter la manipulation
  // des user_metadata côté client.
  if (user) {
    // Si la route nécessite une protection spécifique
    const isProtectedAdmin = pathname.startsWith('/admin');
    const isProtectedTeacher = pathname.startsWith('/teacher');
    const isProtectedParent = pathname.startsWith('/parent');
    const isProtectedStudent = pathname.startsWith('/student');

    if (isProtectedAdmin || isProtectedTeacher || isProtectedParent || isProtectedStudent) {
      // Interrogation sécurisée de la base de données
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const role = profile?.role;

      if (isProtectedAdmin && role !== 'super_admin' && role !== 'admin') {
         const url = request.nextUrl.clone();
         url.pathname = '/';
         return NextResponse.redirect(url);
      }

      if (isProtectedTeacher && role !== 'super_admin' && role !== 'teacher') {
         const url = request.nextUrl.clone();
         url.pathname = '/';
         return NextResponse.redirect(url);
      }

      if (isProtectedParent && role !== 'super_admin' && role !== 'parent') {
         const url = request.nextUrl.clone();
         url.pathname = '/';
         return NextResponse.redirect(url);
      }

      if (isProtectedStudent && role !== 'super_admin' && role !== 'student' && role !== 'eleve') {
         const url = request.nextUrl.clone();
         url.pathname = '/';
         return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}
