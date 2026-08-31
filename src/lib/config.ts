// Configuration globale pour l application (Nom de l app & Restriction Éco)
export const DEFAULT_SCHOOL_ID = process.env.NEXT_PUBLIC_DEFAULT_SCHOOL_ID || '64c583de-e9e2-456b-8942-164656544661';
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Académie du Salut';
export const APP_SHORT_NAME = process.env.NEXT_PUBLIC_APP_SHORT_NAME || 'ADS';

// Supabase Principale (Mon Espace Classe / E-RDC)
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://fkuyjdfmpdzpaycfopmd.supabase.co';

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrdXlqZGZtcGR6cGF5Y2ZvcG1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NjczODYsImV4cCI6MjA4ODA0MzM4Nn0.oEwEBHeOKP9nZViwST4C4Fj6-RU2YgALUNqBejOP8gc';

// Flag de production pour masquer le switcher de rôles et les éléments de test
export const IS_PROD = true;

export function isProduction(): boolean {
  return IS_PROD;
}

// Configuration Passerelle Mobile Money Twiga Pay RDC (Supabase DMKS)
export const TWIGA_CONFIG = {
  clientId: process.env.NEXT_PUBLIC_TWIGA_CLIENT_ID || '94d2f218-e501-4c96-8180-f62df93b8c05',
  walletId: process.env.NEXT_PUBLIC_TWIGA_WALLET_ID || 'd7db85a8-07c5-45f6-9b81-ecaa549f8caa',
  supabaseUrl: process.env.NEXT_PUBLIC_TWIGA_SUPABASE_URL || 'https://hcpogyjdbtcxndzpyjvd.supabase.co',
  anonKey:
    process.env.NEXT_PUBLIC_TWIGA_ANON_KEY ||
    process.env.TWIGA_SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjcG9neWpkYnRjeG5kenB5anZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4ODc2NjIsImV4cCI6MjA2ODQ2MzY2Mn0.Y-V4hPt_c1rl2ffYZ9nG53R4VuhzrmBIseJSlqJvaNo',
  proxyEndpoint: 'https://hcpogyjdbtcxndzpyjvd.supabase.co/functions/v1/twigapaie-proxy',
  testPhoneNumber: '+243974156086',
  testPhoneNumberFormatted: '974156086',
  testAmountCDF: 10,
};

export type MobileOperator = 'airtel' | 'orange' | 'vodacom' | 'africell' | 'unknown';

export interface OperatorDetectionResult {
  operator: MobileOperator;
  name: string;
  formattedPhone: string;
  rawDigits: string;
  isValid: boolean;
  color: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}

/**
 * Détection automatique et formatage intelligent du numéro sans sélection manuelle de réseau.
 * Respecte les formats stricts de Twiga Paie RDC :
 * - Airtel (17) : 97XXXXXXX, 98XXXXXXX, 99XXXXXXX (9 chiffres sans 0)
 * - Orange Money (10) : 080XXXXXXX, 084XXXXXXX, 085XXXXXXX, 089XXXXXXX (10 chiffres avec 0)
 * - Vodacom M-Pesa (9) : 081XXXXXXX, 082XXXXXXX, 083XXXXXXX ou 24381/82/83 (10 chiffres)
 * - Africell (19) : 090XXXXXXX (10 chiffres avec 0)
 */
