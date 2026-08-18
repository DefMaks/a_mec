import { uploadFile } from '@uploadcare/upload-client';

export const UPLOADCARE_PUBLIC_KEY = 'a6bc9ef39cdcb72c8465';

export interface MediaItem {
  id: string;
  titre: string;
  url: string;
  avif_url: string;
  source: 'uploadcare' | 'url' | 'preset';
  categorie?: string;
  taille?: string;
  dimensions?: { width: number; height: number };
  created_at: string;
}

/**
 * Transforms an image URL to load optimized AVIF format.
 * If the URL is hosted on Uploadcare CDN, it appends Uploadcare's AVIF image transformations.
 */
export function getOptimizedAvifUrl(originalUrl: string, maxWidth?: number): string {
  if (!originalUrl || typeof originalUrl !== 'string') return '';

  const trimmed = originalUrl.trim();

  // If already an uploadcare cdn URL
  if (trimmed.includes('ucarecdn.com')) {
    // Remove existing trailing operations if any to standardize
    const baseUrl = trimmed.split('/-/')[0].replace(/\/+$/, '');
    const resizePart = maxWidth ? `-/resize/${maxWidth}x/` : '';
    return `${baseUrl}/${resizePart}-/format/avif/-/quality/smart/`;
  }

  // If external URL that supports AVIF or general image
  // For Unsplash or generic image services
  if (trimmed.includes('images.unsplash.com')) {
    const urlObj = new URL(trimmed);
    urlObj.searchParams.set('fm', 'avif');
    urlObj.searchParams.set('auto', 'format');
    urlObj.searchParams.set('q', '80');
    if (maxWidth) urlObj.searchParams.set('w', maxWidth.toString());
    return urlObj.toString();
  }

  // Return original as safe fallback
  return trimmed;
}

// Pre-seeded pedagogical diagrams & illustrations for RDC curricula
export const DEFAULT_PRESET_IMAGES: MediaItem[] = [
  {
    id: 'preset-carte-rdc',
    titre: 'Carte Administrative & Hydrographique de la RDC',
    url: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1000&q=80',
    avif_url: getOptimizedAvifUrl('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1000&q=80', 1000),
    source: 'preset',
    categorie: 'Géographie & Histoire RDC',
    created_at: new Date('2026-01-01').toISOString(),
  },
  {
    id: 'preset-coeur-anatomie',
    titre: 'Schéma Anatomique : Appareil Circulatoire & Cœur Humain',
    url: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=1000&q=80',
    avif_url: getOptimizedAvifUrl('https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=1000&q=80', 1000),
    source: 'preset',
    categorie: 'Sciences & Biologie (SVT)',
    created_at: new Date('2026-01-02').toISOString(),
  },
  {
    id: 'preset-maths-courbe',
    titre: 'Représentation Graphique de Fonctions & Tangentes (EXETAT)',
    url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1000&q=80',
    avif_url: getOptimizedAvifUrl('https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1000&q=80', 1000),
    source: 'preset',
    categorie: 'Mathématiques & Analyse',
    created_at: new Date('2026-01-03').toISOString(),
  },
  {
    id: 'preset-physique-atome',
    titre: 'Structure Atomique & Liaisons Électroniques',
    url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1000&q=80',
    avif_url: getOptimizedAvifUrl('https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1000&q=80', 1000),
    source: 'preset',
    categorie: 'Physique-Chimie',
    created_at: new Date('2026-01-04').toISOString(),
  },
  {
    id: 'preset-optique-lentille',
    titre: 'Diagramme Optique : Réfraction & Foyers de Lentilles',
    url: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1000&q=80',
    avif_url: getOptimizedAvifUrl('https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1000&q=80', 1000),
    source: 'preset',
    categorie: 'Physique-Chimie',
    created_at: new Date('2026-01-05').toISOString(),
  },
];

const LOCAL_STORAGE_KEY = 'ads_e_rdc_media_library_v1';

/**
 * Retrieves all media library items from localStorage merged with presets.
 */
export function getSavedMediaLibrary(): MediaItem[] {
  if (typeof window === 'undefined') return DEFAULT_PRESET_IMAGES;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return DEFAULT_PRESET_IMAGES;
    const userItems: MediaItem[] = JSON.parse(raw);
    // Combine user items with presets (prevent duplicate IDs)
    const presetIds = new Set(DEFAULT_PRESET_IMAGES.map((p) => p.id));
    const customOnly = userItems.filter((item) => !presetIds.has(item.id));
    return [...customOnly, ...DEFAULT_PRESET_IMAGES];
  } catch (err) {
    console.warn('Error reading media library from localStorage:', err);
    return DEFAULT_PRESET_IMAGES;
  }
}

/**
 * Saves a new media item to the library.
 */
export function saveMediaItemToLibrary(item: Omit<MediaItem, 'id' | 'created_at'> & { id?: string }): MediaItem {
  const newItem: MediaItem = {
    ...item,
    id: item.id || `media-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    created_at: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    try {
      const current = getSavedMediaLibrary();
      // Prepend the new item
      const updated = [newItem, ...current.filter((c) => c.id !== newItem.id)];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('Error writing media item to localStorage:', err);
    }
  }

  return newItem;
}

/**
 * Registers an external URL image into the media library with AVIF optimization.
 */
export function registerUrlImageToLibrary(url: string, titre?: string, categorie = 'Images Externes'): MediaItem {
  const cleanUrl = url.trim();
  const avif = getOptimizedAvifUrl(cleanUrl);
  const cleanTitle = titre?.trim() || `Image importée (${new Date().toLocaleDateString('fr-FR')})`;

  return saveMediaItemToLibrary({
    titre: cleanTitle,
    url: cleanUrl,
    avif_url: avif,
    source: 'url',
    categorie,
  });
}

/**
 * Uploads a file directly to Uploadcare and saves it to the media library.
 */
export async function uploadImageToUploadcare(
  file: File,
  titre?: string,
  categorie = 'Téléversements Professeur'
): Promise<MediaItem> {
  const result = await uploadFile(file, {
    publicKey: UPLOADCARE_PUBLIC_KEY,
    store: 'auto',
    metadata: {
      app: 'a_mec_e_rdc',
      uploader: 'teacher_quiz_lesson',
    },
  });

  const cdnUrl = result.cdnUrl || `https://ucarecdn.com/${result.uuid}/`;
  const avifUrl = `${cdnUrl.replace(/\/+$/, '')}/-/format/avif/-/quality/smart/`;
  const cleanTitle = titre?.trim() || file.name || `Image Uploadcare ${new Date().toLocaleTimeString('fr-FR')}`;

  const mediaItem = saveMediaItemToLibrary({
    titre: cleanTitle,
    url: cdnUrl,
    avif_url: avifUrl,
    source: 'uploadcare',
    categorie,
    taille: `${(file.size / 1024).toFixed(1)} Ko`,
  });

  return mediaItem;
}
