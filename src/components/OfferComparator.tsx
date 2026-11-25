import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Columns2,
  Sparkles,
  Table2,
} from 'lucide-react';
import {
  OFFER_COMPARISON_MATRIX,
  OFFER_COMPARISON_PROFILES,
  STUDIO_OFFERS,
  type OfferComparisonCell,
} from '../data/seedData';
import type { BillingMode } from '../types/relief';
import { computeDuelComparison } from '../utils/offersLogic';

interface OfferComparatorProps {
  billingMode: BillingMode;
  suggestedOfferIndex?: number;
  onOpenAdmin: () => void;
  onOpenApp: () => void;
}

type ComparatorView = 'matrix' | 'duel';

export const OfferComparator: React.FC<OfferComparatorProps> = ({
  billingMode,
  suggestedOfferIndex,
  onOpenAdmin,
  onOpenApp,
}) => {
  const [expanded, setExpanded] = useState(true);
  const [view, setView] = useState<ComparatorView>('matrix');
  const [focusedIndex, setFocusedIndex] = useState<number>(5);
  const [duelLeft, setDuelLeft] = useState<number>(2);
  const [duelRight, setDuelRight] = useState<number>(5);

  useEffect(() => {
    if (typeof suggestedOfferIndex === 'number') {
      setFocusedIndex(suggestedOfferIndex);
    }
  }, [suggestedOfferIndex]);

  const focusedProfile = OFFER_COMPARISON_PROFILES[focusedIndex] || OFFER_COMPARISON_PROFILES[5];
  const focusedOffer = STUDIO_OFFERS[focusedIndex] || STUDIO_OFFERS[5];

  const duelResult = useMemo(
    () => computeDuelComparison(duelLeft, duelRight, billingMode),
    [duelLeft, duelRight, billingMode]
  );

  const renderCellContent = (cell: OfferComparisonCell, isHighlightedCol: boolean) => {
    if (cell.status === 'none') {
      return (
        <span className="text-[#B5B0A2] font-mono text-sm" aria-label="Non inclus">
          —
        </span>
      );
    }
    if (cell.status === 'best') {
      return (
        <span
          className={`inline-flex items-center justify-center gap-1.5 font-semibold ${
            isHighlightedCol ? 'text-[#0E281B]' : 'text-[#9C7228]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span>{cell.label}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center justify-center gap-1.5 font-medium text-[#1E6B43]">
        <Check className="w-3.5 h-3.5 shrink-0" />
        <span>{cell.label}</span>
      </span>
    );
  };

  return (
    <div className="mt-8 bg-white border border-[#E5DEC9] rounded-xl overflow-hidden">
      {/* En-tête du comparateur */}
      <div className="px-5 md:px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E5DEC9] bg-[#FAF8F3]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9C7228]">
            Comparateur interactif
          </p>
          <h3 className="font-serif text-xl md:text-2xl font-semibold text-[#0E281B]">
            Comprendre et comparer les 6 formules en un coup d’œil
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {expanded && (
            <div
              role="tablist"
              aria-label="Mode du comparateur"
              className="inline-flex p-1 rounded-lg bg-[#F3EFE5] border border-[#E5DEC9]"
            >
              <button
                type="button"
                role="tab"
                aria-selected={view === 'matrix'}
                onClick={() => setView('matrix')}
                className={`min-h-[38px] px-3 rounded-md text-xs font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  view === 'matrix'
                    ? 'bg-[#0E281B] text-[#EBD9B3]'
                    : 'text-[#3E4A43] hover:text-[#0E281B]'
                }`}
              >
                <Table2 className="w-3.5 h-3.5" />
                <span>Tableau complet</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={view === 'duel'}
                onClick={() => setView('duel')}
                className={`min-h-[38px] px-3 rounded-md text-xs font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  view === 'duel'
                    ? 'bg-[#0E281B] text-[#EBD9B3]'
                    : 'text-[#3E4A43] hover:text-[#0E281B]'
                }`}
              >
                <Columns2 className="w-3.5 h-3.5" />
                <span>Duel 2 formules</span>
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="min-h-[40px] px-3 rounded-lg border border-[#E5DEC9] bg-white text-xs font-semibold text-[#0E281B] hover:border-[#0E281B] inline-flex items-center gap-1.5 shrink-0"
          >
            <span>{expanded ? 'Masquer' : 'Afficher'}</span>
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {expanded && view === 'matrix' && (
        <div>
          {/* Barre ludique de sélection et résumé en langage clair */}
          <div className="p-5 md:p-6 border-b border-[#E5DEC9] bg-white">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#647068] mb-2.5">
              Cliquez sur une formule pour voir ce qu’elle change concrètement dans votre journée :
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
              {OFFER_COMPARISON_PROFILES.map((profile, idx) => {
                const active = focusedIndex === idx;
                const price = STUDIO_OFFERS[idx].prices[billingMode].main;
                return (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => setFocusedIndex(idx)}
                    aria-pressed={active}
                    className={`min-h-[54px] px-3 py-2 rounded-lg border text-left transition-all ${
                      active
                        ? 'bg-[#0E281B] border-[#0E281B] text-[#FAF8F3] shadow-sm'
                        : 'bg-[#FAF8F3] border-[#E5DEC9] text-[#0E281B] hover:border-[#B5893A]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 text-[11px] font-mono">
                      <span className={active ? 'text-[#CFA75B]' : 'text-[#9C7228]'}>
                        {profile.code}
                      </span>
                      <span className="font-semibold tabular-nums">{price}</span>
                    </div>
                    <p className="text-xs font-semibold truncate mt-0.5">{profile.shortName}</p>
                  </button>
                );
              })}
            </div>

            {/* Carte explication immédiate de la formule inspectée */}
            <div className="rounded-xl bg-[#F3EFE5] border border-[#E5DEC9] p-4 md:p-5 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
              <div className="lg:col-span-8">
                <p className="text-[11px] font-mono font-semibold uppercase tracking-[0.12em] text-[#9C7228]">
                  Formule {focusedProfile.code} · {focusedOffer.title}
                </p>
                <p className="text-sm md:text-base font-medium text-[#0E281B] mt-1 leading-relaxed">
                  {focusedProfile.plainSummary}
                </p>
                <p className="text-xs text-[#1E6B43] font-semibold mt-2 inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Atout clé : {focusedProfile.unlockHighlight}</span>
                </p>
              </div>

              <div className="lg:col-span-4 bg-white border border-[#E5DEC9] rounded-lg p-3.5">
                <div className="flex items-center justify-between text-xs font-semibold text-[#0E281B] mb-2">
                  <span>Niveau d’autonomie</span>
                  <span className="font-mono text-[#9C7228] tabular-nums">
                    {focusedProfile.autonomyLevel} / 6
                  </span>
                </div>
                <div className="grid grid-cols-6 gap-1.5" aria-hidden="true">
                  {[1, 2, 3, 4, 5, 6].map((step) => (
                    <span
                      key={step}
                      className={`h-2 rounded-sm transition-colors ${
                        step <= focusedProfile.autonomyLevel
                          ? 'bg-[#0E281B]'
                          : 'bg-[#E5DEC9]'
                      }`}
                    />
                  ))}
                </div>
                {(focusedIndex >= 2 || focusedIndex >= 4) && (
                  <div className="mt-3 pt-2.5 border-t border-[#E5DEC9] flex items-center justify-between gap-2">
                    <span className="text-[11px] text-[#647068]">Essayer en direct :</span>
                    {focusedIndex >= 4 ? (
                      <button
                        type="button"
                        onClick={onOpenApp}
                        className="text-xs font-semibold text-[#0E281B] hover:text-[#9C7228] underline underline-offset-4"
                      >
                        Ouvrir /app
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={onOpenAdmin}
                        className="text-xs font-semibold text-[#0E281B] hover:text-[#9C7228] underline underline-offset-4"
                      >
                        Ouvrir /admin
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tableau complet lisible */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF8F3] border-b border-[#E5DEC9]">
                  <th className="py-3.5 px-4 text-xs font-semibold uppercase tracking-[0.1em] text-[#647068] w-[32%]">
                    Ce que cela vous apporte
                  </th>
                  {OFFER_COMPARISON_PROFILES.map((profile, idx) => {
                    const active = focusedIndex === idx;
                    const price = STUDIO_OFFERS[idx].prices[billingMode].main;
                    return (
                      <th
                        key={profile.id}
                        className={`py-3 px-2.5 text-center transition-colors ${
                          active ? 'bg-[#EBD9B3]/35' : ''
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setFocusedIndex(idx)}
                          className="w-full text-center group"
                        >
                          <span className="block text-[11px] font-mono text-[#9C7228]">
                            {profile.code} · {profile.shortName}
                          </span>
                          <span className="block font-serif text-sm font-bold text-[#0E281B] tabular-nums mt-0.5 group-hover:text-[#9C7228]">
                            {price}
                          </span>
                        </button>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DEC9] text-xs md:text-sm">
                {OFFER_COMPARISON_MATRIX.map((row) => (
                  <tr key={row.id} className="hover:bg-[#FAF8F3]/70">
                    <td className="py-3.5 px-4 align-top">
                      <span className="block text-[10px] font-mono uppercase tracking-[0.12em] text-[#9C7228]">
                        {row.category}
                      </span>
                      <span className="block font-semibold text-[#0E281B] mt-0.5">
                        {row.feature}
                      </span>
                      <span className="block text-xs text-[#647068] mt-0.5 leading-snug">
                        {row.benefit}
                      </span>
                    </td>
                    {row.cells.map((cell, idx) => {
                      const active = focusedIndex === idx;
                      return (
                        <td
                          key={`${row.id}-${idx}`}
                          onClick={() => setFocusedIndex(idx)}
                          className={`py-3.5 px-2.5 text-center whitespace-nowrap cursor-pointer transition-colors ${
                            active ? 'bg-[#EBD9B3]/25' : ''
                          }`}
                        >
                          {renderCellContent(cell, active)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {expanded && view === 'duel' && (
        <div className="p-5 md:p-6 space-y-5">
          {/* Raccourcis rapides de duel */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-[#647068]">
              Comparez n’importe quelles 2 formules côte à côte pour voir l’écart exact et ce que
              vous gagnez :
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {[
                { label: '01 Vitrine vs 03 Bureau', l: 0, r: 2 },
                { label: '03 Bureau vs 06 Appli', l: 2, r: 5 },
                { label: '05 Portail vs 06 Appli', l: 4, r: 5 },
              ].map((preset) => {
                const active = duelLeft === preset.l && duelRight === preset.r;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setDuelLeft(preset.l);
                      setDuelRight(preset.r);
                    }}
                    className={`min-h-[36px] px-3 rounded-lg border text-xs font-semibold transition-colors ${
                      active
                        ? 'bg-[#0E281B] border-[#0E281B] text-[#EBD9B3]'
                        : 'bg-[#FAF8F3] border-[#E5DEC9] text-[#0E281B] hover:border-[#B5893A]'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sélecteurs A vs B + Écart tarifaire */}
          <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-stretch">
            <div className="md:col-span-4 rounded-xl border border-[#E5DEC9] bg-[#FAF8F3] p-4">
              <label
                htmlFor="duel-left-select"
                className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#647068] mb-1.5"
              >
                Formule A (référence)
              </label>
              <select
                id="duel-left-select"
                value={duelLeft}
                onChange={(e) => setDuelLeft(Number(e.target.value))}
                className="w-full min-h-[44px] px-3 rounded-lg bg-white border border-[#E5DEC9] text-sm font-semibold text-[#0E281B]"
              >
                {OFFER_COMPARISON_PROFILES.map((p, idx) => (
                  <option key={p.id} value={idx}>
                    {p.code} · {p.shortName} ({STUDIO_OFFERS[idx].prices[billingMode].main})
                  </option>
                ))}
              </select>
              <p className="font-serif text-2xl font-bold text-[#0E281B] tabular-nums mt-2.5">
                {STUDIO_OFFERS[duelLeft].prices[billingMode].main}
              </p>
              <p className="text-xs text-[#647068] mt-1">
                {OFFER_COMPARISON_PROFILES[duelLeft].plainSummary}
              </p>
            </div>

            <div className="md:col-span-3 rounded-xl border border-[#E5DEC9] bg-white p-4 flex flex-col items-center justify-center text-center">
              <span className="text-[11px] font-mono uppercase tracking-[0.12em] text-[#9C7228]">
                Écart entre A et B
              </span>
              <p className="font-serif text-2xl font-bold text-[#0E281B] tabular-nums my-1">
                {duelResult.formattedDiff}
              </p>
              <p className="text-xs text-[#1E6B43] font-semibold inline-flex items-center gap-1">
                <ArrowRight className="w-3.5 h-3.5" />
                <span>
                  {duelResult.rightUpgradesCount} atout
                  {duelResult.rightUpgradesCount > 1 ? 's' : ''} en plus en B
                </span>
              </p>
            </div>

            <div className="md:col-span-4 rounded-xl border border-[#CFA75B]/50 bg-[#0E281B] text-[#FAF8F3] p-4">
              <label
                htmlFor="duel-right-select"
                className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#CFA75B] mb-1.5"
              >
                Formule B (comparée)
              </label>
              <select
                id="duel-right-select"
                value={duelRight}
                onChange={(e) => setDuelRight(Number(e.target.value))}
                className="w-full min-h-[44px] px-3 rounded-lg bg-[#091B12] border border-[#CFA75B]/40 text-sm font-semibold text-white"
              >
                {OFFER_COMPARISON_PROFILES.map((p, idx) => (
                  <option key={p.id} value={idx}>
                    {p.code} · {p.shortName} ({STUDIO_OFFERS[idx].prices[billingMode].main})
                  </option>
                ))}
              </select>
              <p className="font-serif text-2xl font-bold text-[#CFA75B] tabular-nums mt-2.5">
                {STUDIO_OFFERS[duelRight].prices[billingMode].main}
              </p>
              <p className="text-xs text-[#FAF8F3]/80 mt-1">
                {OFFER_COMPARISON_PROFILES[duelRight].plainSummary}
              </p>
            </div>
          </div>

          {/* Liste des critères en face-à-face */}
          <div className="space-y-2.5">
            {duelResult.rows.map(({ row, leftCell, rightCell, outcome }) => (
              <div
                key={row.id}
                className={`rounded-xl border p-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-center ${
                  outcome === 'right-better'
                    ? 'bg-[#E7F5ED]/60 border-[#BCE3CB]'
                    : 'bg-[#FAF8F3] border-[#E5DEC9]'
                }`}
              >
                <div className="md:col-span-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-[#9C7228]">
                      {row.category}
                    </span>
                    {outcome === 'right-better' && (
                      <span className="text-[11px] font-semibold text-[#1E6B43]">
                        · + Débloqué en {OFFER_COMPARISON_PROFILES[duelRight].shortName}
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-sm text-[#0E281B] mt-0.5">{row.feature}</p>
                  <p className="text-xs text-[#647068] mt-0.5">{row.benefit}</p>
                </div>

                <div className="md:col-span-3 rounded-lg bg-white border border-[#E5DEC9] px-3 py-2 text-center text-xs">
                  <span className="block text-[10px] font-mono text-[#647068]">
                    Formule {OFFER_COMPARISON_PROFILES[duelLeft].code}
                  </span>
                  <div className="mt-0.5">{renderCellContent(leftCell, false)}</div>
                </div>

                <div className="md:col-span-3 rounded-lg bg-white border border-[#B5893A]/50 px-3 py-2 text-center text-xs">
                  <span className="block text-[10px] font-mono text-[#9C7228]">
                    Formule {OFFER_COMPARISON_PROFILES[duelRight].code}
                  </span>
                  <div className="mt-0.5">{renderCellContent(rightCell, true)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
