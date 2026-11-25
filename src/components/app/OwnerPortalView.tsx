import React, { useMemo, useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Droplets,
  FileCheck2,
  Phone,
  ShieldAlert,
  Sprout,
  Trees,
} from 'lucide-react';
import { COMPANY_INFO } from '../../data/seedData';
import type { ClientProperty, Invoice, Quote } from '../../types/relief';
import {
  formatHumanDuration,
  getLatestLogForClient,
  type FieldVisitLog,
  type SeasonalAlert,
} from '../../utils/appLogic';
import { calculateDocumentTotals, formatEuro } from '../../utils/business';

interface OwnerPortalViewProps {
  clients: ClientProperty[];
  quotes: Quote[];
  invoices: Invoice[];
  fieldLogs: FieldVisitLog[];
  seasonalAlerts: SeasonalAlert[];
  ownerNameFilter: string;
  onChangeOwnerFilter: (val: string) => void;
  onAcceptQuote: (quoteId: string) => void;
  onRequestAlert: (serviceTitle: string, alertTitle: string) => void;
}

export const OwnerPortalView: React.FC<OwnerPortalViewProps> = ({
  clients,
  quotes,
  invoices,
  fieldLogs,
  seasonalAlerts,
  ownerNameFilter,
  onChangeOwnerFilter,
  onAcceptQuote,
  onRequestAlert,
}) => {
  const [expandedQuoteIds, setExpandedQuoteIds] = useState<Record<string, boolean>>({});

  const toggleQuoteDetails = (quoteId: string) => {
    setExpandedQuoteIds((prev) => ({ ...prev, [quoteId]: !prev[quoteId] }));
  };

  const visibleOwnerQuotes = useMemo(() => {
    if (ownerNameFilter === 'all') return quotes;
    return quotes.filter((q) => q.clientName === ownerNameFilter);
  }, [quotes, ownerNameFilter]);

  const visibleOwnerInvoices = useMemo(() => {
    if (ownerNameFilter === 'all') return invoices;
    return invoices.filter((inv) => inv.clientName === ownerNameFilter);
  }, [invoices, ownerNameFilter]);

  const highlightedClient = useMemo(() => {
    if (ownerNameFilter === 'all') return clients[0] || null;
    return clients.find((c) => c.name === ownerNameFilter) || null;
  }, [clients, ownerNameFilter]);

  const latestVisit = useMemo(() => {
    if (!highlightedClient) return null;
    return getLatestLogForClient(fieldLogs, highlightedClient);
  }, [fieldLogs, highlightedClient]);

  return (
    <div className="space-y-6">
      {/* En-tête Carnet de propriété */}
      <section className="bg-[#0E281B] text-[#FAF8F3] rounded-xl p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center border border-[#CFA75B]/30">
        <div className="lg:col-span-7">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#CFA75B] mb-1.5">
            Carnet de propriété · Pays de Grasse (06)
          </p>
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-white mb-2">
            Suivi de votre domaine &amp; validations en 1 clic
          </h2>
          <p className="text-sm text-[#FAF8F3]/80 leading-relaxed">
            Consultez le bilan de passage de Jason Claude, le détail ligne par ligne de vos devis et
            les rappels saisonniers du département 06.
          </p>
        </div>

        <div className="lg:col-span-5 bg-white/[0.08] border border-white/10 rounded-xl p-4 space-y-3">
          <label
            htmlFor="owner-filter"
            className="block text-xs font-semibold uppercase tracking-[0.12em] text-[#EBD9B3]"
          >
            Propriété affichée (démo)
          </label>
          <select
            id="owner-filter"
            value={ownerNameFilter}
            onChange={(e) => onChangeOwnerFilter(e.target.value)}
            className="w-full min-h-[44px] px-3 rounded-lg bg-[#091B12] border border-[#CFA75B]/40 text-white text-sm"
          >
            <option value="all">Toutes les propriétés (vue démo complète)</option>
            {clients.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name} ({c.city})
              </option>
            ))}
            {quotes
              .filter((q) => !clients.some((c) => c.name === q.clientName))
              .map((q) => (
                <option key={q.id} value={q.clientName}>
                  {q.clientName} ({q.clientCity})
                </option>
              ))}
          </select>
          <div className="flex flex-wrap gap-2 pt-1">
            <a
              href={COMPANY_INFO.phoneHref}
              className="flex-1 min-h-[44px] px-3 rounded-lg bg-[#CFA75B] text-[#091B12] text-xs font-bold inline-flex items-center justify-center gap-1.5 hover:bg-[#EBD9B3] transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Appeler Jason Claude</span>
            </a>
          </div>
        </div>
      </section>

      {/* Carnet Santé du Domaine */}
      {highlightedClient && (
        <section className="bg-white border border-[#E5DEC9] rounded-xl p-5 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-4 border-b border-[#E5DEC9]">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9C7228]">
                Carnet Santé du Domaine · {highlightedClient.city}
              </p>
              <h3 className="font-serif text-2xl font-semibold text-[#0E281B]">
                {highlightedClient.name}
              </h3>
            </div>
            <span className="text-xs font-mono text-[#647068]">{highlightedClient.address}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="bg-[#FAF8F3] border border-[#E5DEC9] rounded-lg p-3.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#647068]">
                <Trees className="w-4 h-4 text-[#9C7228]" />
                <span>Patrimoine oléicole</span>
              </div>
              <p className="font-serif text-2xl font-bold text-[#0E281B] tabular-nums mt-1">
                {highlightedClient.oliveTreesCount} oliviers
              </p>
            </div>

            <div className="bg-[#FAF8F3] border border-[#E5DEC9] rounded-lg p-3.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#647068]">
                <ShieldAlert className="w-4 h-4 text-[#9C7228]" />
                <span>Réglementation OLD 06</span>
              </div>
              <p className="font-serif text-2xl font-bold text-[#0E281B] tabular-nums mt-1">
                {latestVisit
                  ? `${latestVisit.oldScorePercent}% conforme`
                  : highlightedClient.isOldZone
                    ? 'Zone soumise OLD'
                    : 'Hors zone boisée'}
              </p>
            </div>

            <div className="bg-[#FAF8F3] border border-[#E5DEC9] rounded-lg p-3.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#647068]">
                <Droplets className="w-4 h-4 text-[#9C7228]" />
                <span>Arrosage automatique</span>
              </div>
              <p className="font-serif text-2xl font-bold text-[#0E281B] mt-1">
                {highlightedClient.hasAutoIrrigation ? 'Réseau actif' : 'Non équipé'}
              </p>
            </div>
          </div>

          {latestVisit && (
            <div className="mt-4 bg-[#F3EFE5] border border-[#E5DEC9] rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-mono font-semibold text-[#9C7228] tabular-nums">
                  Dernier compte rendu terrain · {latestVisit.date} · Durée{' '}
                  {formatHumanDuration(latestVisit.durationSeconds)}
                </p>
                <p className="text-sm text-[#1A211D] mt-1">{latestVisit.notes}</p>
              </div>
              <span className="text-xs font-mono font-semibold text-[#1E6B43] shrink-0 tabular-nums">
                Récolte est. {latestVisit.estimatedHarvestKg} kg
              </span>
            </div>
          )}
        </section>
      )}

      {/* Devis, Factures & Alertes Saisonnières */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          {/* Devis du domaine */}
          <section className="bg-white border border-[#E5DEC9] rounded-xl p-5 md:p-6">
            <h3 className="font-serif text-2xl font-semibold text-[#0E281B] mb-1">
              Vos devis &amp; validations ({visibleOwnerQuotes.length})
            </h3>
            <p className="text-xs text-[#647068] mb-4">
              Dépliez le détail des postes puis cliquez sur « Accepter ce devis » pour confirmer
              directement dans /admin.
            </p>

            {visibleOwnerQuotes.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[#E5DEC9] bg-[#FAF8F3] p-5 text-center text-xs text-[#647068]">
                Aucun devis associé à cette propriété.
              </div>
            ) : (
              <div className="space-y-3">
                {visibleOwnerQuotes.map((quote) => {
                  const totals = calculateDocumentTotals(quote.lines, quote.vatRate);
                  const canAccept = quote.status === 'Envoyé' || quote.status === 'Brouillon';
                  const isExpanded = Boolean(expandedQuoteIds[quote.id]);

                  return (
                    <article
                      key={quote.id}
                      className="rounded-xl border border-[#E5DEC9] bg-[#FAF8F3] p-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="text-xs font-mono text-[#9C7228] font-semibold">
                            {quote.number} · {quote.createdAt} · Statut : {quote.status}
                          </div>
                          <h4 className="font-serif text-xl font-semibold text-[#0E281B] mt-0.5">
                            {quote.title}
                          </h4>
                          <p className="text-xs text-[#647068] mt-0.5">
                            {quote.clientName} ({quote.clientCity}) · {quote.lines.length} poste(s)
                          </p>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                          <span className="font-serif text-2xl font-bold text-[#0E281B] tabular-nums">
                            {formatEuro(totals.totalTTC)}
                          </span>
                          {canAccept ? (
                            <button
                              type="button"
                              onClick={() => onAcceptQuote(quote.id)}
                              className="min-h-[44px] px-4 rounded-lg bg-[#9C7228] text-white text-xs font-semibold hover:bg-[#0E281B] transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
                            >
                              <Check className="w-4 h-4" />
                              <span>Accepter ce devis</span>
                            </button>
                          ) : (
                            <span className="text-xs font-semibold text-[#1E6B43]">
                              {quote.status === 'Accepté' ? 'Devis accepté' : quote.status}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-[#E5DEC9]">
                        <button
                          type="button"
                          onClick={() => toggleQuoteDetails(quote.id)}
                          aria-expanded={isExpanded}
                          className="min-h-[36px] text-xs font-semibold text-[#0E281B] hover:text-[#9C7228] inline-flex items-center gap-1"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="w-4 h-4" />
                              <span>Masquer le détail des prestations</span>
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4" />
                              <span>Voir le détail des prestations ({quote.lines.length})</span>
                            </>
                          )}
                        </button>

                        {isExpanded && (
                          <div className="mt-3 bg-white border border-[#E5DEC9] rounded-lg p-3 space-y-2">
                            {quote.lines.map((line) => (
                              <div
                                key={line.id}
                                className="flex items-start justify-between gap-3 text-xs text-[#3E4A43] pb-2 last:pb-0 border-b last:border-b-0 border-[#F3EFE5]"
                              >
                                <span>
                                  <strong className="text-[#0E281B] font-mono tabular-nums">
                                    {line.quantity} {line.unit}
                                  </strong>{' '}
                                  — {line.label}
                                </span>
                                <span className="font-mono font-semibold text-[#0E281B] tabular-nums shrink-0">
                                  {formatEuro(line.quantity * line.unitPriceHT)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {/* Factures du domaine */}
          <section className="bg-white border border-[#E5DEC9] rounded-xl p-5 md:p-6">
            <div className="flex items-center gap-2 mb-3">
              <FileCheck2 className="w-5 h-5 text-[#9C7228]" />
              <h3 className="font-serif text-2xl font-semibold text-[#0E281B]">
                Factures &amp; justificatifs ({visibleOwnerInvoices.length})
              </h3>
            </div>
            {visibleOwnerInvoices.length === 0 ? (
              <p className="text-xs text-[#647068]">
                Aucune facture émise sur la sélection actuelle.
              </p>
            ) : (
              <div className="space-y-2.5">
                {visibleOwnerInvoices.map((inv) => {
                  const totals = calculateDocumentTotals(inv.lines, inv.vatRate);
                  return (
                    <div
                      key={inv.id}
                      className="rounded-lg border border-[#E5DEC9] bg-[#FAF8F3] px-4 py-3 flex items-center justify-between gap-3"
                    >
                      <div>
                        <p className="text-xs font-mono text-[#9C7228] font-semibold">
                          {inv.number} · Émise le {inv.issuedAt}
                        </p>
                        <p className="text-sm font-semibold text-[#0E281B]">{inv.title}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-serif text-xl font-bold text-[#0E281B] tabular-nums">
                          {formatEuro(totals.totalTTC)}
                        </p>
                        <p
                          className={`text-xs font-semibold ${
                            inv.status === 'Payée' ? 'text-[#1E6B43]' : 'text-[#9C7228]'
                          }`}
                        >
                          {inv.status}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Alertes saisonnières Grasse 06 */}
        <section className="lg:col-span-5 bg-white border border-[#E5DEC9] rounded-xl p-5 md:p-6 h-fit">
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-5 h-5 text-[#9C7228]" />
            <h3 className="font-serif text-2xl font-semibold text-[#0E281B]">
              Rappels saisonniers (06)
            </h3>
          </div>
          <p className="text-xs text-[#647068] mb-4">
            Recommandations adaptées au calendrier agricole et réglementaire du Pays de Grasse.
          </p>

          <div className="space-y-3">
            {seasonalAlerts.map((alert) => (
              <article
                key={alert.id}
                className="rounded-xl border border-[#E5DEC9] bg-[#FAF8F3] p-4"
              >
                <p className="text-xs font-mono text-[#9C7228] font-semibold">
                  {alert.seasonTag} · {alert.urgency}
                </p>
                <h4 className="font-serif text-lg font-semibold text-[#0E281B] mt-1">
                  {alert.title}
                </h4>
                <p className="text-xs text-[#3E4A43] mt-1 leading-relaxed mb-3">
                  {alert.description}
                </p>
                <button
                  type="button"
                  onClick={() => onRequestAlert(alert.recommendedService, alert.title)}
                  className="w-full min-h-[44px] px-3.5 rounded-lg border border-[#0E281B] bg-white text-xs font-semibold text-[#0E281B] hover:bg-[#0E281B] hover:text-[#EBD9B3] transition-colors inline-flex items-center justify-center gap-1.5"
                >
                  <Sprout className="w-4 h-4" />
                  <span>Demander cette intervention</span>
                </button>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
