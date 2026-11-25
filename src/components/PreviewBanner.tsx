import React, { useState } from 'react';
import { ArrowLeft, Eye, KeyRound, Lock, Phone, ShieldAlert, X } from 'lucide-react';
import { COMPANY_INFO } from '../data/seedData';
import {
  getConfiguredPasscode,
  grantSessionUnlock,
  verifyAccessPasscode,
  type ProtectedArea,
} from '../utils/accessControl';

interface PreviewBannerProps {
  area: ProtectedArea;
  onRequestUnlock: () => void;
  onBackToSite: () => void;
}

export const PreviewBanner: React.FC<PreviewBannerProps> = ({
  area,
  onRequestUnlock,
  onBackToSite,
}) => {
  const message =
    area === 'app'
      ? 'Prévisualisation partielle /app — Téléchargement mobile, devis express, sauvegardes et mode hors-ligne verrouillés avant activation.'
      : 'Prévisualisation partielle /admin — Exports PDF A4, facturation, kit réseaux sociaux et modifications verrouillés avant activation.';

  return (
    <div
      role="region"
      aria-label="Bandeau prévisualisation partielle"
      className="bg-[#091B12] text-[#FAF8F3] border-b border-[#CFA75B]/40 px-4 md:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2.5"
    >
      <div className="flex items-center gap-2 min-w-0">
        <Eye className="w-4 h-4 text-[#CFA75B] shrink-0" />
        <p className="text-xs font-medium text-[#EBD9B3] leading-snug">{message}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onBackToSite}
          className="min-h-[34px] px-3 rounded border border-white/20 text-xs font-semibold text-[#FAF8F3] hover:bg-white/10 whitespace-nowrap"
        >
          Voir les formules
        </button>
        <button
          type="button"
          onClick={onRequestUnlock}
          className="min-h-[34px] px-3 rounded bg-[#CFA75B] text-[#091B12] text-xs font-bold hover:bg-[#EBD9B3] inline-flex items-center gap-1.5 whitespace-nowrap"
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Activer / Débloquer</span>
        </button>
      </div>
    </div>
  );
};

interface ModulePreviewLockProps {
  title: string;
  description: string;
  requiredFormula: string;
  highlights: string[];
  onRequestUnlock: () => void;
  onBackToSite: () => void;
}

export const ModulePreviewLock: React.FC<ModulePreviewLockProps> = ({
  title,
  description,
  requiredFormula,
  highlights,
  onRequestUnlock,
  onBackToSite,
}) => {
  return (
    <section className="bg-white border border-[#CFA75B] rounded-2xl p-6 md:p-8 max-w-3xl mx-auto shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-[#E5DEC9]">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-lg bg-[#0E281B] text-[#CFA75B] inline-flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9C7228]">
              Module verrouillé en prévisualisation
            </p>
            <h2 className="font-serif text-xl md:text-2xl font-bold text-[#0E281B]">{title}</h2>
          </div>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded bg-[#F3EFE5] text-[#0E281B] border border-[#E5DEC9]">
          {requiredFormula}
        </span>
      </div>

      <p className="text-sm text-[#3E4A43] leading-relaxed mb-5">{description}</p>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
        {highlights.map((item) => (
          <li
            key={item}
            className="text-xs text-[#1A211D] bg-[#FAF8F3] border border-[#E5DEC9] rounded-lg px-3.5 py-2.5 flex items-center gap-2"
          >
            <Lock className="w-3.5 h-3.5 text-[#9C7228] shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onBackToSite}
          className="min-h-[44px] px-4 rounded-lg bg-[#0E281B] text-[#EBD9B3] text-xs md:text-sm font-semibold hover:bg-[#163B29] inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Choisir ma formule</span>
        </button>
        <a
          href={COMPANY_INFO.advisorPhoneHref}
          className="min-h-[44px] px-4 rounded-lg bg-[#9C7228] text-white text-xs md:text-sm font-semibold hover:bg-[#0E281B] inline-flex items-center gap-2"
        >
          <Phone className="w-4 h-4" />
          <span>Activer par téléphone</span>
        </a>
        <button
          type="button"
          onClick={onRequestUnlock}
          className="min-h-[44px] px-4 rounded-lg border border-[#0E281B] text-[#0E281B] text-xs md:text-sm font-semibold hover:bg-[#F3EFE5] inline-flex items-center gap-2"
        >
          <KeyRound className="w-4 h-4" />
          <span>Saisir une clé d’activation</span>
        </button>
      </div>
    </section>
  );
};

interface UnlockLicenseModalProps {
  area: ProtectedArea;
  reason?: string | null;
  onUnlocked: () => void;
  onClose: () => void;
  onBackToSite: () => void;
}

export const UnlockLicenseModal: React.FC<UnlockLicenseModalProps> = ({
  area,
  reason,
  onUnlocked,
  onClose,
  onBackToSite,
}) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const expected = getConfiguredPasscode(area);
    if (!expected) {
      setError(
        'Aucune licence active sur cette prévisualisation. Souscrivez une formule ou demandez une démo accompagnée.'
      );
      return;
    }
    if (verifyAccessPasscode(code, expected)) {
      grantSessionUnlock(area);
      setError('');
      onUnlocked();
      return;
    }
    setError('Code d’activation invalide. Contactez votre conseiller.');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#091B12]/75 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="unlock-modal-title"
      onClick={onClose}
    >
      <div
        className="bg-[#FAF8F3] text-[#1A211D] border border-[#CFA75B] rounded-2xl max-w-md w-full p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#9C7228] shrink-0" />
            <h3 id="unlock-modal-title" className="font-serif text-2xl font-bold text-[#0E281B]">
              Activation requise
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer la fenêtre d’activation"
            className="w-9 h-9 rounded-full bg-white border border-[#E5DEC9] inline-flex items-center justify-center text-[#0E281B]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-[#3E4A43] leading-relaxed mb-4">
          {reason ||
            'Vous consultez actuellement une prévisualisation partielle. Les exports, téléchargements, envois WhatsApp et sauvegardes réelles sont activés uniquement après souscription.'}
        </p>

        <div className="flex flex-wrap gap-2 mb-5">
          <button
            type="button"
            onClick={onBackToSite}
            className="flex-1 min-h-[42px] px-3 rounded-lg bg-[#0E281B] text-[#EBD9B3] text-xs font-semibold hover:bg-[#163B29]"
          >
            Voir les formules
          </button>
          <a
            href={COMPANY_INFO.advisorPhoneHref}
            className="flex-1 min-h-[42px] px-3 rounded-lg bg-[#9C7228] text-white text-xs font-semibold hover:bg-[#0E281B] inline-flex items-center justify-center gap-1.5"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Appeler</span>
          </a>
        </div>

        <form onSubmit={handleSubmit} className="pt-4 border-t border-[#E5DEC9] space-y-2.5">
          <label
            htmlFor={`modal-code-${area}`}
            className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#647068]"
          >
            Clé d’activation conseiller ou client
          </label>
          <div className="flex gap-2">
            <input
              id={`modal-code-${area}`}
              type="password"
              autoComplete="off"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Code privé"
              className="flex-1 min-h-[42px] px-3 rounded-lg border border-[#E5DEC9] bg-white text-sm font-mono text-[#0E281B] focus:outline-none focus:border-[#B5893A]"
            />
            <button
              type="submit"
              className="min-h-[42px] px-4 rounded-lg border border-[#0E281B] text-[#0E281B] text-xs font-semibold hover:bg-[#0E281B] hover:text-[#EBD9B3]"
            >
              Valider
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
