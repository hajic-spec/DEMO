import React, { useState } from 'react';
import {
  ArrowUpRight,
  Check,
  EyeOff,
  Lock,
  Phone,
  Smartphone,
} from 'lucide-react';
import {
  COMPANY_INFO,
  OFFER_SCENARIOS,
  STUDIO_OFFERS,
} from '../data/seedData';
import type { BillingMode } from '../types/relief';
import { OfferComparator } from './OfferComparator';

interface StudioOfferSectionProps {
  onOpenAdmin: () => void;
  onOpenApp: () => void;
}

const BILLING_NOTES: Record<BillingMode, string> = {
  once: 'Paiement en une fois : vous êtes propriétaire immédiat de votre dispositif sans loyer logiciel.',
  three: 'Paiement en 3 mensualités égales sans frais : trésorerie préservée dès le lancement.',
  sub: 'Abonnement mensuel tout inclus (hébergement, suivi technique et mises à jour incluses).',
};

type ScenarioId = (typeof OFFER_SCENARIOS)[number]['id'];

export const StudioOfferSection: React.FC<StudioOfferSectionProps> = ({
  onOpenAdmin,
  onOpenApp,
}) => {
  const [billingMode, setBillingMode] = useState<BillingMode>('once');
  const [selectedScenario, setSelectedScenario] = useState<ScenarioId | null>(null);
  const [hiddenForClientPreview, setHiddenForClientPreview] = useState(false);

  if (hiddenForClientPreview) {
    return (
      <div className="bg-[#FAF8F3] border-t border-[#E5DEC9] py-4 px-5 text-center">
        <button
          type="button"
          onClick={() => setHiddenForClientPreview(false)}
          className="text-xs font-medium text-[#647068] hover:text-[#0E281B] underline underline-offset-4"
        >
          Réafficher la proposition Studio CS Numérique (6 formules · /admin &amp; /app)
        </button>
      </div>
    );
  }

  const activeScenario = OFFER_SCENARIOS.find((s) => s.id === selectedScenario) || null;
  const recommendedSet = new Set<string>(activeScenario ? activeScenario.recommendedIds : []);

  const tierOneOffers = STUDIO_OFFERS.slice(0, 3);
  const tierTwoOffers = STUDIO_OFFERS.slice(3, 5);
  const flagshipOffer = STUDIO_OFFERS[5];

  const renderOfferActions = (offerId: string) => {
    switch (offerId) {
      case 'formule-01':
        return (
          <a
            href="#top"
            className="w-full min-h-[44px] inline-flex items-center justify-center px-4 rounded-lg border border-[#E5DEC9] bg-[#FAF8F3] text-xs md:text-sm font-semibold text-[#0E281B] hover:border-[#0E281B] transition-colors"
          >
            Voir la vitrine 360 € ci-dessus
          </a>
        );
      case 'formule-02':
        return (
          <a
            href={COMPANY_INFO.advisorPhoneHref}
            className="w-full min-h-[44px] inline-flex items-center justify-center px-4 rounded-lg bg-[#9C7228] text-white text-xs md:text-sm font-semibold hover:bg-[#0E281B] transition-colors"
          >
            Échanger sur la Formule 02
          </a>
        );
      case 'formule-03':
      case 'formule-04':
        return (
          <div className="grid grid-cols-2 gap-2.5">
            <a
              href="#contact"
              className="min-h-[44px] inline-flex items-center justify-center px-3 rounded-lg border border-[#E5DEC9] bg-[#FAF8F3] text-xs md:text-sm font-semibold text-[#0E281B] hover:border-[#0E281B] transition-colors whitespace-nowrap"
            >
              {offerId === 'formule-03' ? 'Tester demande' : 'Tester pré-devis'}
            </a>
            <button
              type="button"
              onClick={onOpenAdmin}
              className="min-h-[44px] inline-flex items-center justify-center gap-1 px-3 rounded-lg bg-[#9C7228] text-white text-xs md:text-sm font-semibold hover:bg-[#0E281B] transition-colors whitespace-nowrap"
            >
              <span>Ouvrir /admin</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      case 'formule-05':
        return (
          <div className="grid grid-cols-2 gap-2.5">
            <a
              href={COMPANY_INFO.advisorPhoneHref}
              className="min-h-[44px] inline-flex items-center justify-center px-3 rounded-lg border border-[#E5DEC9] bg-[#FAF8F3] text-xs md:text-sm font-semibold text-[#0E281B] hover:border-[#0E281B] transition-colors whitespace-nowrap"
            >
              Étude portail
            </a>
            <button
              type="button"
              onClick={onOpenApp}
              className="min-h-[44px] inline-flex items-center justify-center gap-1 px-3 rounded-lg bg-[#0E281B] text-[#EBD9B3] text-xs md:text-sm font-semibold hover:bg-[#9C7228] hover:text-white transition-colors whitespace-nowrap"
            >
              <span>Vue client /app</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  const renderStandardCard = (offer: (typeof STUDIO_OFFERS)[number]) => {
    const activePrice = offer.prices[billingMode];
    const isRecommended = recommendedSet.has(offer.id);
    const isDimmed = Boolean(activeScenario && !isRecommended);

    return (
      <article
        key={offer.id}
        className={`rounded-xl p-6 md:p-7 flex flex-col justify-between transition-all duration-200 ${
          isRecommended
            ? 'bg-white border-2 border-[#B5893A] shadow-lg'
            : isDimmed
              ? 'bg-white/80 border border-[#E5DEC9] opacity-70 hover:opacity-100'
              : 'bg-white border border-[#E5DEC9] hover:border-[#B5893A]/70'
        }`}
      >
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9C7228] truncate">
              {offer.kicker}
            </p>
            {isRecommended && (
              <span className="text-[11px] font-mono font-semibold text-[#1E6B43] shrink-0">
                Recommandée
              </span>
            )}
          </div>

          <h3 className="font-serif text-2xl font-semibold text-[#0E281B] leading-snug mb-2">
            {offer.title}
          </h3>

          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 mb-1">
            <span className="font-serif text-3xl font-bold text-[#9C7228] tabular-nums whitespace-nowrap">
              {activePrice.main}
            </span>
            <span className="text-xs font-semibold text-[#3E4A43] tabular-nums">
              {activePrice.sub}
            </span>
          </div>
          <p className="text-xs text-[#647068] pb-4 mb-4 border-b border-[#E5DEC9]">
            {activePrice.tag}
          </p>

          <p className="text-sm text-[#3E4A43] leading-relaxed mb-5">{offer.description}</p>

          <ul className="space-y-2.5 mb-6">
            {offer.features.map((feat) => (
              <li
                key={feat}
                className="text-sm text-[#3E4A43] flex items-start gap-2.5 leading-snug"
              >
                <Check className="w-4 h-4 text-[#9C7228] shrink-0 mt-0.5" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-4 border-t border-[#E5DEC9]">
          <p className="text-xs text-[#647068] mb-3">{offer.footNote}</p>
          {renderOfferActions(offer.id)}
        </div>
      </article>
    );
  };

  const flagshipPrice = flagshipOffer.prices[billingMode];
  const flagshipRecommended = recommendedSet.has(flagshipOffer.id);

  return (
    <section
      id="offre-studio"
      className="scroll-mt-20 bg-[#F3EFE5] border-t border-[#E5DEC9] py-20 md:py-24"
    >
      <div className="max-w-[1240px] mx-auto px-5 md:px-10">
        {/* En-tête proposition éditorial unique (sans double bannière redondante) */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 pb-8 border-b border-[#E5DEC9]">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9C7228] mb-2">
              Proposition Studio CS Numérique · 6 Paliers évolutifs
            </p>
            <h2 className="font-serif text-3xl md:text-5xl font-semibold text-[#0E281B] leading-tight mb-3 text-balance">
              Votre écosystème digital : de la vitrine locale à l’application terrain
            </h2>
            <p className="text-[#3E4A43] text-base leading-relaxed">
              De la base <strong className="text-[#0E281B]">Formule 01 à 360 €</strong> jusqu’à
              l’<strong className="text-[#0E281B]">Application Terrain &amp; Client (PWA)</strong>,
              testez en direct votre espace de gestion{' '}
              <code className="font-mono text-sm bg-[#E5DEC9] px-1.5 py-0.5 rounded text-[#0E281B]">
                /admin
              </code>{' '}
              et votre application mobile{' '}
              <code className="font-mono text-sm bg-[#E5DEC9] px-1.5 py-0.5 rounded text-[#0E281B]">
                /app
              </code>
              .
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href={COMPANY_INFO.advisorPhoneHref}
              className="min-h-[44px] inline-flex items-center gap-2 px-4 rounded-lg border border-[#E5DEC9] bg-white text-sm font-semibold text-[#0E281B] hover:border-[#B5893A] transition-colors whitespace-nowrap shrink-0"
            >
              <Phone className="w-4 h-4 text-[#9C7228]" />
              <span>Conseiller : {COMPANY_INFO.advisorPhoneDisplay}</span>
            </a>
            <button
              type="button"
              onClick={onOpenAdmin}
              className="min-h-[44px] inline-flex items-center gap-2 px-4 rounded-lg border border-[#0E281B] bg-white text-[#0E281B] text-sm font-semibold hover:bg-[#0E281B] hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              <Lock className="w-4 h-4" />
              <span>Ouvrir /admin</span>
            </button>
            <button
              type="button"
              onClick={onOpenApp}
              className="min-h-[44px] inline-flex items-center gap-2 px-5 rounded-lg bg-[#0E281B] text-[#EBD9B3] text-sm font-semibold hover:bg-[#9C7228] hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              <Smartphone className="w-4 h-4" />
              <span>Lancer l’Appli /app</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sélecteur de besoin (Scenario Matcher) */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0E281B]">
              1. Quelle est votre priorité aujourd’hui ?
            </p>
            {activeScenario && (
              <button
                type="button"
                onClick={() => setSelectedScenario(null)}
                className="text-xs font-semibold text-[#9C7228] hover:text-[#0E281B] underline underline-offset-4"
              >
                Afficher toutes les formules sans filtre
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {OFFER_SCENARIOS.map((scenario) => {
              const active = selectedScenario === scenario.id;
              return (
                <button
                  key={scenario.id}
                  type="button"
                  onClick={() =>
                    setSelectedScenario((prev) => (prev === scenario.id ? null : scenario.id))
                  }
                  aria-pressed={active}
                  className={`text-left rounded-xl p-4 border transition-all ${
                    active
                      ? 'bg-[#0E281B] border-[#0E281B] text-[#FAF8F3] shadow-md'
                      : 'bg-white border-[#E5DEC9] text-[#0E281B] hover:border-[#B5893A]'
                  }`}
                >
                  <p
                    className={`text-[11px] font-mono uppercase tracking-[0.12em] mb-1 ${
                      active ? 'text-[#CFA75B]' : 'text-[#9C7228]'
                    }`}
                  >
                    {scenario.recommendedIds
                      .map((id) => id.replace('formule-', 'Formule '))
                      .join(' · ')}
                  </p>
                  <p className="font-serif text-xl font-semibold leading-snug">
                    {scenario.label}
                  </p>
                </button>
              );
            })}
          </div>

          {activeScenario && (
            <div className="mt-3 bg-white border border-[#B5893A]/50 rounded-xl px-4 py-3 text-sm text-[#3E4A43]">
              <strong className="text-[#0E281B]">Recommandation ciblée :</strong>{' '}
              {activeScenario.summary}
            </div>
          )}
        </div>

        {/* Sélecteur 3 modes de financement */}
        <div className="bg-white border border-[#E5DEC9] rounded-xl p-4 md:px-6 md:py-4 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <strong className="block text-sm font-semibold text-[#0E281B]">
              2. Mode de financement client (valable sur l’ensemble des 6 offres)
            </strong>
            <span className="text-sm text-[#647068]">{BILLING_NOTES[billingMode]}</span>
          </div>

          <div
            role="tablist"
            aria-label="Mode de paiement"
            className="inline-flex flex-wrap items-center gap-1 p-1 bg-[#F3EFE5] rounded-lg border border-[#E5DEC9] shrink-0"
          >
            {(
              [
                { id: 'once', label: 'Achat complet (1×)' },
                { id: 'three', label: 'Paiement en 3× sans frais' },
                { id: 'sub', label: 'Abonnement (/mois)' },
              ] as const
            ).map((mode) => (
              <button
                key={mode.id}
                type="button"
                role="tab"
                aria-selected={billingMode === mode.id}
                onClick={() => setBillingMode(mode.id)}
                className={`min-h-[40px] px-3.5 rounded-md text-xs md:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  billingMode === mode.id
                    ? 'bg-[#0E281B] text-[#EBD9B3]'
                    : 'text-[#3E4A43] hover:text-[#0E281B]'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* Palier 1 : Formules 01, 02, 03 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch mb-6">
          {tierOneOffers.map(renderStandardCard)}
        </div>

        {/* Palier 2 : Formules 04, 05 (grille 2 colonnes symétrique sans carte orpheline) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch mb-6">
          {tierTwoOffers.map(renderStandardCard)}
        </div>

        {/* Palier 3 : Formule 06 Flagship Dark Forest & Or */}
        <article
          className={`bg-gradient-to-br from-[#091B12] via-[#0E281B] to-[#163B29] text-[#FAF8F3] rounded-2xl p-6 md:p-10 border transition-all ${
            flagshipRecommended
              ? 'border-2 border-[#CFA75B] shadow-2xl'
              : activeScenario
                ? 'border-[#CFA75B]/30 opacity-80 hover:opacity-100'
                : 'border-[#CFA75B]/50 shadow-xl'
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#CFA75B]">
                  {flagshipOffer.kicker} · Dispositif Intégral
                </p>
                {flagshipRecommended && (
                  <span className="text-xs font-mono font-semibold text-[#EBD9B3]">
                    Recommandée pour votre objectif
                  </span>
                )}
              </div>

              <h3 className="font-serif text-3xl md:text-4xl font-semibold text-white leading-tight mb-2">
                {flagshipOffer.title}
              </h3>

              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-1">
                <span className="font-serif text-3xl md:text-4xl font-bold text-[#CFA75B] tabular-nums whitespace-nowrap">
                  {flagshipPrice.main}
                </span>
                <span className="text-xs font-semibold text-[#EBD9B3] tabular-nums">
                  {flagshipPrice.sub} · {flagshipPrice.tag}
                </span>
              </div>

              <p className="text-sm md:text-base text-[#FAF8F3]/85 leading-relaxed mt-4 mb-5">
                {flagshipOffer.description}
              </p>

              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {flagshipOffer.features.map((feat) => (
                  <li
                    key={feat}
                    className="text-sm text-[#FAF8F3]/90 flex items-start gap-2.5 leading-snug"
                  >
                    <Check className="w-4 h-4 text-[#CFA75B] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={onOpenApp}
                  className="min-h-[48px] px-6 rounded-lg bg-[#CFA75B] text-[#091B12] text-sm font-bold hover:bg-[#EBD9B3] transition-colors inline-flex items-center gap-2 whitespace-nowrap"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Tester l’Appli /app en direct</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onOpenAdmin}
                  className="min-h-[48px] px-5 rounded-lg border border-white/25 bg-white/10 text-white text-sm font-semibold hover:bg-white/20 transition-colors inline-flex items-center gap-2 whitespace-nowrap"
                >
                  <Lock className="w-4 h-4 text-[#CFA75B]" />
                  <span>Ouvrir le Portail /admin</span>
                </button>
              </div>
            </div>

            {/* Aperçu structuré des 4 modules embarqués dans /app */}
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  code: '01',
                  title: 'Tournée, Chrono & GPS',
                  desc: 'Chronomètre chantier sauvegardé dans les fiches + itinéraire Google Maps.',
                },
                {
                  code: '02',
                  title: 'Oliviers & Jauge OLD 06',
                  desc: 'Compteur terrain, estimation récolte en kg et audit incendie 5 points.',
                },
                {
                  code: '03',
                  title: 'Devis Express sur place',
                  desc: 'Chiffrage en 30 s synchronisé avec /admin et prêt à partir par WhatsApp.',
                },
                {
                  code: '04',
                  title: 'Carnet Propriétaire',
                  desc: 'Santé du domaine, détail des prestations et accord client en 1 clic.',
                },
              ].map((mod) => (
                <div
                  key={mod.code}
                  className="bg-white/[0.06] border border-[#CFA75B]/25 rounded-xl p-4"
                >
                  <p className="font-mono text-[11px] font-semibold text-[#CFA75B]">
                    MODULE {mod.code}
                  </p>
                  <h4 className="font-serif text-lg font-semibold text-white mt-1">
                    {mod.title}
                  </h4>
                  <p className="text-xs text-[#FAF8F3]/75 mt-1 leading-relaxed">{mod.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </article>

        {/* Comparateur interactif ludique (Tableau complet + Duel 2 formules) */}
        <OfferComparator
          billingMode={billingMode}
          suggestedOfferIndex={
            activeScenario
              ? STUDIO_OFFERS.findIndex(
                  (o) =>
                    o.id ===
                    activeScenario.recommendedIds[activeScenario.recommendedIds.length - 1]
                )
              : undefined
          }
          onOpenAdmin={onOpenAdmin}
          onOpenApp={onOpenApp}
        />

        <div className="mt-8 pt-5 border-t border-dashed border-[#E5DEC9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#647068]">
          <span>
            Présentation commerciale Studio CS Numérique — À masquer pour la mise en ligne finale
            côté clients.
          </span>
          <button
            type="button"
            onClick={() => setHiddenForClientPreview(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#E5DEC9] bg-white text-[#0E281B] font-semibold hover:border-[#0E281B] transition-colors whitespace-nowrap shrink-0"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>Masquer cette section (aperçu client seul)</span>
          </button>
        </div>
      </div>
    </section>
  );
};