export function detectAndFormatOperator(phoneNumber: string): OperatorDetectionResult {
  if (!phoneNumber) {
    return {
      operator: 'unknown',
      name: 'Réseau Inconnu',
      formattedPhone: '',
      rawDigits: '',
      isValid: false,
      color: '#64748B',
      badgeBg: 'bg-gray-100',
      badgeText: 'text-gray-600',
      badgeBorder: 'border-gray-300',
    };
  }

  // Nettoyage : suppression de tout caractère non numérique sauf si commence par +
  let clean = phoneNumber.replace(/[\s\-\(\)\.]/g, '');
  if (clean.startsWith('+243')) {
    clean = clean.substring(4);
  } else if (clean.startsWith('243')) {
    clean = clean.substring(3);
  }

  // Détection Airtel : commence par 97, 98, 99 (ou 097, 098, 099)
  if (clean.startsWith('097') || clean.startsWith('098') || clean.startsWith('099')) {
    const airtelDigits = clean.substring(1);
    const isValid = airtelDigits.length === 9;
    return {
      operator: 'airtel',
      name: 'Airtel Money RDC',
      formattedPhone: airtelDigits,
      rawDigits: airtelDigits,
      isValid,
      color: '#EF4444',
      badgeBg: 'bg-red-50',
      badgeText: 'text-red-700',
      badgeBorder: 'border-red-200',
    };
  }
  if (clean.startsWith('97') || clean.startsWith('98') || clean.startsWith('99')) {
    const isValid = clean.length === 9;
    return {
      operator: 'airtel',
      name: 'Airtel Money RDC',
      formattedPhone: clean,
      rawDigits: clean,
      isValid,
      color: '#EF4444',
      badgeBg: 'bg-red-50',
      badgeText: 'text-red-700',
      badgeBorder: 'border-red-200',
    };
  }

  // Détection Orange : 080, 084, 085, 089 (ou sans le 0)
  if (
    clean.startsWith('080') ||
    clean.startsWith('084') ||
    clean.startsWith('085') ||
    clean.startsWith('089')
  ) {
    const isValid = clean.length === 10;
    return {
      operator: 'orange',
      name: 'Orange Money RDC',
      formattedPhone: clean,
      rawDigits: clean,
      isValid,
      color: '#F97316',
      badgeBg: 'bg-orange-50',
      badgeText: 'text-orange-700',
      badgeBorder: 'border-orange-200',
    };
  }
  if (
    clean.startsWith('80') ||
    clean.startsWith('84') ||
    clean.startsWith('85') ||
    clean.startsWith('89')
  ) {
    const withZero = '0' + clean;
    const isValid = withZero.length === 10;
    return {
      operator: 'orange',
      name: 'Orange Money RDC',
      formattedPhone: withZero,
      rawDigits: clean,
      isValid,
      color: '#F97316',
      badgeBg: 'bg-orange-50',
      badgeText: 'text-orange-700',
      badgeBorder: 'border-orange-200',
    };
  }

  // Détection Vodacom M-Pesa : 081, 082, 083 (ou 81, 82, 83)
  if (clean.startsWith('081') || clean.startsWith('082') || clean.startsWith('083')) {
    const isValid = clean.length === 10;
    return {
      operator: 'vodacom',
      name: 'Vodacom M-Pesa',
      formattedPhone: clean,
      rawDigits: clean,
      isValid,
      color: '#16A34A',
      badgeBg: 'bg-emerald-50',
      badgeText: 'text-emerald-700',
      badgeBorder: 'border-emerald-200',
    };
  }
  if (clean.startsWith('81') || clean.startsWith('82') || clean.startsWith('83')) {
    const withZero = '0' + clean;
    const isValid = withZero.length === 10;
    return {
      operator: 'vodacom',
      name: 'Vodacom M-Pesa',
      formattedPhone: withZero,
      rawDigits: clean,
      isValid,
      color: '#16A34A',
      badgeBg: 'bg-emerald-50',
      badgeText: 'text-emerald-700',
      badgeBorder: 'border-emerald-200',
    };
  }

  // Détection Africell : 090 ou 90
  if (clean.startsWith('090') || clean.startsWith('90')) {
    const phone = clean.startsWith('0') ? clean : '0' + clean;
    const isValid = phone.length === 10;
    return {
      operator: 'africell',
      name: 'Africell Money',
      formattedPhone: phone,
      rawDigits: clean,
      isValid,
      color: '#9333EA',
      badgeBg: 'bg-purple-50',
      badgeText: 'text-purple-700',
      badgeBorder: 'border-purple-200',
    };
  }

  return {
    operator: 'unknown',
    name: 'Opérateur non identifié',
    formattedPhone: clean,
    rawDigits: clean,
    isValid: false,
    color: '#64748B',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-600',
    badgeBorder: 'border-slate-200',
  };
}

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
