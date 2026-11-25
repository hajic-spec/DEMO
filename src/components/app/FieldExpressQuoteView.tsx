import React from 'react';
import { MessageCircle, Minus, Plus } from 'lucide-react';
import type { ClientProperty, Quote } from '../../types/relief';
import { formatEuro } from '../../utils/business';

interface FieldExpressQuoteViewProps {
  clients: ClientProperty[];
  expressClientId: string;
  onSelectExpressClient: (val: string) => void;
  expressName: string;
  onChangeExpressName: (val: string) => void;
  expressPhone: string;
  onChangeExpressPhone: (val: string) => void;
  expressCity: string;
  onChangeExpressCity: (val: string) => void;
  expressOlives: number;
  onChangeExpressOlives: (val: number) => void;
  expressOldUnits: number;
  onChangeExpressOldUnits: (val: number) => void;
  expressIrrigationM: number;
  onChangeExpressIrrigationM: (val: number) => void;
  expressDebris: boolean;
  onToggleExpressDebris: () => void;
  expressNotes: string;
  onChangeExpressNotes: (val: string) => void;
  expressPreviewQuote: Quote;
  expressTotals: { totalHT: number; totalTVA: number; totalTTC: number };
  onSaveExpressQuote: (alsoOpenWhatsApp: boolean) => void;
}

