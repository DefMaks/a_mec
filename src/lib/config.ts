// Configuration globale pour l application (Nom de l app & Restriction Éco)
export const DEFAULT_SCHOOL_ID = process.env.NEXT_PUBLIC_DEFAULT_SCHOOL_ID || '64c583de-e9e2-456b-8942-164656544661';
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Académie du Salut';
export const APP_SHORT_NAME = process.env.NEXT_PUBLIC_APP_SHORT_NAME || 'ADS';

/**
 * Retourne l'ID de l'école de filtrage actif.
 * Si DEFAULT_SCHOOL_ID est configuré et que l'utilisateur n'est PAS Super Admin,
 * on restreint les données à cette école uniquement.
 */
export function getActiveSchoolId(isSuperAdmin: boolean = false): string | null {
  if (isSuperAdmin) {
    return null; // Super Admin voit toutes les écoles
  }
  return DEFAULT_SCHOOL_ID || null;
}
