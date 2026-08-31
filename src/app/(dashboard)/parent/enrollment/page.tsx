'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  UserPlus,
  Sparkles,
  CheckCircle2,
  Clock,
  FileText,
  UploadCloud,
  CreditCard,
  Building2,
  Calendar,
  Phone,
  Mail,
  User,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  AlertCircle,
  HelpCircle,
  Download,
  Search,
} from 'lucide-react';
import { APP_NAME, APP_SHORT_NAME } from '@/lib/config';
import { RoleGuard } from '@/components/layout/role-guard';

interface EnrollmentApplication {
  id: string;
  childName: string;
  gender: 'M' | 'F';
  birthDate: string;
  level: string;
  option: string;
  parentName: string;
  parentPhone: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'ACCEPTED' | 'PAYMENT_PENDING' | 'ENROLLED';
  submissionDate: string;
  documentsCount: number;
}

export default function ParentEnrollmentPage() {
  const [activeTab, setActiveTab] = useState<'new_application' | 'my_applications'>('new_application');
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Child info
    nom: '',
    postnom: '',
    prenom: '',
    sexe: 'M',
    dateNaissance: '',
    lieuNaissance: '',
    nationalite: 'Congolaise (RDC)',
    // Step 2: Academic
    cycle: 'humanites',
    classe: '4ème Humanités',
    option: 'Math-Physique (STEM)',
    ecolePrecedente: '',
    pourcentagePrecedent: '',
    // Step 3: Parent/Guardian
    parentNom: 'Mukendi Jean-Pierre',
    parentLien: 'Père',
    parentTel: '+243 81 234 5678',
    parentEmail: 'parent@academiedusalut.cd',
    parentProfession: 'Ingénieur',
    adresseKinshasa: 'Av. de la Paix N° 45, Q. Ma Campagne, C. Ngaliema',
    // Step 4: Documents
    bulletinAttached: true,
    acteNaissanceAttached: true,
    photoAttached: true,
    certificatMedicalAttached: false,
    // Step 5: Payment
    modePaiement: 'mpesa',
    fraisDossierPayes: false,
  });

  // Sample existing applications
  const [applications, setApplications] = useState<EnrollmentApplication[]>([
    {
      id: 'ENR-2026-0012',
      childName: 'Grace Mukendi',
      gender: 'F',
      birthDate: '12/04/2012',
      level: '7ème Éducation de Base',
      option: 'Tronc Commun STEM',
      parentName: 'Mukendi Jean-Pierre',
      parentPhone: '+243 81 234 5678',
      status: 'ACCEPTED',
      submissionDate: '20/08/2026',
      documentsCount: 4,
    },
    {
      id: 'ENR-2026-0045',
      childName: 'David Mukendi',
      gender: 'M',
      birthDate: '05/11/2016',
      level: '3ème Primaire',
      option: 'Cycle Primaire Général',
      parentName: 'Mukendi Jean-Pierre',
      parentPhone: '+243 81 234 5678',
      status: 'UNDER_REVIEW',
      submissionDate: '22/08/2026',
      documentsCount: 3,
    },
  ]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNextStep = () => {
    if (currentStep < 5) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Final Submit
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setSubmitSuccess(true);
        const newApp: EnrollmentApplication = {
          id: `ENR-2026-00${Math.floor(Math.random() * 90) + 10}`,
          childName: `${formData.nom} ${formData.postnom} ${formData.prenom}`.trim() || 'Nouvel Élève',
          gender: formData.sexe as 'M' | 'F',
          birthDate: formData.dateNaissance || '10/05/2014',
          level: formData.classe,
          option: formData.option,
          parentName: formData.parentNom,
          parentPhone: formData.parentTel,
          status: 'UNDER_REVIEW',
          submissionDate: new Date().toLocaleDateString('fr-FR'),
          documentsCount: 3,
        };
        setApplications((prev) => [newApp, ...prev]);
      }, 800);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const getStatusBadge = (status: EnrollmentApplication['status']) => {
    switch (status) {
      case 'ACCEPTED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] border border-[#16A34A]/20">
            <CheckCircle2 className="w-3 h-3" />
            Admis & Validé
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] border border-[#F59E0B]/20">
            <Clock className="w-3 h-3" />
            En examen pédagogique
          </span>
        );
      case 'PAYMENT_PENDING':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#EFF6FF] text-[#1D4ED8] border border-[#3B82F6]/20">
            <CreditCard className="w-3 h-3" />
            Frais en attente
          </span>
        );
      case 'ENROLLED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FAF5FF] text-[#7E22CE] border border-[#9333EA]/20">
            <GraduationCap className="w-3 h-3" />
            Définitivement Inscrit
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#F1F5F9] text-[#475569]">
            Dossier Reçu
          </span>
        );
    }
  };

  return (
    <RoleGuard allowedRoles={['parent', 'super_admin', 'admin']} moduleName="le Portail d'Admission & Inscriptions">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* En-tête Espace Inscription */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-[#EFF6FF] text-[#0F2C59] border border-[#0F2C59]/20 text-[11px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#D4AF37]" />
              {APP_NAME} ({APP_SHORT_NAME})
            </span>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-[#DCFCE7] text-[#15803D] border border-[#16A34A]/30">
              Session d'Admission 2025 - 2026 Ouverte
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0F2C59] tracking-tight">
            Portail d’Admission & Inscriptions en Ligne
          </h1>

          <p className="text-xs md:text-sm text-[#64748B] max-w-2xl">
            Inscrivez un nouvel enfant à l’Académie du Salut, transmettez les pièces requises et suivez l'avancement de votre dossier d'admission en temps réel.
          </p>
        </div>

        {/* Tab Switcher: Nouvelle Inscription vs Mes Candidatures */}
        <div className="flex items-center gap-2 bg-[#F8FAFC] p-1.5 rounded-xl border border-[#E2E8F0] self-start md:self-center">
          <button
            onClick={() => {
              setActiveTab('new_application');
              setSubmitSuccess(false);
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'new_application'
                ? 'bg-[#0F2C59] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#0F2C59]'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Nouvelle Inscription</span>
          </button>
          <button
            onClick={() => setActiveTab('my_applications')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'my_applications'
                ? 'bg-[#0F2C59] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#0F2C59]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Suivi Dossiers ({applications.length})</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VUE 1 : FORMULAIRE D'INSCRIPTION ÉTAPE PAR ÉTAPE (ENROLLMENT WIZARD)       */}
      {/* ========================================================================= */}
      {activeTab === 'new_application' && (
        <div className="space-y-6">
          {submitSuccess ? (
            <div className="bg-white rounded-2xl border border-[#16A34A]/30 p-8 shadow-xs text-center space-y-4 max-w-2xl mx-auto">
              <div className="w-16 h-16 rounded-full bg-[#DCFCE7] text-[#15803D] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-extrabold text-[#0F2C59]">
                Dossier d'Inscription Enregistré avec Succès !
              </h2>
              <p className="text-xs text-[#64748B] leading-relaxed max-w-md mx-auto">
                Votre demande d'admission pour <strong className="text-[#0F2C59]">{formData.nom} {formData.postnom} {formData.prenom}</strong> a bien été transmise à la Direction Pédagogique de l'Académie du Salut.
              </p>
              <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] text-left text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Numéro de Dossier :</span>
                  <span className="font-mono font-bold text-[#0F2C59]">ENR-2026-0089</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Classe Souhaitée :</span>
                  <span className="font-bold text-[#0F2C59]">{formData.classe} - {formData.option}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Statut initial :</span>
                  <span className="font-bold text-[#B45309]">En examen pédagogique</span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setActiveTab('my_applications');
                    setSubmitSuccess(false);
                    setCurrentStep(1);
                  }}
                  className="px-4 py-2.5 bg-[#0F2C59] text-white rounded-xl text-xs font-bold hover:bg-[#0F2C59]/90 transition"
                >
                  Voir mes candidatures
                </button>
                <button
                  onClick={() => {
                    setSubmitSuccess(false);
                    setCurrentStep(1);
                  }}
                  className="px-4 py-2.5 bg-white border border-[#CBD5E1] text-[#0F2C59] rounded-xl text-xs font-bold hover:bg-[#F8FAFC] transition"
                >
                  Inscrire un autre enfant
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
              {/* Stepper Progress Header */}
              <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] p-4 md:p-6">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { num: 1, label: 'Identité Élève' },
                    { num: 2, label: 'Cycle & Option' },
                    { num: 3, label: 'Tuteur Légal' },
                    { num: 4, label: 'Pièces Requis' },
                    { num: 5, label: 'Validation' },
                  ].map((s) => (
                    <button
                      key={s.num}
                      type="button"
                      onClick={() => setCurrentStep(s.num)}
                      className={`flex items-center gap-2 p-2 rounded-xl text-xs font-bold transition text-left ${
                        currentStep === s.num
                          ? 'bg-[#0F2C59] text-white shadow-2xs'
                          : currentStep > s.num
                          ? 'bg-[#DCFCE7] text-[#15803D]'
                          : 'bg-white border border-[#E2E8F0] text-[#64748B]'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-extrabold flex-shrink-0 ${
                          currentStep === s.num
                            ? 'bg-[#D4AF37] text-[#0F2C59]'
                            : currentStep > s.num
                            ? 'bg-[#16A34A] text-white'
                            : 'bg-[#F1F5F9] text-[#64748B]'
                        }`}
                      >
                        {currentStep > s.num ? '✓' : s.num}
                      </span>
                      <span className="truncate">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Content Steps */}
              <div className="p-6 md:p-8 space-y-6">
                {/* STEP 1: Identité de l'élève */}
                {currentStep === 1 && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div>
                      <h3 className="text-base font-bold text-[#0F2C59] flex items-center gap-2">
                        <User className="w-4 h-4 text-[#D4AF37]" />
                        <span>Étape 1 : Identité & État Civil de l'Enfant</span>
                      </h3>
                      <p className="text-xs text-[#64748B] mt-0.5">
                        Renseignez fidèlement les informations figurant sur l'acte de naissance ou le passeport.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                      <div>
                        <label className="block text-xs font-bold text-[#0F2C59] mb-1">Nom *</label>
                        <input
                          type="text"
                          placeholder="Ex: MUKENDI"
                          value={formData.nom}
                          onChange={(e) => handleInputChange('nom', e.target.value)}
                          className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-xs text-[#1E293B] focus:ring-2 focus:ring-[#0F2C59]/20"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#0F2C59] mb-1">Post-nom *</label>
                        <input
                          type="text"
                          placeholder="Ex: KABONGO"
                          value={formData.postnom}
                          onChange={(e) => handleInputChange('postnom', e.target.value)}
                          className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-xs text-[#1E293B] focus:ring-2 focus:ring-[#0F2C59]/20"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#0F2C59] mb-1">Prénom *</label>
                        <input
                          type="text"
                          placeholder="Ex: Emmanuel"
                          value={formData.prenom}
                          onChange={(e) => handleInputChange('prenom', e.target.value)}
                          className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-xs text-[#1E293B] focus:ring-2 focus:ring-[#0F2C59]/20"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#0F2C59] mb-1">Sexe *</label>
                        <select
                          value={formData.sexe}
                          onChange={(e) => handleInputChange('sexe', e.target.value)}
                          className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-xs text-[#1E293B] focus:ring-2 focus:ring-[#0F2C59]/20"
                        >
                          <option value="M">Masculin (M)</option>
                          <option value="F">Féminin (F)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#0F2C59] mb-1">Date de Naissance *</label>
                        <input
                          type="date"
                          value={formData.dateNaissance}
                          onChange={(e) => handleInputChange('dateNaissance', e.target.value)}
                          className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-xs text-[#1E293B] focus:ring-2 focus:ring-[#0F2C59]/20"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#0F2C59] mb-1">Lieu de Naissance *</label>
                        <input
                          type="text"
                          placeholder="Ex: Kinshasa"
                          value={formData.lieuNaissance}
                          onChange={(e) => handleInputChange('lieuNaissance', e.target.value)}
                          className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-xs text-[#1E293B] focus:ring-2 focus:ring-[#0F2C59]/20"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: Cycle & Option */}
                {currentStep === 2 && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div>
                      <h3 className="text-base font-bold text-[#0F2C59] flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-[#D4AF37]" />
                        <span>Étape 2 : Cycle Scolaire & Classe Souhaitée</span>
                      </h3>
                      <p className="text-xs text-[#64748B] mt-0.5">
                        Choisissez le niveau et la filière d'orientation de l'élève à l'Académie du Salut.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block text-xs font-bold text-[#0F2C59] mb-1">Cycle d'Enseignement *</label>
                        <select
                          value={formData.cycle}
                          onChange={(e) => handleInputChange('cycle', e.target.value)}
                          className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-xs text-[#1E293B]"
                        >
                          <option value="primaire">Enseignement Primaire (1ère à 6ème)</option>
                          <option value="eb">Éducation de Base (7ème & 8ème EB)</option>
                          <option value="humanites">Humanités Générales & Techniques (1ère à 4ème HP)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#0F2C59] mb-1">Classe demandée *</label>
                        <select
                          value={formData.classe}
                          onChange={(e) => handleInputChange('classe', e.target.value)}
                          className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-xs text-[#1E293B]"
                        >
                          <option value="1ère Primaire">1ère Primaire</option>
                          <option value="6ème Primaire (TENAFEP)">6ème Primaire (TENAFEP)</option>
                          <option value="7ème Éducation de Base">7ème Éducation de Base</option>
                          <option value="8ème Éducation de Base (ENAFEP)">8ème Éducation de Base (ENAFEP)</option>
                          <option value="1ère Humanités (3e Secondaire)">1ère Humanités</option>
                          <option value="2ème Humanités (4e Secondaire)">2ème Humanités</option>
                          <option value="3ème Humanités (5e Secondaire)">3ème Humanités</option>
                          <option value="4ème Humanités (EXETAT)">4ème Humanités (EXETAT)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#0F2C59] mb-1">Option / Filière (Secondaire) *</label>
                        <select
                          value={formData.option}
                          onChange={(e) => handleInputChange('option', e.target.value)}
                          className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-xs text-[#1E293B]"
                        >
                          <option value="Math-Physique (STEM)">Mathématique - Physique (STEM RDC)</option>
                          <option value="Chimie-Biologie (Sciences)">Chimie - Biologie (Sciences de la vie)</option>
                          <option value="Commerciale & Gestion">Commerciale & Gestion Informatique</option>
                          <option value="Pédagogie Générale">Pédagogie Générale</option>
                          <option value="Littéraire">Littéraire (Latin-Philo)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#0F2C59] mb-1">École de provenance</label>
                        <input
                          type="text"
                          placeholder="Nom de l'ancien établissement"
                          value={formData.ecolePrecedente}
                          onChange={(e) => handleInputChange('ecolePrecedente', e.target.value)}
                          className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-xs text-[#1E293B]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: Parent / Tuteur Légal */}
                {currentStep === 3 && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div>
                      <h3 className="text-base font-bold text-[#0F2C59] flex items-center gap-2">
                        <Phone className="w-4 h-4 text-[#D4AF37]" />
                        <span>Étape 3 : Coordonnées du Responsable Légal / Tuteur</span>
                      </h3>
                      <p className="text-xs text-[#64748B] mt-0.5">
                        Ces coordonnées seront utilisées pour les notifications SMS, les bulletins et les règlements Mobile Money.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block text-xs font-bold text-[#0F2C59] mb-1">Nom complet du Tuteur *</label>
                        <input
                          type="text"
                          value={formData.parentNom}
                          onChange={(e) => handleInputChange('parentNom', e.target.value)}
                          className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-xs text-[#1E293B]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#0F2C59] mb-1">Lien de parenté *</label>
                        <select
                          value={formData.parentLien}
                          onChange={(e) => handleInputChange('parentLien', e.target.value)}
                          className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-xs text-[#1E293B]"
                        >
                          <option value="Père">Père</option>
                          <option value="Mère">Mère</option>
                          <option value="Tuteur Légal">Tuteur Légal / Famille d'accueil</option>
                          <option value="Autre">Autre répondant</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#0F2C59] mb-1">Téléphone WhatsApp / SMS *</label>
                        <input
                          type="tel"
                          value={formData.parentTel}
                          onChange={(e) => handleInputChange('parentTel', e.target.value)}
                          placeholder="+243 ..."
                          className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-xs text-[#1E293B]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#0F2C59] mb-1">Adresse Email</label>
                        <input
                          type="email"
                          value={formData.parentEmail}
                          onChange={(e) => handleInputChange('parentEmail', e.target.value)}
                          placeholder="email@example.com"
                          className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-xs text-[#1E293B]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0F2C59] mb-1">Adresse de Résidence (Kinshasa) *</label>
                      <input
                        type="text"
                        value={formData.adresseKinshasa}
                        onChange={(e) => handleInputChange('adresseKinshasa', e.target.value)}
                        placeholder="N°, Avenue, Quartier, Commune"
                        className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-xs text-[#1E293B]"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 4: Documents Requis */}
                {currentStep === 4 && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div>
                      <h3 className="text-base font-bold text-[#0F2C59] flex items-center gap-2">
                        <UploadCloud className="w-4 h-4 text-[#D4AF37]" />
                        <span>Étape 4 : Pièces du Dossier Scolaire</span>
                      </h3>
                      <p className="text-xs text-[#64748B] mt-0.5">
                        Vous pouvez téléverser les documents scannés ou les déposer physiquement au secrétariat de l'école.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-[#0F2C59]">1. Dernier Bulletin Scolaire</p>
                          <p className="text-[11px] text-[#64748B]">Preuve de passage de classe (PDF ou Photo)</p>
                          <span className="text-[10px] font-bold text-[#15803D] bg-[#DCFCE7] px-2 py-0.5 rounded inline-block mt-1">
                            Document joint (bulletin_2025.pdf)
                          </span>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-[#16A34A] flex-shrink-0" />
                      </div>

                      <div className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-[#0F2C59]">2. Acte de Naissance / Passeport</p>
                          <p className="text-[11px] text-[#64748B]">Preuve d'âge et d'état civil</p>
                          <span className="text-[10px] font-bold text-[#15803D] bg-[#DCFCE7] px-2 py-0.5 rounded inline-block mt-1">
                            Document joint (acte_naissance.pdf)
                          </span>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-[#16A34A] flex-shrink-0" />
                      </div>

                      <div className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-[#0F2C59]">3. Photos Passeport (2)</p>
                          <p className="text-[11px] text-[#64748B]">Pour la carte d'élève et le registre</p>
                          <span className="text-[10px] font-bold text-[#15803D] bg-[#DCFCE7] px-2 py-0.5 rounded inline-block mt-1">
                            Photo transmise (photo_identite.jpg)
                          </span>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-[#16A34A] flex-shrink-0" />
                      </div>

                      <div className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-[#0F2C59]">4. Fiche Médicale / Vaccination</p>
                          <p className="text-[11px] text-[#64748B]">Antécédents d'allergies ou carnet médical</p>
                          <span className="text-[10px] font-semibold text-[#64748B] bg-[#E2E8F0] px-2 py-0.5 rounded inline-block mt-1">
                            À déposer à la rentrée
                          </span>
                        </div>
                        <Clock className="w-5 h-5 text-[#64748B] flex-shrink-0" />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 5: Validation & Frais d'admission */}
                {currentStep === 5 && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div>
                      <h3 className="text-base font-bold text-[#0F2C59] flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-[#D4AF37]" />
                        <span>Étape 5 : Récapitulatif & Frais d'Étude de Dossier</span>
                      </h3>
                      <p className="text-xs text-[#64748B] mt-0.5">
                        Vérifiez le résumé des informations avant de finaliser la soumission.
                      </p>
                    </div>

                    {/* Summary Card */}
                    <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-5 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-[#64748B] block text-[11px]">Élève :</span>
                          <span className="font-extrabold text-[#0F2C59]">
                            {formData.nom || 'MUKENDI'} {formData.postnom || 'KABONGO'} {formData.prenom || 'Emmanuel'} ({formData.sexe})
                          </span>
                        </div>
                        <div>
                          <span className="text-[#64748B] block text-[11px]">Niveau & Option :</span>
                          <span className="font-extrabold text-[#0F2C59]">
                            {formData.classe} • {formData.option}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#64748B] block text-[11px]">Responsable Légal :</span>
                          <span className="font-semibold text-[#1E293B]">
                            {formData.parentNom} ({formData.parentTel})
                          </span>
                        </div>
                        <div>
                          <span className="text-[#64748B] block text-[11px]">Frais de Dossier d'Admission :</span>
                          <span className="font-mono font-bold text-[#0F2C59]">$15.00 USD</span>
                        </div>
                      </div>
                    </div>

                    {/* Mode de règlement */}
                    <div className="space-y-2 pt-2">
                      <label className="block text-xs font-bold text-[#0F2C59]">
                        Règlement des frais de dossier ($15 USD)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <button
                          type="button"
                          onClick={() => handleInputChange('modePaiement', 'mpesa')}
                          className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition ${
                            formData.modePaiement === 'mpesa'
                              ? 'border-[#0F2C59] bg-[#EFF6FF] text-[#0F2C59] font-bold'
                              : 'border-[#E2E8F0] hover:bg-[#F8FAFC]'
                          }`}
                        >
                          <span className="w-7 h-7 rounded-lg bg-[#DC2626] text-white flex items-center justify-center font-bold text-xs">
                            M
                          </span>
                          <div>
                            <p className="text-xs">M-Pesa</p>
                            <p className="text-[10px] text-[#64748B]">Vodacom RDC</p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleInputChange('modePaiement', 'orange')}
                          className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition ${
                            formData.modePaiement === 'orange'
                              ? 'border-[#0F2C59] bg-[#EFF6FF] text-[#0F2C59] font-bold'
                              : 'border-[#E2E8F0] hover:bg-[#F8FAFC]'
                          }`}
                        >
                          <span className="w-7 h-7 rounded-lg bg-[#EA580C] text-white flex items-center justify-center font-bold text-xs">
                            O
                          </span>
                          <div>
                            <p className="text-xs">Orange Money</p>
                            <p className="text-[10px] text-[#64748B]">Orange RDC</p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleInputChange('modePaiement', 'airtel')}
                          className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition ${
                            formData.modePaiement === 'airtel'
                              ? 'border-[#0F2C59] bg-[#EFF6FF] text-[#0F2C59] font-bold'
                              : 'border-[#E2E8F0] hover:bg-[#F8FAFC]'
                          }`}
                        >
                          <span className="w-7 h-7 rounded-lg bg-[#E11D48] text-white flex items-center justify-center font-bold text-xs">
                            A
                          </span>
                          <div>
                            <p className="text-xs">Airtel Money</p>
                            <p className="text-[10px] text-[#64748B]">Airtel RDC</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer Navigation Buttons */}
                <div className="pt-6 border-t border-[#E2E8F0] flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    disabled={currentStep === 1}
                    className="px-4 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-semibold text-[#64748B] hover:text-[#0F2C59] hover:bg-[#F8FAFC] disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center gap-2"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Précédent</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-[#0F2C59] hover:bg-[#0F2C59]/90 text-white text-xs font-bold shadow-xs transition flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <span>Enregistrement en cours...</span>
                    ) : currentStep === 5 ? (
                      <>
                        <span>Confirmer & Soumettre l'Inscription</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                      </>
                    ) : (
                      <>
                        <span>Étape Suivante</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37]" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VUE 2 : MES CANDIDATURES D'INSCRIPTION & ÉTAT DU DOSSIER                  */}
      {/* ========================================================================= */}
      {activeTab === 'my_applications' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {applications.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs hover:border-[#D4AF37]/50 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#0F2C59] bg-[#EFF6FF] px-2 py-0.5 rounded">
                          {app.id}
                        </span>
                        <span className="text-[11px] text-[#64748B]">
                          Soumis le {app.submissionDate}
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold text-[#0F2C59] mt-2">
                        {app.childName}
                      </h3>
                      <p className="text-xs text-[#64748B] mt-0.5">
                        {app.level} • {app.option}
                      </p>
                    </div>

                    <div>{getStatusBadge(app.status)}</div>
                  </div>

                  <div className="mt-4 p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Tuteur Référent :</span>
                      <span className="font-semibold text-[#1E293B]">{app.parentName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Documents joints :</span>
                      <span className="font-bold text-[#15803D]">{app.documentsCount} pièces validées</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Établissement :</span>
                      <span className="font-semibold text-[#0F2C59]">Académie du Salut (Kinshasa)</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => alert(`Fiche d'inscription ${app.id} prête au téléchargement.`)}
                    className="px-3 py-1.5 rounded-lg bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-xs font-semibold text-[#0F2C59] flex items-center gap-1.5 transition"
                  >
                    <Download className="w-3.5 h-3.5 text-[#64748B]" />
                    <span>Fiche PDF</span>
                  </button>

                  <Link
                    href="/parent/payments"
                    className="px-3.5 py-1.5 rounded-lg bg-[#0F2C59] hover:bg-[#0F2C59]/90 text-white text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Payer Frais Scolaires</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </RoleGuard>
  );
}
