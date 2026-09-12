/**
 * Utilitaires de nettoyage et suppression des balises HTML
 * Permet d'éviter d'afficher des balises (<p>, <strong>, <br>, etc.) en texte brut dans toute l'application.
 */

export function stripHtmlTags(input?: string | null): string {
  if (!input || typeof input !== 'string') return '';

  return input
    // Retirer les blocs de scripts et de styles éventuels
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    // Remplacer les balises de fin de bloc par un espace pour préserver la ponctuation
    .replace(/<\/(p|div|h[1-6]|li|tr|blockquote|section|article)>/gi, ' ')
    .replace(/<br\s*\/?>/gi, ' ')
    // Supprimer toutes les autres balises HTML
    .replace(/<\/?[^>]+(>|$)/g, '')
    // Décoder les entités HTML courantes
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;|&rsquo;|&lsquo;/gi, "'")
    .replace(/&ldquo;|&rdquo;/gi, '"')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&eacute;/gi, 'é')
    .replace(/&egrave;/gi, 'è')
    .replace(/&ecirc;/gi, 'ê')
    .replace(/&agrave;/gi, 'à')
    .replace(/&ocirc;/gi, 'ô')
    .replace(/&ucirc;/gi, 'û')
    .replace(/&ccedil;/gi, 'ç')
    // Normaliser les espaces et tabulations multiples
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Nettoie le contenu HTML et produit un résumé textuel concis avec ellipse si nécessaire
 */
export function formatPlainTextExcerpt(
  input?: string | null,
  maxLength: number = 180,
  fallback: string = 'Aucun résumé textuel fourni.'
): string {
  const clean = stripHtmlTags(input);
  if (!clean) return fallback;
  if (clean.length <= maxLength) return clean;
  return clean.slice(0, maxLength).trim() + '…';
}
