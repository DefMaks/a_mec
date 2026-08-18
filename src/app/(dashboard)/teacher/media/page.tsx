'use client';

import React, { useState, useRef } from 'react';
import { useMediaLibrary } from '@/hooks/use-media-library';
import { MediaItem, getOptimizedAvifUrl } from '@/lib/media-library';
import {
  Image as ImageIcon,
  UploadCloud,
  Link as LinkIcon,
  Search,
  Sparkles,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Layers,
  FileImage,
  RefreshCw,
  X,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';

export default function TeacherMediaLibraryPage() {
  const { items, isLoading, isUploading, uploadProgress, error, uploadFile, registerUrl } = useMediaLibrary();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [activeModal, setActiveModal] = useState<'upload' | 'url' | null>(null);
  const [selectedZoomItem, setSelectedZoomItem] = useState<MediaItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Upload Form
  const [uploadFileObj, setUploadFileObj] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Sciences & STEM');
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // URL Form
  const [inputUrl, setInputUrl] = useState('');
  const [urlTitle, setUrlTitle] = useState('');
  const [urlCategory, setUrlCategory] = useState('Ressources RDC');

  const categories = Array.from(new Set(items.map((i) => i.categorie || 'Général').filter(Boolean)));

  const filteredItems = items.filter((item) => {
    const matchSearch =
      item.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.categorie || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = selectedCategory === 'ALL' || item.categorie === selectedCategory;
    return matchSearch && matchCategory;
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormError(null);
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setFormError('Veuillez sélectionner un fichier image (JPG, PNG, WebP, SVG, AVIF).');
        return;
      }
      setUploadFileObj(file);
      setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
      setUploadPreview(URL.createObjectURL(file));
    }
  };

  const handleExecuteUpload = async () => {
    if (!uploadFileObj) {
      setFormError('Veuillez choisir une image.');
      return;
    }
    setFormError(null);
    try {
      await uploadFile(uploadFileObj, uploadTitle, uploadCategory);
      setActiveModal(null);
      setUploadFileObj(null);
      setUploadPreview(null);
    } catch (err: any) {
      setFormError(err?.message || 'Erreur lors du téléversement.');
    }
  };

  const handleExecuteUrlRegister = () => {
    if (!inputUrl.trim()) {
      setFormError('Veuillez saisir une URL valide.');
      return;
    }
    setFormError(null);
    try {
      registerUrl(inputUrl.trim(), urlTitle.trim() || undefined, urlCategory);
      setActiveModal(null);
      setInputUrl('');
      setUrlTitle('');
    } catch (err: any) {
      setFormError(err?.message || 'Erreur lors de l’enregistrement de l’URL.');
    }
  };

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#0F2C59] bg-[#EFF6FF] px-2.5 py-0.5 rounded-md uppercase tracking-wider border border-[#0F2C59]/20 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#D4AF37]" />
              Médiathèque Pédagogique
            </span>
            <span className="text-[10px] font-bold text-[#15803D] bg-[#DCFCE7] px-2 py-0.5 rounded-md">
              Optimisation AVIF Permanente
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#0F2C59] mt-1.5">
            Bibliothèque d'Images & Schémas Pédagogiques
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5 max-w-2xl">
            Gérez l'ensemble des diagrammes, cartes de la RDC, figures géométriques et illustrations pour vos leçons et quiz TipTap.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-center">
          <button
            onClick={() => {
              setActiveModal('url');
              setFormError(null);
            }}
            className="px-4 py-2 bg-white text-[#0F2C59] border border-[#CBD5E1] hover:bg-[#F8FAFC] rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-2"
          >
            <LinkIcon className="w-4 h-4 text-[#7E22CE]" />
            <span>Importer par URL</span>
          </button>
          <button
            onClick={() => {
              setActiveModal('upload');
              setFormError(null);
            }}
            className="px-4 py-2 bg-[#0F2C59] hover:bg-[#0F2C59]/90 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-2"
          >
            <UploadCloud className="w-4 h-4 text-[#D4AF37]" />
            <span>Téléverser (Uploadcare)</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Rechercher une illustration, une discipline (SVT, Maths, Géographie...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl pl-9 pr-3 py-2 text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/30"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full sm:w-auto bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/30"
        >
          <option value="ALL">Toutes les catégories ({items.length})</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Media Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-[#64748B] bg-white rounded-2xl border border-[#E2E8F0] text-xs">
          Chargement de la bibliothèque...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center text-[#64748B] bg-white rounded-2xl border border-[#E2E8F0] text-xs space-y-2">
          <FileImage className="w-8 h-8 text-[#94A3B8] mx-auto" />
          <p className="font-bold text-[#0F2C59]">Aucune image trouvée</p>
          <p>Téléversez une image ou ajoutez une URL pour enrichir votre médiathèque.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) => {
            const displayUrl = item.avif_url || item.url;
            const isCopied = copiedId === item.id;
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
              >
                {/* Image Box */}
                <div
                  onClick={() => setSelectedZoomItem(item)}
                  className="relative aspect-4/3 bg-[#F1F5F9] cursor-zoom-in overflow-hidden"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={displayUrl}
                    alt={item.titre}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-2 right-2 flex items-center gap-1">
                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md bg-[#0F2C59]/85 text-white backdrop-blur-xs">
                      AVIF
                    </span>
                  </div>
                  <div className="absolute top-2 left-2">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-white/90 text-[#0F2C59] backdrop-blur-xs border border-[#E2E8F0]">
                      {item.source === 'uploadcare'
                        ? 'Uploadcare'
                        : item.source === 'preset'
                        ? 'RDC Prédéfini'
                        : 'Web URL'}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider">
                      {item.categorie || 'Général'}
                    </span>
                    <h3 className="text-xs font-bold text-[#0F2C59] mt-0.5 line-clamp-2 leading-snug">
                      {item.titre}
                    </h3>
                  </div>

                  <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between">
                    <button
                      onClick={() => handleCopyUrl(displayUrl, item.id)}
                      className="text-[11px] font-semibold text-[#0F2C59] hover:text-[#D4AF37] flex items-center gap-1 transition"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                          <span className="text-[#16A34A]">Lien AVIF copié !</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copier URL AVIF</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setSelectedZoomItem(item)}
                      className="text-[11px] font-bold text-[#64748B] hover:text-[#0F2C59]"
                    >
                      Aperçu
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Uploadcare Direct Upload */}
      {activeModal === 'upload' && (
        <div className="fixed inset-0 bg-[#0F2C59]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <h3 className="text-sm font-bold text-[#0F2C59] flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-[#D4AF37]" />
                Téléverser via Uploadcare (AVIF)
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-[#94A3B8] hover:text-[#0F2C59]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-[#FEE2E2] text-[#B91C1C] rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{formError}</span>
              </div>
            )}

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#CBD5E1] hover:border-[#0F2C59] rounded-xl p-6 text-center cursor-pointer bg-[#F8FAFC] transition space-y-2"
            >
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <UploadCloud className="w-8 h-8 text-[#0F2C59] mx-auto" />
              <p className="text-xs font-bold text-[#0F2C59]">Cliquez pour sélectionner une image</p>
              <p className="text-[10px] text-[#64748B]">PNG, JPG, WebP, SVG, AVIF</p>
            </div>

            {uploadPreview && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-lg bg-[#F1F5F9] overflow-hidden flex-shrink-0 border border-[#E2E8F0]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={uploadPreview} alt="Aperçu" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="block text-[11px] font-bold text-[#0F2C59]">Titre de l'image *</label>
                    <input
                      type="text"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg px-3 py-1.5 text-xs text-[#1E293B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#0F2C59] mb-1">Catégorie</label>
                  <input
                    type="text"
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg px-3 py-1.5 text-xs text-[#1E293B]"
                  />
                </div>
              </div>
            )}

            {isUploading && (
              <div className="space-y-1.5 bg-[#FFFBEB] p-3 rounded-xl border border-[#D4AF37]/30">
                <div className="flex items-center justify-between text-xs font-bold text-[#0F2C59]">
                  <span className="flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#D4AF37]" />
                    Optimisation AVIF en cours...
                  </span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-[#E2E8F0] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#0F2C59] h-full rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-[#F1F5F9]">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 text-xs font-bold text-[#64748B]"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={!uploadFileObj || isUploading}
                onClick={handleExecuteUpload}
                className="px-4 py-2 bg-[#0F2C59] text-white text-xs font-bold rounded-xl shadow-xs disabled:opacity-40"
              >
                {isUploading ? 'Téléversement...' : 'Confirmer le téléversement'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: URL Register */}
      {activeModal === 'url' && (
        <div className="fixed inset-0 bg-[#0F2C59]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <h3 className="text-sm font-bold text-[#0F2C59] flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-[#7E22CE]" />
                Enregistrer une image depuis une URL
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-[#94A3B8] hover:text-[#0F2C59]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-[#FEE2E2] text-[#B91C1C] rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{formError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#0F2C59] mb-1">
                URL de l'image *
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2 text-xs text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F2C59] mb-1">
                Titre descriptif
              </label>
              <input
                type="text"
                placeholder="Ex: Carte du relief du bassin du Congo"
                value={urlTitle}
                onChange={(e) => setUrlTitle(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2 text-xs text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F2C59] mb-1">
                Catégorie
              </label>
              <input
                type="text"
                placeholder="Ex: Géographie RDC"
                value={urlCategory}
                onChange={(e) => setUrlCategory(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2 text-xs text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/30"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#F1F5F9]">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 text-xs font-bold text-[#64748B]"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={!inputUrl.trim()}
                onClick={handleExecuteUrlRegister}
                className="px-4 py-2 bg-[#0F2C59] text-white text-xs font-bold rounded-xl shadow-xs disabled:opacity-40"
              >
                Enregistrer dans la médiathèque
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Full Zoom */}
      {selectedZoomItem && (
        <div
          onClick={() => setSelectedZoomItem(null)}
          className="fixed inset-0 bg-[#0F2C59]/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] bg-white p-5 rounded-2xl shadow-2xl border border-[#E2E8F0] flex flex-col items-center space-y-3"
          >
            <button
              onClick={() => setSelectedZoomItem(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-[#0F2C59] text-white hover:bg-black transition"
            >
              <X className="w-4 h-4" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedZoomItem.avif_url || selectedZoomItem.url}
              alt={selectedZoomItem.titre}
              className="max-h-[75vh] max-w-full rounded-xl object-contain"
            />
            <div className="text-center">
              <h3 className="text-sm font-bold text-[#0F2C59]">{selectedZoomItem.titre}</h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                {selectedZoomItem.categorie} • Format AVIF haute définition
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
