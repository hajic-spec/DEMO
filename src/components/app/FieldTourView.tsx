import React from 'react';
import {
  Check,
  MessageCircle,
  Navigation,
  Pause,
  Play,
  RotateCcw,
  Save,
} from 'lucide-react';
import type { ClientProperty, PlanningEvent, Quote } from '../../types/relief';
import {
  buildGoogleMapsDirectionsUrl,
  formatStopwatchDuration,
} from '../../utils/appLogic';
import { buildWhatsAppTemplate, formatWhatsAppUrl } from '../../utils/business';

interface FieldTourViewProps {
  events: PlanningEvent[];
  clients: ClientProperty[];
  quotes: Quote[];
  activeEventId: string;
  onSelectActiveEvent: (eventId: string) => void;
  timerRunning: boolean;
  elapsedSeconds: number;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onSaveTimerToLog: () => void;
  onToggleEventDone: (eventId: string) => void;
}

export const FieldTourView: React.FC<FieldTourViewProps> = ({
  events,
  clients,
  quotes,
  activeEventId,
  onSelectActiveEvent,
  timerRunning,
  elapsedSeconds,
  onToggleTimer,
  onResetTimer,
  onSaveTimerToLog,
  onToggleEventDone,
}) => {
  const activeEvent = events.find((e) => e.id === activeEventId) || events[0];
  const pendingCount = events.filter((e) => !e.completed).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Chrono chantier */}
      <section className="lg:col-span-5 bg-[#0E281B] text-[#FAF8F3] rounded-xl p-5 md:p-6 flex flex-col justify-between border border-[#CFA75B]/25">
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#CFA75B]">
              Chrono Chantier Live
            </span>
            <span className="font-mono text-xs text-[#EBD9B3]/85">
              {timerRunning ? 'En cours' : elapsedSeconds > 0 ? 'En pause' : 'Prêt'}
            </span>
          </div>

          <div className="mb-3">
            <label
              htmlFor="active-stop-select"
              className="block text-[11px] uppercase tracking-[0.12em] text-[#EBD9B3]/70 mb-1"
            >
              Chantier chronométré
            </label>
            <select
              id="active-stop-select"
              value={activeEvent?.id || ''}
              onChange={(e) => onSelectActiveEvent(e.target.value)}
              className="w-full min-h-[44px] px-3 rounded-lg bg-[#091B12] border border-[#CFA75B]/35 text-sm text-white focus:outline-none focus:border-[#CFA75B]"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.clientName} · {ev.city} ({ev.timeSlot})
                </option>
              ))}
            </select>
          </div>

          <div className="font-mono text-5xl font-bold text-white tabular-nums tracking-wider my-4">
            {formatStopwatchDuration(elapsedSeconds)}
          </div>

          {activeEvent && (
            <div className="bg-white/[0.07] border border-white/10 rounded-lg p-3.5 mb-5">
              <p className="text-[11px] text-[#CFA75B] font-semibold uppercase tracking-[0.12em]">
                {activeEvent.type}
              </p>
              <p className="text-sm font-semibold text-white mt-0.5">
                {activeEvent.clientName}
              </p>
              <p className="text-xs text-[#EBD9B3]/80 mt-0.5">
                {activeEvent.date} · {activeEvent.timeSlot} · {activeEvent.city}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onToggleTimer}
              className={`min-h-[48px] px-4 rounded-lg font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors ${
                timerRunning
                  ? 'bg-[#B5893A] text-white'
                  : 'bg-[#CFA75B] text-[#091B12] hover:bg-[#EBD9B3]'
              }`}
            >
              {timerRunning ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>{elapsedSeconds > 0 ? 'Reprendre' : 'Démarrer'}</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onResetTimer}
              className="min-h-[48px] px-4 rounded-lg border border-white/25 bg-white/10 text-white font-semibold text-sm inline-flex items-center justify-center gap-2 hover:bg-white/20"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Zéro</span>
            </button>
          </div>

          <button
            type="button"
            disabled={elapsedSeconds < 1 || !activeEvent}
            onClick={onSaveTimerToLog}
            className="w-full min-h-[44px] px-4 rounded-lg border border-[#CFA75B]/40 bg-[#091B12] text-[#EBD9B3] text-xs font-semibold inline-flex items-center justify-center gap-2 hover:bg-[#CFA75B]/15 disabled:opacity-45 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Enregistrer cette durée au relevé chantier</span>
          </button>
        </div>
      </section>

      {/* Liste tournée du jour */}
      <section className="lg:col-span-7 bg-white border border-[#E5DEC9] rounded-xl p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-[#0E281B]">
              Tournée planifiée ({pendingCount} restante{pendingCount > 1 ? 's' : ''})
            </h2>
            <p className="text-xs text-[#647068]">
              Synchronisée avec votre agenda /admin · Touchez une intervention pour la cibler.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {events.map((ev) => {
            const matchingClient = clients.find((c) => c.name === ev.clientName);
            const matchingQuote = quotes.find((q) => q.clientName === ev.clientName);
            const phone = matchingClient?.phone || matchingQuote?.clientPhone || '';
            const address =
              matchingClient?.address || matchingQuote?.clientAddress || ev.city;
            const mapsUrl = buildGoogleMapsDirectionsUrl(address, ev.city);
            const arrivalWaUrl = formatWhatsAppUrl(
              phone,
              buildWhatsAppTemplate('chantier', {
                clientName: ev.clientName,
                city: ev.city,
                service: ev.type,
                dateStr: `${ev.date} (${ev.timeSlot})`,
              })
            );
            const isSelected = activeEvent?.id === ev.id;

            return (
              <article
                key={ev.id}
                className={`rounded-xl border p-4 transition-colors ${
                  ev.completed
                    ? 'bg-[#FAF8F3] border-[#E5DEC9] opacity-75'
                    : isSelected
                      ? 'bg-[#F3EFE5] border-[#B5893A]'
                      : 'bg-white border-[#E5DEC9]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => onSelectActiveEvent(ev.id)}
                    className="text-left flex-1 min-w-0"
                  >
                    <div className="text-xs font-mono text-[#9C7228] font-semibold">
                      {ev.date} · {ev.timeSlot} · {ev.city}
                    </div>
                    <h3
                      className={`font-serif text-xl font-semibold text-[#0E281B] mt-0.5 ${
                        ev.completed ? 'line-through' : ''
                      }`}
                    >
                      {ev.clientName}
                    </h3>
                    <p className="text-xs font-semibold text-[#3E4A43] mt-0.5">{ev.type}</p>
                    <p className="text-xs text-[#647068] mt-1 leading-relaxed">{ev.notes}</p>
                  </button>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Itinéraire GPS vers ${ev.clientName}`}
                      className="min-h-[44px] px-3 rounded-lg border border-[#E5DEC9] bg-white text-[#0E281B] text-xs font-semibold inline-flex items-center gap-1.5 hover:border-[#B5893A]"
                    >
                      <Navigation className="w-4 h-4 text-[#9C7228]" />
                      <span>GPS</span>
                    </a>
                    <a
                      href={arrivalWaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[44px] px-3 rounded-lg border border-[#E5DEC9] bg-white text-[#0E281B] text-xs font-semibold inline-flex items-center gap-1.5 hover:border-[#B5893A]"
                    >
                      <MessageCircle className="w-4 h-4 text-[#1E6B43]" />
                      <span>WhatsApp</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => onToggleEventDone(ev.id)}
                      className={`min-h-[44px] px-3.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors ${
                        ev.completed
                          ? 'bg-[#E7F5ED] text-[#1E6B43] border border-[#BCE3CB]'
                          : 'bg-[#0E281B] text-[#EBD9B3] hover:bg-[#9C7228] hover:text-white'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      <span>{ev.completed ? 'Terminée' : 'Valider fin'}</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
};
