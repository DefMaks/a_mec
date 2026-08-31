import { useState, useEffect, useCallback } from 'react';
import {
  MediaItem,
  getSavedMediaLibrary,
  saveMediaItemToLibrary,
  registerUrlImageToLibrary,
  uploadImageToUploadcare,
  getOptimizedAvifUrl,
} from '@/lib/media-library';

export function useMediaLibrary() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    try {
      const allItems = getSavedMediaLibrary();
      setItems(allItems);
    } catch (err: any) {
      setError(err?.message || 'Erreur de chargement de la bibliothèque média.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleUploadFile = async (file: File, titre?: string, categorie?: string): Promise<MediaItem> => {
    setIsUploading(true);
    setError(null);
    setUploadProgress(20);
    try {
      setUploadProgress(50);
      const mediaItem = await uploadImageToUploadcare(file, titre, categorie);
      setUploadProgress(100);
      refresh();
      return mediaItem;
    } catch (err: any) {
      const msg = err?.message || 'Échec du téléversement vers Uploadcare.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRegisterUrl = (url: string, titre?: string, categorie?: string): MediaItem => {
    setError(null);
    try {
      const item = registerUrlImageToLibrary(url, titre, categorie);
      refresh();
      return item;
    } catch (err: any) {
      const msg = err?.message || "Échec de l'enregistrement de l'URL.";
      setError(msg);
      throw new Error(msg);
    }
  };

  return {
    items,
    isLoading,
    isUploading,
    uploadProgress,
    error,
    refresh,
    uploadFile: handleUploadFile,
    registerUrl: handleRegisterUrl,
    getOptimizedAvifUrl,
  };
}
