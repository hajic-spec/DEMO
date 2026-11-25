import React from 'react';
import { Printer, X } from 'lucide-react';
import { COMPANY_INFO } from '../../data/seedData';
import type { Invoice, Quote } from '../../types/relief';
import { calculateDocumentTotals, calculateLineTotalHT, formatEuro } from '../../utils/business';
import { ReliefEmblem } from '../ReliefLogo';

interface PrintDocumentModalProps {
  mode: 'quote' | 'invoice';
  doc: Quote | Invoice;
  onClose: () => void;
}

export const PrintDocumentModal: React.FC<PrintDocumentModalProps> = ({
  mode,
  doc,
  onClose,
}) => {
  const totals = calculateDocumentTotals(doc.lines, doc.vatRate);
  const isQuote = mode === 'quote';
  const quoteDoc = isQuote ? (doc as Quote) : null;
  const invoiceDoc = !isQuote ? (doc as Invoice) : null;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#091B12]/75 backdrop-blur-sm flex items-start justify-center p-4 md:p-8 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={isQuote ? `Aperçu devis ${doc.number}` : `Aperçu facture ${doc.number}`}
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barre d'actions non imprimée */}
        <div className="no-print bg-[#F3EFE5] border-b border-[#E5DEC9] px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="text-sm font-semibold text-[#0E281B]">
            {isQuote ? `Devis ${doc.number}` : `Facture ${doc.number}`} — Format A4 prêt à
            imprimer / PDF
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded bg-[#0E281B] text-white text-xs font-semibold hover:bg-[#163B29]"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer / Exporter en PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer l'aperçu"
              className="w-9 h-9 rounded border border-[#E5DEC9] bg-white inline-flex items-center justify-center text-[#0E281B] hover:bg-[#FAF8F3]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Feuille A4 imprimable */}
        <div id="print-sheet" className="p-8 md:p-12 bg-white text-[#1A211D]">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-8 border-b border-[#E5DEC9]">
            <div className="flex items-start gap-3.5">
              <ReliefEmblem className="w-14 h-14 shrink-0" />
              <div>
                <h2 className="font-serif text-3xl font-bold text-[#0E281B] tracking-wide leading-none">
                  RELIEF <span className="text-[#9C7228]">PAYSAGE</span>
                </h2>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#647068] mt-1">
                  Création · Entretien · Élagage · Oléiculture
                </p>
                <div className="text-xs text-[#3E4A43] mt-3 leading-relaxed">
                  <strong>{COMPANY_INFO.legalName}</strong>
                  <br />
                  {COMPANY_INFO.address}
                  <br />
                  Tél. : {COMPANY_INFO.phoneDisplay} · {COMPANY_INFO.email}
                  <br />
                  SIREN : {COMPANY_INFO.siren} · SIRET : {COMPANY_INFO.siret}
                  <br />
                  {COMPANY_INFO.rcs} · APE : {COMPANY_INFO.ape}
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9C7228] mb-1">
                {isQuote ? 'Proposition de devis' : 'Facture'}
              </div>
              <div className="font-mono text-2xl font-bold text-[#0E281B] tabular-nums">
                {doc.number}
              </div>
              <div className="text-xs text-[#3E4A43] mt-2 space-y-0.5 tabular-nums">
                {quoteDoc && (
                  <>
                    <div>Émis le : {quoteDoc.createdAt}</div>
                    <div>Valable jusqu’au : {quoteDoc.validUntil}</div>
                  </>
                )}
                {invoiceDoc && (
                  <>
                    <div>Émise le : {invoiceDoc.issuedAt}</div>
                    <div>Échéance : {invoiceDoc.dueAt}</div>
                    {invoiceDoc.quoteNumber && (
                      <div>Réf. devis : {invoiceDoc.quoteNumber}</div>
                    )}
                    <div>Règlement : {invoiceDoc.paymentMethod}</div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-[#E5DEC9]">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#647068] mb-1">
                Client / Propriété
              </div>
              <div className="text-sm font-semibold text-[#0E281B]">{doc.clientName}</div>
              <div className="text-xs text-[#3E4A43] mt-1">
                {doc.clientAddress ? `${doc.clientAddress} · ` : ''}
                {doc.clientCity}
                <br />
                Tél. : {doc.clientPhone}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#647068] mb-1">
                Objet de l’intervention
              </div>
              <div className="text-sm font-semibold text-[#0E281B]">{doc.title}</div>
            </div>
          </div>

          <div className="py-6">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-[#0E281B] text-left text-xs uppercase tracking-wider text-[#647068]">
                  <th className="py-2.5 pr-4">Désignation des prestations</th>
                  <th className="py-2.5 px-3 text-right">Qté</th>
                  <th className="py-2.5 px-3">Unité</th>
                  <th className="py-2.5 px-3 text-right">P.U. HT</th>
                  <th className="py-2.5 pl-3 text-right">Total HT</th>
                </tr>
              </thead>
              <tbody>
                {doc.lines.map((line) => (
                  <tr key={line.id} className="border-b border-[#E5DEC9]">
                    <td className="py-3 pr-4 text-[#1A211D]">{line.label}</td>
                    <td className="py-3 px-3 text-right font-mono-num">{line.quantity}</td>
                    <td className="py-3 px-3 text-[#647068]">{line.unit}</td>
                    <td className="py-3 px-3 text-right font-mono-num">
                      {formatEuro(line.unitPriceHT)}
                    </td>
                    <td className="py-3 pl-3 text-right font-mono-num font-semibold">
                      {formatEuro(calculateLineTotalHT(line.quantity, line.unitPriceHT))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-4">
            <div className="text-xs text-[#3E4A43] max-w-md space-y-2">
              {quoteDoc?.notes && (
                <div>
                  <strong className="text-[#0E281B]">Conditions &amp; remarques :</strong>{' '}
                  {quoteDoc.notes}
                </div>
              )}
              {doc.vatRate === 0 && (
                <div className="font-medium text-[#0E281B]">
                  TVA non applicable, article 293 B du Code Général des Impôts.
                </div>
              )}
              {invoiceDoc && (
                <div className="text-[11px] text-[#647068]">
                  En cas de retard de paiement, pénalité égale à 3 fois le taux d’intérêt légal et
                  indemnité forfaitaire pour frais de recouvrement de 40 € (art. L441-10 C. com.).
                </div>
              )}
            </div>

            <div className="w-full sm:w-64 bg-[#FAF8F3] border border-[#E5DEC9] rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#647068]">Total HT</span>
                <span className="font-mono-num font-semibold">{formatEuro(totals.totalHT)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#647068]">TVA ({doc.vatRate}%)</span>
                <span className="font-mono-num">{formatEuro(totals.totalTVA)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#E5DEC9] text-base font-bold text-[#0E281B]">
                <span>Total TTC</span>
                <span className="font-mono-num text-[#9C7228]">{formatEuro(totals.totalTTC)}</span>
              </div>
            </div>
          </div>

          {isQuote && (
            <div className="mt-10 pt-6 border-t border-[#E5DEC9] grid grid-cols-2 gap-8 text-xs text-[#647068]">
              <div>
                <div className="font-semibold text-[#0E281B] mb-8">
                  Pour Relief Paysage — Jason Claude
                </div>
                <div className="border-b border-dashed border-[#E5DEC9]" />
              </div>
              <div>
                <div className="font-semibold text-[#0E281B] mb-8">
                  Bon pour accord client (date et signature) :
                </div>
                <div className="border-b border-dashed border-[#E5DEC9]" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
