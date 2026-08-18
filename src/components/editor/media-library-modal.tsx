'use client';

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Link as LinkIcon,
  Image as ImageIcon,
  FolderOpen,
  Search,
  Check,
  X,
  Sparkles,
  AlertCircle,
  Clock,
  Layers,
  FileImage,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { useMediaLibrary } from '@/hooks/use-media-library';
import { MediaItem, getOptimizedAvifUrl } from '@/lib/media-library';

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageUrl: string, altText?: string, title?: string) => void;
}

export function MediaLibraryModal({ isOpen, onClose, onSelectImage }: MediaLibraryModalProps) {
  const { items, isUploading, uploadProgress, error: libraryError, uploadFile, registerUrl } = useMediaLibrary();

  const [activeTab, setActiveTab] = useState<'library' | 'upload' | 'url'>('library');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);

  // Upload Form State
  const [uploadFileObj, setUploadFileObj] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Documents & Cours');
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // URL Form State
  const [inputUrl, setInputUrl] = useState('');
  const [urlTitle, setUrlTitle] = useState('');
  const [urlCategory, setUrlCategory] = useState('Ressources Web');
  const [urlPreviewError, setUrlPreviewError] = useState(false);

  if (!isOpen) return null;

  // Categories list
  const categories = Array.from(
    new Set(items.map((i) => i.categorie || 'Général').filter(Boolean))
  );

  // Filtered library items
  const filteredItems = items.filter((item) => {
    const matchSearch =
      item.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.categorie || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = selectedCategory === 'ALL' || item.categorie === selectedCategory;
    return matchSearch && matchCategory;
  });

  // Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalError(null);
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setLocalError('Veuillez sélectionner un fichier image valide (JPG, PNG, WebP, SVG, AVIF).');
        return;
      }
      setUploadFileObj(file);
      setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
      const objectUrl = URL.createObjectURL(file);
      setUploadPreview(objectUrl);
    }
  };

  // Perform Upload
  const handlePerformUpload = async () => {
    if (!uploadFileObj) {
      setLocalError('Veuillez choisir une image à téléverser.');
      return;
    }
    setLocalError(null);
    try {
      const mediaItem = await uploadFile(uploadFileObj, uploadTitle, uploadCategory);
      // Auto select and insert
      onSelectImage(mediaItem.avif_url || mediaItem.url, mediaItem.titre, mediaItem.titre);
      onClose();
    } catch (err: any) {
      setLocalError(err?.message || 'Erreur lors du téléversement de l’image.');
    }
  };

  // Perform URL Insertion and Save to Library
  const handlePerformUrlInsert = () => {
    if (!inputUrl.trim()) {
      setLocalError('Veuillez renseigner une URL d’image valide.');
      return;
    }
    try {
      new URL(inputUrl.trim());
    } catch {
      setLocalError('L’adresse URL fournie est invalide.');
      return;
    }

    setLocalError(null);
    try {
      // Register in library & get AVIF optimized link
      const registered = registerUrl(inputUrl.trim(), urlTitle.trim() || undefined, urlCategory);
      onSelectImage(registered.avif_url || registered.url, registered.titre, registered.titre);
      onClose();
    } catch (err: any) {
      setLocalError(err?.message || 'Erreur lors de l’enregistrement de l’URL.');
    }
  };

  // Select item from library
  const handleConfirmLibrarySelect = (item: MediaItem) => {
    const finalUrl = item.avif_url || item.url;
    onSelectImage(finalUrl, item.titre, item.titre);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#0F2C59]/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl max-w-4xl w-full h-[85vh] shadow-2xl border border-[#E2E8F0] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#F1F5F9] flex items-center justify-between bg-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F2C59] text-[#D4AF37] flex items-center justify-center font-bold shadow-xs">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-extrabold text-[#0F2C59]">
                  Médiathèque & Insertion d'Images
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]/40 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#15803D]" />
                  Optimisation AVIF Active
                </span>
              </div>
              <p className="text-[11px] text-[#64748B]">
                Téléversez via Uploadcare, importez depuis une URL ou explorez la bibliothèque pédagogique.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#94A3B8] hover:text-[#0F2C59] hover:bg-[#F1F5F9] rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-[#F1F5F9] bg-[#F8FAFC] flex-shrink-0">
          <button
            onClick={() => {
              setActiveTab('library');
              setLocalError(null);
            }}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition flex items-center gap-2 border-b-2 ${
              activeTab === 'library'
                ? 'bg-white text-[#0F2C59] border-[#0F2C59] shadow-xs'
                : 'text-[#64748B] hover:text-[#0F2C59] border-transparent'
            }`}
          >
            <FolderOpen className="w-4 h-4 text-[#D4AF37]" />
            <span>Bibliothèque Dédiée ({items.length})</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('upload');
              setLocalError(null);
            }}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition flex items-center gap-2 border-b-2 ${
              activeTab === 'upload'
                ? 'bg-white text-[#0F2C59] border-[#0F2C59] shadow-xs'
                : 'text-[#64748B] hover:text-[#0F2C59] border-transparent'
            }`}
          >
            <UploadCloud className="w-4 h-4 text-[#008080]" />
            <span>Téléverser (Uploadcare)</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('url');
              setLocalError(null);
            }}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition flex items-center gap-2 border-b-2 ${
              activeTab === 'url'
                ? 'bg-white text-[#0F2C59] border-[#0F2C59] shadow-xs'
                : 'text-[#64748B] hover:text-[#0F2C59] border-transparent'
            }`}
          >
            <LinkIcon className="w-4 h-4 text-[#7E22CE]" />
            <span>Depuis une URL</span>
          </button>
        </div>

        {/* Global Error Banner */}
        {(localError || libraryError) && (
          <div className="mx-5 mt-3 p-3 bg-[#FEE2E2] border border-[#FECACA] rounded-xl text-[#B91C1C] text-xs flex items-center gap-2 flex-shrink-0">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{localError || libraryError}</span>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* TAB 1: LIBRARY */}
          {activeTab === 'library' && (
            <div className="space-y-4">
              {/* Search & Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Rechercher une image, un diagramme ou une catégorie..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl pl-9 pr-3 py-2 text-xs text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/30"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/30"
                >
                  <option value="ALL">Toutes les catégories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Grid of Images */}
              {filteredItems.length === 0 ? (
                <div className="p-12 text-center text-xs text-[#64748B] bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] space-y-2">
                  <FileImage className="w-8 h-8 text-[#94A3B8] mx-auto" />
                  <p className="font-semibold text-[#0F2C59]">Aucune image correspondante</p>
                  <p>Téléversez une image ou renseignez une URL pour l'ajouter à la bibliothèque.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                  {filteredItems.map((item) => {
                    const isSelected = selectedItem?.id === item.id;
                    const displaySrc = item.avif_url || item.url;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className={`group relative rounded-xl border overflow-hidden cursor-pointer transition-all flex flex-col bg-white ${
                          isSelected
                            ? 'border-[#0F2C59] ring-2 ring-[#D4AF37]/50 shadow-md'
                            : 'border-[#E2E8F0] hover:border-[#CBD5E1] hover:shadow-xs'
                        }`}
                      >
                        {/* Image Preview Container */}
                        <div className="relative aspect-4/3 bg-[#F1F5F9] overflow-hidden flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={displaySrc}
                            alt={item.titre}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                            loading="lazy"
                          />
                          <span className="absolute top-1.5 right-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-[#0F2C59]/80 text-white backdrop-blur-xs">
                            AVIF
                          </span>
                          {isSelected && (
                            <div className="absolute inset-0 bg-[#0F2C59]/30 flex items-center justify-center">
                              <div className="w-8 h-8 rounded-full bg-[#0F2C59] text-[#D4AF37] flex items-center justify-center shadow-md">
                                <Check className="w-5 h-5" />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="p-2.5 flex-1 flex flex-col justify-between space-y-1">
                          <p className="text-[11px] font-bold text-[#0F2C59] line-clamp-1 leading-snug">
                            {item.titre}
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-[#64748B]">
                            <span className="truncate max-w-[80px] bg-[#F1F5F9] px-1.5 py-0.5 rounded">
                              {item.categorie || 'Général'}
                            </span>
                            {item.taille && <span className="font-tabular">{item.taille}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: UPLOAD (Uploadcare) */}
          {activeTab === 'upload' && (
            <div className="max-w-xl mx-auto space-y-5 py-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#CBD5E1] hover:border-[#0F2C59] rounded-2xl p-8 text-center cursor-pointer bg-[#F8FAFC] transition space-y-3"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-14 h-14 rounded-2xl bg-[#0F2C59]/10 text-[#0F2C59] flex items-center justify-center mx-auto">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0F2C59]">
                    Cliquez ou glissez une image pour la téléverser
                  </p>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    Formats acceptés : PNG, JPG, WebP, SVG, AVIF (Optimisation automatique en AVIF léger)
                  </p>
                </div>
              </div>

              {/* Upload Preview & Metadata */}
              {uploadPreview && (
                <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl space-y-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-lg bg-[#F1F5F9] overflow-hidden flex-shrink-0 border border-[#E2E8F0]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={uploadPreview}
                        alt="Aperçu"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-[11px] font-bold text-[#0F2C59]">
                        Titre de l'image / Diagramme *
                      </label>
                      <input
                        type="text"
                        value={uploadTitle}
                        onChange={(e) => setUploadTitle(e.target.value)}
                        placeholder="Ex: Schéma du cycle de Krebs"
                        className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg px-3 py-1.5 text-xs text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#0F2C59] mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#0F2C59] mb-1">
                      Catégorie pédagogique
                    </label>
                    <input
                      type="text"
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value)}
                      placeholder="Ex: Sciences Naturelles, Géométrie, RDC"
                      className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg px-3 py-1.5 text-xs text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#0F2C59]"
                    />
                  </div>
                </div>
              )}

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-2 bg-[#FFFBEB] p-4 rounded-xl border border-[#D4AF37]/30">
                  <div className="flex items-center justify-between text-xs font-bold text-[#0F2C59]">
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#D4AF37]" />
                      Téléversement et conversion AVIF en cours...
                    </span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#0F2C59] h-full rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: URL INSERTION */}
          {activeTab === 'url' && (
            <div className="max-w-xl mx-auto space-y-4 py-4">
              <div className="bg-[#EFF6FF] border border-[#BFDBFE] p-4 rounded-xl text-xs text-[#1E40AF] space-y-1">
                <strong className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#2563EB]" />
                  Enregistrement automatique en bibliothèque
                </strong>
                <p className="text-[11px] text-[#1E3A8A]">
                  Toute image insérée via une URL est automatiquement répertoriée dans votre bibliothèque dédiée et délivrée au format <strong>AVIF ultraléger</strong>.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F2C59] mb-1">
                  Adresse Web de l'image (URL) *
                </label>
                <div className="relative">
                  <LinkIcon className="w-4 h-4 text-[#94A3B8] absolute left-3 top-2.5" />
                  <input
                    type="url"
                    placeholder="https://exemple.com/images/schema-rdc.jpg"
                    value={inputUrl}
                    onChange={(e) => {
                      setInputUrl(e.target.value);
                      setUrlPreviewError(false);
                    }}
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl pl-9 pr-3 py-2 text-xs text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0F2C59] mb-1">
                    Titre descriptif de l'image (Optionnel)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Coupe géologique du graben"
                    value={urlTitle}
                    onChange={(e) => setUrlTitle(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0F2C59] mb-1">
                    Catégorie
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Géologie & Minéralogie"
                    value={urlCategory}
                    onChange={(e) => setUrlCategory(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/30"
                  />
                </div>
              </div>

              {/* URL Preview */}
              {inputUrl.trim() && (
                <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl space-y-2">
                  <span className="text-[11px] font-bold text-[#0F2C59] block">
                    Aperçu de l'image :
                  </span>
                  <div className="aspect-16/9 max-h-48 bg-[#F8FAFC] rounded-lg overflow-hidden flex items-center justify-center border border-[#E2E8F0]">
                    {!urlPreviewError ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={getOptimizedAvifUrl(inputUrl.trim())}
                        alt="Aperçu URL"
                        onError={() => setUrlPreviewError(true)}
                        className="max-h-full object-contain"
                      />
                    ) : (
                      <p className="text-xs text-[#EF4444] font-medium">
                        Impossible de charger l'aperçu depuis cette URL.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#F1F5F9] bg-[#F8FAFC] flex items-center justify-between flex-shrink-0">
          <div className="text-xs text-[#64748B]">
            {activeTab === 'library' && selectedItem && (
              <span className="font-medium text-[#0F2C59] flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                Sélectionné : <strong>{selectedItem.titre}</strong>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:text-[#0F2C59] transition"
            >
              Annuler
            </button>

            {activeTab === 'library' && (
              <button
                type="button"
                disabled={!selectedItem}
                onClick={() => selectedItem && handleConfirmLibrarySelect(selectedItem)}
                className="px-5 py-2.5 bg-[#0F2C59] hover:bg-[#0F2C59]/90 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2"
              >
                <Check className="w-4 h-4 text-[#D4AF37]" />
                <span>Insérer l'image sélectionnée</span>
              </button>
            )}

            {activeTab === 'upload' && (
              <button
                type="button"
                disabled={!uploadFileObj || isUploading}
                onClick={handlePerformUpload}
                className="px-5 py-2.5 bg-[#0F2C59] hover:bg-[#0F2C59]/90 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2"
              >
                <UploadCloud className="w-4 h-4 text-[#D4AF37]" />
                <span>{isUploading ? 'Téléversement...' : 'Téléverser & Insérer'}</span>
              </button>
            )}

            {activeTab === 'url' && (
              <button
                type="button"
                disabled={!inputUrl.trim()}
                onClick={handlePerformUrlInsert}
                className="px-5 py-2.5 bg-[#0F2C59] hover:bg-[#0F2C59]/90 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2"
              >
                <LinkIcon className="w-4 h-4 text-[#D4AF37]" />
                <span>Enregistrer & Insérer</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
