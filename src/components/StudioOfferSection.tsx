import React, { useState } from 'react';
import { Lock, Phone, ArrowUpRight, EyeOff, Smartphone } from 'lucide-react';
import { COMPANY_INFO, STUDIO_OFFERS } from '../data/seedData';
import type { BillingMode } from '../types/relief';

interface StudioOfferSectionProps {
  onOpenAdmin: () => void;
  onOpenApp: () => void;
}

const BILLING_NOTES: Record<BillingMode, string> = {
  once: 'Paiement en une fois : vous êtes propriétaire immédiat de votre dispositif sans loyer logiciel.',
  three: 'Paiement en 3 mensualités égales sans frais : trésorerie préservée dès le lancement.',
  sub: 'Abonnement mensuel tout inclus (hébergement, suivi technique et mises à jour incluses).',
};

export const StudioOfferSection: React.FC<StudioOfferSectionProps> = ({
  onOpenAdmin,
  onOpenApp,
}) => {
  const [billingMode, setBillingMode] = useState<BillingMode>('once');
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

  return (
    <section
      id="offre-studio"
      className="bg-[#F3EFE5] border-t border-[#E5DEC9] py-20 md:py-24"
    >
      <div className="max-w-[1240px] mx-auto px-5 md:px-10">
        {/* En-tête proposition commerciale */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9C7228] mb-2">
              Proposition Studio CS Numérique · 6 Formules · Achat, 3× ou Abonnement
            </p>
            <h2 className="font-serif text-3xl md:text-5xl font-semibold text-[#0E281B] leading-tight mb-3 text-balance">
              Votre écosystème digital : vitrine, portail /admin &amp; appli mobile /app
            </h2>
            <p className="text-[#3E4A43] text-base leading-relaxed">
              De la base <strong className="text-[#0E281B]">Formule 01 à 360 €</strong> jusqu’à
              l’<strong className="text-[#0E281B]">Application Terrain &amp; Client (PWA)</strong>{' '}
              en Formule 06, chaque palier s’adapte à votre rythme de développement. Testez dès
              maintenant l’espace{' '}
              <code className="font-mono text-sm bg-[#E5DEC9] px-1.5 py-0.5 rounded text-[#0E281B]">
                /admin
              </code>{' '}
              et la première version de l’application{' '}
              <code className="font-mono text-sm bg-[#E5DEC9] px-1.5 py-0.5 rounded text-[#0E281B]">
                /app
              </code>
              .
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href={COMPANY_INFO.advisorPhoneHref}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded border border-[#E5DEC9] bg-white text-sm font-semibold text-[#0E281B] hover:border-[#B5893A] transition-colors whitespace-nowrap shrink-0"
            >
              <Phone className="w-4 h-4 text-[#9C7228]" />
              <span>Conseiller : {COMPANY_INFO.advisorPhoneDisplay}</span>
            </a>
            <button
              type="button"
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded border border-[#0E281B] bg-white text-[#0E281B] text-sm font-semibold hover:bg-[#0E281B] hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              <Lock className="w-4 h-4" />
              <span>Portail /admin</span>
            </button>
            <button
              type="button"
              onClick={onOpenApp}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-[#9C7228] text-white text-sm font-semibold hover:bg-[#0E281B] transition-colors whitespace-nowrap shrink-0"
            >
              <Smartphone className="w-4 h-4" />
              <span>Tester l’Appli /app</span>
            </button>
          </div>
        </div>

        {/* Bannière double démonstration /admin + /app */}
        <div className="bg-gradient-to-br from-[#091B12] via-[#0E281B] to-[#163B29] text-white rounded-xl p-6 md:p-8 border border-[#CFA75B]/35 mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#CFA75B] mb-1.5">
              Déjà testable en direct · Formules 03 à 06
            </p>
            <h3 className="font-serif text-2xl md:text-3xl font-semibold text-white mb-2">
              Portail bureau{' '}
              <code className="font-mono text-xl bg-white/10 px-2 py-0.5 rounded text-[#EBD9B3]">
                /admin
              </code>{' '}
              &amp; Application Mobile{' '}
              <code className="font-mono text-xl bg-white/10 px-2 py-0.5 rounded text-[#EBD9B3]">
                /app
              </code>
            </h3>
            <p className="text-sm md:text-base text-[#FAF8F3]/85 leading-relaxed">
              Pilotez devis PDF, factures et planning depuis{' '}
              <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded text-[#EBD9B3]">
                /admin
              </code>
              , puis passez sur{' '}
              <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded text-[#EBD9B3]">
                /app
              </code>{' '}
              pour le mode terrain (chrono, taille d’oliviers, checklist OLD 06, devis express sur
              place) et l’espace propriétaire.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onOpenAdmin}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded border border-white/25 bg-white/10 text-white text-sm font-semibold hover:bg-white/20 transition-colors whitespace-nowrap shrink-0"
            >
              <span>Ouvrir /admin</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onOpenApp}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded bg-[#CFA75B] text-[#091B12] text-sm font-bold hover:bg-[#EBD9B3] transition-colors whitespace-nowrap shrink-0"
            >
              <Smartphone className="w-4 h-4" />
              <span>Lancer l’Appli /app</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sélecteur 3 modes de financement */}
        <div className="bg-white border border-[#E5DEC9] rounded-xl p-4 md:px-6 md:py-4 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <strong className="block text-sm font-semibold text-[#0E281B]">
              Mode de financement client (valable sur l’ensemble des 6 offres)
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
                className={`px-3.5 py-2 rounded-md text-xs md:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 ${
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

        {/* Grille symétrique 3 × 2 des 6 formules */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {STUDIO_OFFERS.map((offer) => {
            const activePrice = offer.prices[billingMode];
            return (
              <article
                key={offer.id}
                className={`bg-white rounded-xl p-7 flex flex-col justify-between transition-transform duration-200 hover:-translate-y-1 ${
                  offer.featured
                    ? 'border-2 border-[#B5893A] shadow-lg'
                    : 'border border-[#E5DEC9]'
                }`}
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#647068] mb-2 whitespace-nowrap truncate">
                    <span className={offer.featured ? 'text-[#9C7228]' : ''}>{offer.kicker}</span>
                  </p>
                  <div className="flex items-baseline justify-between gap-3 mb-2">
                    <h3 className="font-serif text-2xl font-semibold text-[#0E281B] leading-snug">
                      {offer.title}
                    </h3>
                    <span className="font-serif text-3xl font-bold text-[#9C7228] tabular-nums whitespace-nowrap shrink-0">
                      {activePrice.main}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-[#3E4A43] tabular-nums mb-0.5">
                    {activePrice.sub}
                  </p>
                  <p className="text-xs text-[#647068] pb-4 mb-4 border-b border-[#E5DEC9]">
                    {activePrice.tag}
                  </p>

                  <p className="text-sm text-[#3E4A43] leading-relaxed mb-5">
                    {offer.description}
                  </p>

                  <ul className="space-y-2.5 mb-6">
                    {offer.features.map((feat) => (
                      <li
                        key={feat}
                        className="text-sm text-[#3E4A43] pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-[#B5893A] before:font-bold"
                      >
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-[#E5DEC9]">
                  <p className="text-xs text-[#647068] mb-3">{offer.footNote}</p>
                  {offer.id === 'formule-01' && (
                    <a
                      href="#top"
                      className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded border border-[#E5DEC9] bg-[#FAF8F3] text-sm font-semibold text-[#0E281B] hover:border-[#0E281B] transition-colors"
                    >
                      Voir la vitrine 360 € ci-dessus
                    </a>
                  )}
                  {offer.id === 'formule-02' && (
                    <a
                      href={COMPANY_INFO.advisorPhoneHref}
                      className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded bg-[#9C7228] text-white text-sm font-semibold hover:bg-[#0E281B] transition-colors"
                    >
                      Échanger sur la Formule 02
                    </a>
                  )}
                  {offer.id === 'formule-03' && (
                    <div className="grid grid-cols-2 gap-2.5">
                      <a
                        href="#contact"
                        className="inline-flex items-center justify-center px-3 py-2.5 rounded border border-[#E5DEC9] bg-[#FAF8F3] text-xs md:text-sm font-semibold text-[#0E281B] hover:border-[#0E281B] transition-colors whitespace-nowrap"
                      >
                        Tester demande
                      </a>
                      <button
                        type="button"
                        onClick={onOpenAdmin}
                        className="inline-flex items-center justify-center gap-1 px-3 py-2.5 rounded bg-[#9C7228] text-white text-xs md:text-sm font-semibold hover:bg-[#0E281B] transition-colors whitespace-nowrap"
                      >
                        <span>Ouvrir /admin</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  {offer.id === 'formule-04' && (
                    <div className="grid grid-cols-2 gap-2.5">
                      <a
                        href="#contact"
                        className="inline-flex items-center justify-center px-3 py-2.5 rounded border border-[#E5DEC9] bg-[#FAF8F3] text-xs md:text-sm font-semibold text-[#0E281B] hover:border-[#0E281B] transition-colors whitespace-nowrap"
                      >
                        Tester pré-devis
                      </a>
                      <button
                        type="button"
                        onClick={onOpenAdmin}
                        className="inline-flex items-center justify-center gap-1 px-3 py-2.5 rounded bg-[#9C7228] text-white text-xs md:text-sm font-semibold hover:bg-[#0E281B] transition-colors whitespace-nowrap"
                      >
                        <span>Ouvrir /admin</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  {offer.id === 'formule-05' && (
                    <div className="grid grid-cols-2 gap-2.5">
                      <a
                        href={COMPANY_INFO.advisorPhoneHref}
                        className="inline-flex items-center justify-center px-3 py-2.5 rounded border border-[#E5DEC9] bg-[#FAF8F3] text-xs md:text-sm font-semibold text-[#0E281B] hover:border-[#0E281B] transition-colors whitespace-nowrap"
                      >
                        Étude portail
                      </a>
                      <button
                        type="button"
                        onClick={onOpenApp}
                        className="inline-flex items-center justify-center gap-1 px-3 py-2.5 rounded bg-[#0E281B] text-[#EBD9B3] text-xs md:text-sm font-semibold hover:bg-[#9C7228] hover:text-white transition-colors whitespace-nowrap"
                      >
                        <span>Vue client /app</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  {offer.id === 'formule-06' && (
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={onOpenAdmin}
                        className="inline-flex items-center justify-center px-3 py-2.5 rounded border border-[#E5DEC9] bg-[#FAF8F3] text-xs md:text-sm font-semibold text-[#0E281B] hover:border-[#0E281B] transition-colors whitespace-nowrap"
                      >
                        Ouvrir /admin
                      </button>
                      <button
                        type="button"
                        onClick={onOpenApp}
                        className="inline-flex items-center justify-center gap-1 px-3 py-2.5 rounded bg-[#9C7228] text-white text-xs md:text-sm font-semibold hover:bg-[#0E281B] transition-colors whitespace-nowrap"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>Tester /app</span>
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-8 pt-5 border-t border-dashed border-[#E5DEC9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#647068]">
          <span>
            Présentation commerciale Studio CS Numérique — À masquer pour la mise en ligne finale
            côté clients.
          </span>
          <button
            type="button"
            onClick={() => setHiddenForClientPreview(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded border border-[#E5DEC9] bg-white text-[#0E281B] font-semibold hover:border-[#0E281B] transition-colors whitespace-nowrap shrink-0"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>Masquer cette section (aperçu client seul)</span>
          </button>
        </div>
      </div>
    </section>
  );
};
