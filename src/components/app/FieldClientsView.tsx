import React, { useMemo, useState } from 'react';
import { MapPin, MessageCircle, Navigation, Phone, Trees } from 'lucide-react';
import type { ClientProperty } from '../../types/relief';
import { buildGoogleMapsDirectionsUrl } from '../../utils/appLogic';
import { formatWhatsAppUrl } from '../../utils/business';

interface FieldClientsViewProps {
  clients: ClientProperty[];
  clientQuery: string;
  onChangeClientQuery: (query: string) => void;
  onOpenSurveyForClient: (clientId: string) => void;
}

type ClientFilter = 'all' | 'old' | 'olives';

export const FieldClientsView: React.FC<FieldClientsViewProps> = ({
  clients,
  clientQuery,
  onChangeClientQuery,
  onOpenSurveyForClient,
}) => {
  const [filter, setFilter] = useState<ClientFilter>('all');

  const visibleClients = useMemo(() => {
    const q = clientQuery.trim().toLowerCase();
    return clients.filter((c) => {
      if (filter === 'old' && !c.isOldZone) return false;
      if (filter === 'olives' && c.oliveTreesCount <= 0) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.accessNotes.toLowerCase().includes(q)
      );
    });
  }, [clients, clientQuery, filter]);

  return (
    <section className="bg-white border border-[#E5DEC9] rounded-xl p-5 md:p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-[#0E281B]">
            Terrains &amp; Accès ({visibleClients.length})
          </h2>
          <p className="text-xs text-[#647068]">
            Codes portail, zones OLD 06, points d’attention écologiques et navigation GPS directe.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div
            role="tablist"
            aria-label="Filtrer les propriétés"
            className="inline-flex p-1 rounded-lg bg-[#F3EFE5] border border-[#E5DEC9] shrink-0"
          >
            {(
              [
                { id: 'all', label: 'Tous' },
                { id: 'old', label: 'Zone OLD' },
                { id: 'olives', label: 'Oliviers' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                role="tab"
                aria-selected={filter === opt.id}
                onClick={() => setFilter(opt.id)}
                className={`min-h-[38px] px-3 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                  filter === opt.id
                    ? 'bg-[#0E281B] text-[#EBD9B3]'
                    : 'text-[#3E4A43] hover:text-[#0E281B]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <input
            type="search"
            value={clientQuery}
            onChange={(e) => onChangeClientQuery(e.target.value)}
            placeholder="Rechercher commune ou client…"
            className="w-full sm:w-64 min-h-[44px] px-3.5 rounded-lg border border-[#E5DEC9] bg-[#FAF8F3] text-sm focus:outline-none focus:border-[#B5893A]"
          />
        </div>
      </div>

      {visibleClients.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#E5DEC9] bg-[#FAF8F3] p-8 text-center text-sm text-[#647068]">
          Aucune propriété ne correspond à ce filtre.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleClients.map((cli) => {
            const mapsUrl = buildGoogleMapsDirectionsUrl(cli.address, cli.city);
            const waUrl = formatWhatsAppUrl(
              cli.phone,
              `Bonjour ${cli.name}, c'est Jason Claude (Relief Paysage). Je fais le point suite à notre intervention sur votre terrain à ${cli.city}.`
            );
            return (
              <article
                key={cli.id}
                className="rounded-xl border border-[#E5DEC9] bg-[#FAF8F3] p-4 flex flex-col justify-between gap-3"
              >
                <div>
                  <p className="text-xs font-mono text-[#9C7228] font-semibold tabular-nums">
                    {cli.city} · {cli.oliveTreesCount} oliviers ·{' '}
                    {cli.isOldZone ? 'Zone OLD' : 'Hors OLD'}
                  </p>
                  <h3 className="font-serif text-xl font-semibold text-[#0E281B] mt-1">
                    {cli.name}
                  </h3>
                  <p className="text-xs text-[#647068] mt-1 flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#9C7228]" />
                    <span>{cli.address}</span>
                  </p>
                  <p className="text-xs text-[#3E4A43] mt-2.5 bg-white border border-[#E5DEC9] rounded-lg p-2.5 leading-relaxed">
                    {cli.accessNotes}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E5DEC9]">
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[44px] rounded-lg border border-[#E5DEC9] bg-white text-xs font-semibold text-[#0E281B] inline-flex items-center justify-center gap-1.5 hover:border-[#B5893A]"
                  >
                    <Navigation className="w-3.5 h-3.5 text-[#9C7228]" />
                    <span>Itinéraire</span>
                  </a>
                  <a
                    href={`tel:${cli.phone.replace(/\s+/g, '')}`}
                    className="min-h-[44px] rounded-lg border border-[#E5DEC9] bg-white text-xs font-semibold text-[#0E281B] inline-flex items-center justify-center gap-1.5 hover:border-[#B5893A]"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#9C7228]" />
                    <span>Appeler</span>
                  </a>
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[44px] rounded-lg border border-[#E5DEC9] bg-white text-xs font-semibold text-[#0E281B] inline-flex items-center justify-center gap-1.5 hover:border-[#1E6B43]"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-[#1E6B43]" />
                    <span>WhatsApp</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => onOpenSurveyForClient(cli.id)}
                    className="min-h-[44px] rounded-lg bg-[#0E281B] text-[#EBD9B3] text-xs font-semibold inline-flex items-center justify-center gap-1.5 hover:bg-[#9C7228] hover:text-white transition-colors"
                  >
                    <Trees className="w-3.5 h-3.5" />
                    <span>Relevé</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};
