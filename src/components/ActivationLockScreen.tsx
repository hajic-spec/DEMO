import React, { useState } from 'react';
import {
  ArrowLeft,
  CalendarClock,
  FileText,
  Lock,
  Phone,
  ShieldCheck,
  Smartphone,
  Trees,
  Users,
} from 'lucide-react';
import { COMPANY_INFO } from '../data/seedData';
import {
  getConfiguredPasscode,
  grantSessionUnlock,
  verifyAccessPasscode,
  type ProtectedArea,
} from '../utils/accessControl';
import { ReliefEmblem } from './ReliefLogo';

interface ActivationLockScreenProps {
  area: ProtectedArea;
  onUnlock: () => void;
  onBackToSite: () => void;
}

const AREA_META: Record<
  ProtectedArea,
  {
    kicker: string;
    title: string;
    subtitle: string;
    requiredFormula: string;
    modules: { title: string; detail: string; icon: React.ComponentType<{ className?: string }> }[];
  }
> = {
  app: {
    kicker: 'Application Terrain & Client (/app)',
    title: 'Application verrouillée avant activation',
    subtitle:
      'Le téléchargement sur téléphone (iOS/Android), le mode hors-ligne et les outils chantier sont activés uniquement après souscription à votre formule.',
    requiredFormula: 'Inclus dès la Formule 06 (ou vue client Formule 05)',
    modules: [
      {
        title: 'Tournée, Chrono & GPS',
        detail: 'Chronométrage chantier et guidage direct vers chaque domaine.',
        icon: CalendarClock,
      },
      {
        title: 'Relevé Oliviers & Jauge OLD 06',
        detail: 'Comptage sur place, estimation récolte et contrôle sécurité incendie.',
        icon: Trees,
      },
      {
        title: 'Devis Express sur place',
        detail: 'Chiffrage immédiat synchronisé avec le bureau et WhatsApp.',
        icon: FileText,
      },
      {
        title: 'Carnet Propriétaire',
        detail: 'Suivi santé du jardin et validation des devis en 1 clic.',
        icon: Users,
      },
    ],
  },
  admin: {
    kicker: 'Portail Bureau Dissocié (/admin)',
    title: 'Espace de gestion verrouillé avant activation',
    subtitle:
      'La gestion des demandes, l’édition de devis et factures A4, les relances WhatsApp et le kit réseaux sociaux sont réservés aux comptes activés.',
    requiredFormula: 'Inclus dès la Formule 03 (Bureau Pro) à Formule 06',
    modules: [
      {
        title: 'Demandes & Pré-Devis',
        detail: 'Transformation des demandes du site en devis chiffrés.',
        icon: FileText,
      },
      {
        title: 'Facturation A4 & PDF',
        detail: 'Numérotation automatique et suivi des règlements.',
        icon: ShieldCheck,
      },
      {
        title: 'WhatsApp & Planning',
        detail: 'Modèles de réponses rapides et tournées synchronisées.',
        icon: CalendarClock,
      },
      {
        title: 'Kit Lancement & Réseaux',
        detail: 'Miniatures HD, flyers imprimables et annonces locales.',
        icon: Smartphone,
      },
    ],
  },
};

export const ActivationLockScreen: React.FC<ActivationLockScreenProps> = ({
  area,
  onUnlock,
  onBackToSite,
}) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const meta = AREA_META[area];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const expected = getConfiguredPasscode(area);
    if (!expected) {
      setError(
        'Aucune licence ou clé d’activation active sur cette prévisualisation. Contactez votre conseiller pour activer cet espace.'
      );
      return;
    }
    if (verifyAccessPasscode(code, expected)) {
      grantSessionUnlock(area);
      setError('');
      onUnlock();
      return;
    }
    setError('Code d’activation invalide. Veuillez contacter votre conseiller.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#163B29] via-[#0E281B] to-[#091B12] text-[#FAF8F3] flex items-center justify-center p-4 md:p-8">
      <div className="max-w-2xl w-full bg-[#FAF8F3] text-[#1A211D] border border-[#CFA75B] rounded-2xl p-6 md:p-9 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-[#E5DEC9]">
          <div className="flex items-center gap-3">
            <ReliefEmblem className="w-11 h-11 shrink-0" />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#9C7228]">
                {meta.kicker}
              </p>
              <p className="font-serif text-lg font-bold text-[#0E281B]">
                {COMPANY_INFO.brandName}
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#0E281B] text-[#EBD9B3] text-xs font-semibold">
            <Lock className="w-3.5 h-3.5 text-[#CFA75B]" />
            <span>Licence requise</span>
          </span>
        </div>

        <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#0E281B] leading-tight">
          {meta.title}
        </h1>
        <p className="text-sm text-[#3E4A43] mt-2 leading-relaxed">{meta.subtitle}</p>
        <p className="text-xs font-semibold text-[#9C7228] mt-2">{meta.requiredFormula}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-6">
          {meta.modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.title}
                className="bg-white border border-[#E5DEC9] rounded-xl p-3.5 flex items-start gap-3"
              >
                <div className="w-9 h-9 rounded-lg bg-[#F3EFE5] text-[#0E281B] inline-flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-xs font-bold text-[#0E281B]">{mod.title}</h2>
                    <Lock className="w-3 h-3 text-[#9C7228] shrink-0" />
                  </div>
                  <p className="text-[11px] text-[#647068] mt-0.5 leading-snug">{mod.detail}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <button
            type="button"
            onClick={onBackToSite}
            className="min-h-[44px] px-5 rounded-lg bg-[#0E281B] text-[#EBD9B3] text-sm font-semibold hover:bg-[#163B29] transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retourner voir les formules</span>
          </button>
          <a
            href={COMPANY_INFO.advisorPhoneHref}
            className="min-h-[44px] px-5 rounded-lg bg-[#9C7228] text-white text-sm font-semibold hover:bg-[#0E281B] transition-colors inline-flex items-center gap-2"
          >
            <Phone className="w-4 h-4" />
            <span>Activer mon accès</span>
          </a>
        </div>

        <form
          onSubmit={handleSubmit}
          className="pt-5 border-t border-[#E5DEC9] space-y-3"
        >
          <label
            htmlFor={`activation-code-${area}`}
            className="block text-xs font-semibold uppercase tracking-[0.12em] text-[#647068]"
          >
            Déblocage par clé d’activation (licence activée ou présentation accompagnée)
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              id={`activation-code-${area}`}
              type="password"
              autoComplete="off"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Saisir votre code d’activation privé"
              className="flex-1 min-h-[44px] px-4 rounded-lg border border-[#E5DEC9] bg-white text-sm font-mono text-[#0E281B] focus:outline-none focus:border-[#B5893A]"
            />
            <button
              type="submit"
              className="min-h-[44px] px-5 rounded-lg border border-[#0E281B] text-[#0E281B] text-sm font-semibold hover:bg-[#0E281B] hover:text-[#EBD9B3] transition-colors whitespace-nowrap"
            >
              Déverrouiller
            </button>
          </div>
          {error && (
            <p role="alert" className="text-xs font-semibold text-[#9B2C2C]">
              {error}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};