export const FieldExpressQuoteView: React.FC<FieldExpressQuoteViewProps> = ({
  clients,
  expressClientId,
  onSelectExpressClient,
  expressName,
  onChangeExpressName,
  expressPhone,
  onChangeExpressPhone,
  expressCity,
  onChangeExpressCity,
  expressOlives,
  onChangeExpressOlives,
  expressOldUnits,
  onChangeExpressOldUnits,
  expressIrrigationM,
  onChangeExpressIrrigationM,
  expressDebris,
  onToggleExpressDebris,
  expressNotes,
  onChangeExpressNotes,
  expressPreviewQuote,
  expressTotals,
  onSaveExpressQuote,
}) => {
  const steppers = [
    {
      label: 'Taille raisonnée d’oliviers (65 €/arbre)',
      value: expressOlives,
      unit: 'arbres',
      onChange: onChangeExpressOlives,
      step: 1,
    },
    {
      label: 'Débroussaillement OLD 06 (130 € / 100 m²)',
      value: expressOldUnits,
      unit: '× 100 m²',
      onChange: onChangeExpressOldUnits,
      step: 1,
    },
    {
      label: 'Réseau goutte-à-goutte (6,50 € / mètre)',
      value: expressIrrigationM,
      unit: 'mètres',
      onChange: onChangeExpressIrrigationM,
      step: 10,
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Configurateur rapide */}
      <section className="lg:col-span-7 bg-white border border-[#E5DEC9] rounded-xl p-5 md:p-6 space-y-4">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-[#0E281B]">
            Devis Express sur place
          </h2>
          <p className="text-xs text-[#647068]">
            Chiffrez devant le client : le devis est créé dans /admin et prêt à partir par
            WhatsApp.
          </p>
        </div>

        <div>
          <label
            htmlFor="express-client-select"
            className="block text-xs font-semibold text-[#0E281B] mb-1"
          >
            Client existant ou nouveau prospect
          </label>
          <select
            id="express-client-select"
            value={expressClientId}
            onChange={(e) => onSelectExpressClient(e.target.value)}
            className="w-full min-h-[44px] px-3.5 rounded-lg border border-[#E5DEC9] bg-[#FAF8F3] text-sm"
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.city})
              </option>
            ))}
            <option value="custom">+ Nouveau client saisi manuellement</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label
              htmlFor="express-name"
              className="block text-xs font-semibold text-[#0E281B] mb-1"
            >
              Nom / Domaine *
            </label>
            <input
              id="express-name"
              type="text"
              value={expressName}
              onChange={(e) => onChangeExpressName(e.target.value)}
              className="w-full min-h-[44px] px-3 rounded-lg border border-[#E5DEC9] bg-[#FAF8F3] text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="express-phone"
              className="block text-xs font-semibold text-[#0E281B] mb-1"
            >
              Téléphone
            </label>
            <input
              id="express-phone"
              type="tel"
              value={expressPhone}
              onChange={(e) => onChangeExpressPhone(e.target.value)}
              className="w-full min-h-[44px] px-3 rounded-lg border border-[#E5DEC9] bg-[#FAF8F3] text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="express-city"
              className="block text-xs font-semibold text-[#0E281B] mb-1"
            >
              Commune
            </label>
            <input
              id="express-city"
              type="text"
              value={expressCity}
              onChange={(e) => onChangeExpressCity(e.target.value)}
              className="w-full min-h-[44px] px-3 rounded-lg border border-[#E5DEC9] bg-[#FAF8F3] text-sm"
            />
          </div>
        </div>

        <div className="space-y-2.5 pt-2">
          {steppers.map((row) => (
            <div
              key={row.label}
              className="bg-[#FAF8F3] border border-[#E5DEC9] rounded-lg px-3.5 py-2.5 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="text-xs md:text-sm font-medium text-[#0E281B]">{row.label}</p>
                <p className="text-xs font-mono text-[#9C7228] tabular-nums">
                  {row.value} {row.unit}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  aria-label={`Diminuer ${row.label}`}
                  onClick={() => row.onChange(Math.max(0, row.value - row.step))}
                  className="w-11 h-11 rounded-lg bg-white border border-[#E5DEC9] text-[#0E281B] inline-flex items-center justify-center"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  aria-label={`Augmenter ${row.label}`}
                  onClick={() => row.onChange(row.value + row.step)}
                  className="w-11 h-11 rounded-lg bg-[#0E281B] text-[#EBD9B3] inline-flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={onToggleExpressDebris}
            className={`w-full min-h-[44px] px-3.5 rounded-lg border text-left text-xs md:text-sm font-medium flex items-center justify-between ${
              expressDebris
                ? 'bg-[#E7F5ED] border-[#BCE3CB] text-[#0E281B]'
                : 'bg-[#FAF8F3] border-[#E5DEC9] text-[#647068]'
            }`}
          >
            <span>Broyage sur place ou évacuation des rémanents (+ 95 €)</span>
            <span className="font-mono text-xs font-semibold">
              {expressDebris ? 'Inclus' : 'Non inclus'}
            </span>
          </button>
        </div>

        <div>
          <label
            htmlFor="express-notes"
            className="block text-xs font-semibold text-[#0E281B] mb-1"
          >
            Notes complémentaires
          </label>
          <input
            id="express-notes"
            type="text"
            value={expressNotes}
            onChange={(e) => onChangeExpressNotes(e.target.value)}
            placeholder="Accès broyeur, délai d'intervention souhaité…"
            className="w-full min-h-[44px] px-3.5 rounded-lg border border-[#E5DEC9] bg-[#FAF8F3] text-sm"
          />
        </div>
      </section>

      {/* Aperçu live du chiffrage */}
      <section className="lg:col-span-5 bg-[#0E281B] text-[#FAF8F3] rounded-xl p-6 flex flex-col justify-between border border-[#CFA75B]/25">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#CFA75B] mb-1">
            Aperçu du devis {expressPreviewQuote.number}
          </p>
          <div className="font-serif text-4xl font-bold text-[#EBD9B3] tabular-nums mb-4">
            {formatEuro(expressTotals.totalTTC)}
          </div>
          <ul className="space-y-2.5 border-t border-white/15 pt-4 mb-5 text-xs md:text-sm">
            {expressPreviewQuote.lines.map((line) => (
              <li
                key={line.id}
                className="flex items-start justify-between gap-3 text-[#FAF8F3]/90"
              >
                <span>
                  {line.quantity} {line.unit} · {line.label}
                </span>
                <span className="font-mono tabular-nums text-[#EBD9B3] shrink-0">
                  {formatEuro(line.quantity * line.unitPriceHT)}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-[#EBD9B3]/75 mb-6">
            TVA non applicable, article 293 B du CGI. Synchronisé immédiatement avec l’onglet Devis
            de /admin et l’espace Propriétaire.
          </p>
        </div>

        <div className="space-y-2.5">
          <button
            type="button"
            onClick={() => onSaveExpressQuote(true)}
            className="w-full min-h-[48px] px-4 rounded-lg bg-[#CFA75B] text-[#091B12] text-sm font-bold hover:bg-[#EBD9B3] transition-colors inline-flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Enregistrer &amp; Envoyer WhatsApp</span>
          </button>
          <button
            type="button"
            onClick={() => onSaveExpressQuote(false)}
            className="w-full min-h-[44px] px-4 rounded-lg border border-white/25 bg-white/10 text-white text-sm font-semibold hover:bg-white/20 transition-colors"
          >
            Enregistrer uniquement dans /admin
          </button>
        </div>
      </section>
    </div>
  );
};
