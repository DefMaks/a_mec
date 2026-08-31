/**
 * Utilitaires pour la gestion des codes d'accès élèves et le décompte de validité
 * Le décompte (mensuel = 30j, trimestriel = 90j, annuel = 365j) est calculé
 * à partir de la date de dernière mise à jour du code.
 */

export interface AccessCodeStatus {
  isActive: boolean;
  daysRemaining: number;
  hoursRemaining: number;
  totalHoursRemaining: number;
  isExpired: boolean;
  lastUpdatedFormatted: string;
  expiresAtFormatted: string;
  badgeLabel: string;
  badgeColor: string;
  badgeBg: string;
  progressPercent: number; // de 0 à 100% de la période consommée
}

/**
 * Calcule l'état précis du décompte d'accès d'un élève.
 * @param lastUpdatedDate Date ISO de la dernière mise à jour (activation / renouvellement)
 * @param expirationDate Date ISO d'expiration prévue
 * @param durationDays Durée totale du forfait (défaut 30 jours si mensuel, 90 si trimestriel, 365 si annuel)
 */
export function calculateAccessCountdown(
  lastUpdatedDate?: string | null,
  expirationDate?: string | null,
  durationDays: number = 30
): AccessCodeStatus {
  const now = new Date();

  // Si aucune date d'expiration n'est spécifiée, on dérive depuis lastUpdated ou une date par défaut
  let lastUpdated = lastUpdatedDate ? new Date(lastUpdatedDate) : new Date(Date.now() - 2 * 24 * 3600 * 1000);
  let expiresAt = expirationDate
    ? new Date(expirationDate)
    : new Date(lastUpdated.getTime() + durationDays * 24 * 3600 * 1000);

  // Si la date d'expiration est invalide, calculer à partir de lastUpdated
  if (isNaN(expiresAt.getTime())) {
    expiresAt = new Date(lastUpdated.getTime() + durationDays * 24 * 3600 * 1000);
  }

  const diffMs = expiresAt.getTime() - now.getTime();
  const totalHoursRemaining = Math.floor(diffMs / (1000 * 60 * 60));
  const isExpired = diffMs <= 0;
  const daysRemaining = isExpired ? 0 : Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const hoursRemaining = isExpired ? 0 : totalHoursRemaining % 24;

  // Calcul du pourcentage consommé
  const totalDurationMs = durationDays * 24 * 3600 * 1000;
  const elapsedMs = now.getTime() - lastUpdated.getTime();
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round((elapsedMs / totalDurationMs) * 100))
  );

  const lastUpdatedFormatted = lastUpdated.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const expiresAtFormatted = expiresAt.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  let badgeLabel = '';
  let badgeColor = '';
  let badgeBg = '';

  if (isExpired) {
    const expiredSinceDays = Math.abs(Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    badgeLabel = expiredSinceDays > 0 ? `Expiré (${expiredSinceDays}j)` : 'Expiré aujourd hui';
    badgeColor = 'text-red-700';
    badgeBg = 'bg-red-50 border border-red-200';
  } else if (daysRemaining <= 3) {
    badgeLabel = `${daysRemaining}j restant${daysRemaining > 1 ? 's' : ''} (Urgent)`;
    badgeColor = 'text-amber-700';
    badgeBg = 'bg-amber-50 border border-amber-200';
  } else {
    badgeLabel = `${daysRemaining} jours restants`;
    badgeColor = 'text-emerald-700';
    badgeBg = 'bg-emerald-50 border border-emerald-200';
  }

  return {
    isActive: !isExpired,
    daysRemaining,
    hoursRemaining,
    totalHoursRemaining,
    isExpired,
    lastUpdatedFormatted,
    expiresAtFormatted,
    badgeLabel,
    badgeColor,
    badgeBg,
    progressPercent,
  };
}

/**
 * Renouvelle un code d'accès et calcule la nouvelle date d'expiration
 * à partir de l'instant présent (dernière mise à jour = now).
 */
export function renewAccessCode(
  durationDays: number = 30,
  existingCode?: string
): {
  code_acces: string;
  derniere_mise_a_jour_code: string;
  date_expiration_code: string;
  code_acces_actif: boolean;
} {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + durationDays * 24 * 3600 * 1000);

  // Conserve le code ou en génère un nouveau
  const code = existingCode || `ADS-${Math.floor(1000 + Math.random() * 9000)}`;

  return {
    code_acces: code,
    derniere_mise_a_jour_code: now.toISOString(),
    date_expiration_code: expiresAt.toISOString(),
    code_acces_actif: true,
  };
}
