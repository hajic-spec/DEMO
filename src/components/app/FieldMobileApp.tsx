import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  CalendarClock,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  FileText,
  Lock,
  MapPin,
  MessageCircle,
  Minus,
  Phone,
  Plus,
  RotateCcw,
  ShieldAlert,
  Sprout,
  Trees,
  Users,
  Play,
  Pause,
} from 'lucide-react';
import { COMPANY_INFO } from '../../data/seedData';
import type { AdminStore, ClientProperty } from '../../types/relief';
import {
  buildExpressFieldQuote,
  calculateOldComplianceScore,
  estimateOliveHarvestKg,
  formatStopwatchDuration,
  getSeasonalAlertsForMonth,
  loadFieldLogs,
  saveFieldLogs,
  type AppMode,
  type FieldVisitLog,
  type OldChecklistState,
} from '../../utils/appLogic';
import {
  buildWhatsAppTemplate,
  calculateDocumentTotals,
  formatEuro,
  formatWhatsAppUrl,
} from '../../utils/business';
import { appendLeadToStore, loadAdminStore, saveAdminStore } from '../../utils/storage';
import { ReliefEmblem } from '../ReliefLogo';
import { OfflineIndicator, PWAInstallModalAndButton } from './PWAInstallBanner';

interface FieldMobileAppProps {
  onBackToSite: () => void;
  onOpenAdmin: () => void;
}

type TerrainTab = 'tournee' | 'releve' | 'express' | 'clients';

const DEFAULT_CHECKLIST: OldChecklistState = {
  brushCleared50m: true,
  canopySpacing3m: true,
  roofClearance3m: false,
  accessRoadCleared: true,
  debrisEvacuated: false,
};

export const FieldMobileApp: React.FC<FieldMobileAppProps> = ({
  onBackToSite,
  onOpenAdmin,
}) => {
  const [store, setStore] = useState<AdminStore>(() => loadAdminStore());
  const [fieldLogs, setFieldLogs] = useState<FieldVisitLog[]>(() => loadFieldLogs());
  const [appMode, setAppMode] = useState<AppMode>('terrain');
  const [terrainTab, setTerrainTab] = useState<TerrainTab>('tournee');
  const [toast, setToast] = useState<string | null>(null);

  // Stopwatch state
  const [timerRunning, setTimerRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [activeEventId, setActiveEventId] = useState<string>(
    () => store.events.find((e) => !e.completed)?.id || store.events[0]?.id || ''
  );

  // Field survey (Relevé) state
  const [surveyClientId, setSurveyClientId] = useState<string>(
    () => store.clients[0]?.id || ''
  );
  const [oliveCount, setOliveCount] = useState<number>(
    () => store.clients[0]?.oliveTreesCount ?? 14
  );
  const [oliveDensity, setOliveDensity] = useState<'faible' | 'moyenne' | 'abondante'>('moyenne');
  const [oldChecklist, setOldChecklist] = useState<OldChecklistState>(DEFAULT_CHECKLIST);
  const [irrigationOk, setIrrigationOk] = useState<boolean>(true);
  const [surveyNotes, setSurveyNotes] = useState<string>('');

  // Express quote state
  const [expressClientId, setExpressClientId] = useState<string>(
    () => store.clients[0]?.id || 'custom'
  );
  const [expressName, setExpressName] = useState<string>(
    () => store.clients[0]?.name || ''
  );
  const [expressPhone, setExpressPhone] = useState<string>(
    () => store.clients[0]?.phone || ''
  );
  const [expressCity, setExpressCity] = useState<string>(
    () => store.clients[0]?.city || 'Grasse'
  );
  const [expressOlives, setExpressOlives] = useState<number>(8);
  const [expressOldUnits, setExpressOldUnits] = useState<number>(4);
  const [expressIrrigationM, setExpressIrrigationM] = useState<number>(0);
  const [expressDebris, setExpressDebris] = useState<boolean>(true);
  const [expressNotes, setExpressNotes] = useState<string>('');

  // Clients directory search
  const [clientQuery, setClientQuery] = useState<string>('');

  // Owner (Propriétaire) selected client / quote view
  const [ownerNameFilter, setOwnerNameFilter] = useState<string>('all');

  useEffect(() => {
    if (!timerRunning) return;
    const id = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerRunning]);

  const showFeedback = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => {
      setToast((prev) => (prev === msg ? null : prev));
    }, 3800);
  };

  const commitStore = (next: AdminStore) => {
    setStore(next);
    saveAdminStore(next);
  };

  const selectedSurveyClient = useMemo(
    () => store.clients.find((c) => c.id === surveyClientId) || store.clients[0],
    [store.clients, surveyClientId]
  );

  const handleSelectSurveyClient = (clientId: string) => {
    setSurveyClientId(clientId);
    const found = store.clients.find((c) => c.id === clientId);
    if (found) {
      setOliveCount(found.oliveTreesCount);
      setIrrigationOk(found.hasAutoIrrigation);
    }
  };

  const handleSelectExpressClient = (val: string) => {
    setExpressClientId(val);
    if (val === 'custom') {
      setExpressName('');
      setExpressPhone('');
      setExpressCity('Grasse');
      return;
    }
    const found = store.clients.find((c) => c.id === val);
    if (found) {
      setExpressName(found.name);
      setExpressPhone(found.phone);
      setExpressCity(found.city);
      setExpressOlives(found.oliveTreesCount);
    }
  };

  const oldEvaluation = useMemo(
    () => calculateOldComplianceScore(oldChecklist),
    [oldChecklist]
  );
  const estimatedHarvestKg = useMemo(
    () => estimateOliveHarvestKg(oliveCount, oliveDensity),
    [oliveCount, oliveDensity]
  );

  const expressPreviewQuote = useMemo(
    () =>
      buildExpressFieldQuote({
        clientName: expressName || 'Client sur place',
        clientPhone: expressPhone,
        clientCity: expressCity || 'Grasse',
        oliveTreesCount: expressOlives,
        oldSurfaceHundreds: expressOldUnits,
        irrigationMeters: expressIrrigationM,
        includeDebrisEvacuation: expressDebris,
        notes: expressNotes,
        existingQuotes: store.quotes,
      }),
    [
      expressName,
      expressPhone,
      expressCity,
      expressOlives,
      expressOldUnits,
      expressIrrigationM,
      expressDebris,
      expressNotes,
      store.quotes,
    ]
  );
  const expressTotals = useMemo(
    () => calculateDocumentTotals(expressPreviewQuote.lines, expressPreviewQuote.vatRate),
    [expressPreviewQuote]
  );

  const toggleEventDone = (eventId: string) => {
    const updatedEvents = store.events.map((ev) =>
      ev.id === eventId ? { ...ev, completed: !ev.completed } : ev
    );
    commitStore({ ...store, events: updatedEvents });
    showFeedback('Statut de la visite synchronisé avec /admin.');
  };

  const saveFieldSurvey = () => {
    if (!selectedSurveyClient) return;
    const newLog: FieldVisitLog = {
      id: 'log-' + Date.now(),
      clientId: selectedSurveyClient.id,
      clientName: selectedSurveyClient.name,
      city: selectedSurveyClient.city,
      date: new Date().toISOString().slice(0, 10),
      durationSeconds: elapsedSeconds,
      oliveTreesPruned: oliveCount,
      estimatedHarvestKg,
      oldScorePercent: oldEvaluation.percent,
      irrigationChecked: irrigationOk,
      notes:
        surveyNotes.trim() ||
        `Relevé terrain : ${oliveCount} oliviers, OLD ${oldEvaluation.percent}%.`,
    };
    const nextLogs = [newLog, ...fieldLogs];
    setFieldLogs(nextLogs);
    saveFieldLogs(nextLogs);

    const updatedClients = store.clients.map((c) =>
      c.id === selectedSurveyClient.id
        ? {
            ...c,
            oliveTreesCount: oliveCount,
            hasAutoIrrigation: irrigationOk,
          }
        : c
    );
    commitStore({ ...store, clients: updatedClients });
    setSurveyNotes('');
    showFeedback(`Relevé enregistré pour ${selectedSurveyClient.name} (${oldEvaluation.percent}% OLD).`);
  };

  const handleSaveExpressQuote = (alsoOpenWhatsApp: boolean) => {
    if (!expressName.trim()) {
      showFeedback('Veuillez saisir le nom du client pour enregistrer le devis.');
      return;
    }
    const createdQuote = buildExpressFieldQuote({
      clientName: expressName,
      clientPhone: expressPhone,
      clientCity: expressCity,
      oliveTreesCount: expressOlives,
      oldSurfaceHundreds: expressOldUnits,
      irrigationMeters: expressIrrigationM,
      includeDebrisEvacuation: expressDebris,
      notes: expressNotes,
      existingQuotes: store.quotes,
    });
    commitStore({ ...store, quotes: [createdQuote, ...store.quotes] });
    showFeedback(
      `Devis ${createdQuote.number} (${formatEuro(expressTotals.totalTTC)}) enregistré et visible dans /admin.`
    );

    if (alsoOpenWhatsApp) {
      const msg = buildWhatsAppTemplate('devis', {
        clientName: createdQuote.clientName,
        city: createdQuote.clientCity,
        service: createdQuote.title,
        quoteNumber: createdQuote.number,
        totalTTC: expressTotals.totalTTC,
      });
      const url = formatWhatsAppUrl(createdQuote.clientPhone, msg);
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleOwnerAcceptQuote = (quoteId: string) => {
    const target = store.quotes.find((q) => q.id === quoteId);
    if (!target) return;
    const updatedQuotes = store.quotes.map((q) =>
      q.id === quoteId ? { ...q, status: 'Accepté' as const } : q
    );
    commitStore({ ...store, quotes: updatedQuotes });
    showFeedback(
      `Accord enregistré sur le devis ${target.number}. Jason Claude est notifié dans /admin.`
    );
  };

  const handleOwnerRequestAlert = (serviceTitle: string, alertTitle: string) => {
    const activeClient: ClientProperty | undefined =
      ownerNameFilter === 'all'
        ? store.clients[0]
        : store.clients.find((c) => c.name === ownerNameFilter) || store.clients[0];

    appendLeadToStore({
      name: activeClient?.name || 'Propriétaire ReliefApp',
      phone: activeClient?.phone || COMPANY_INFO.phoneDisplay,
      city: activeClient?.city || 'Grasse',
      service: serviceTitle,
      details: `Demande envoyée depuis ReliefApp Propriétaire (${alertTitle}).`,
      source: 'Site vitrine',
    });
    setStore(loadAdminStore());
    showFeedback(`Demande « ${alertTitle} » transmise à Jason Claude (/admin).`);
  };

  const filteredClients = useMemo(() => {
    const q = clientQuery.trim().toLowerCase();
    if (!q) return store.clients;
    return store.clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.accessNotes.toLowerCase().includes(q)
    );
  }, [store.clients, clientQuery]);

  const seasonalAlerts = useMemo(
    () => getSeasonalAlertsForMonth(new Date().getMonth() + 1),
    []
  );

  const visibleOwnerQuotes = useMemo(() => {
    if (ownerNameFilter === 'all') return store.quotes;
    return store.quotes.filter((q) => q.clientName === ownerNameFilter);
  }, [store.quotes, ownerNameFilter]);

  const activeEvent = store.events.find((e) => e.id === activeEventId) || store.events[0];

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#1A211D] flex flex-col pb-20 lg:pb-10 overflow-x-hidden">
      {/* Compact Sticky App Header (52px tall for mobile <= 15% budget) */}
      <header className="sticky top-0 z-30 h-[52px] bg-[#091B12] text-[#FAF8F3] border-b border-[#CFA75B]/25 px-4 md:px-8 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={onBackToSite}
            aria-label="Retour au site vitrine"
            className="w-9 h-9 rounded bg-white/10 hover:bg-white/20 inline-flex items-center justify-center text-[#EBD9B3] shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <ReliefEmblem className="w-7 h-7 shrink-0 hidden sm:block" />
          <div className="min-w-0">
            <span className="font-serif text-lg font-bold tracking-wide text-white truncate block leading-none">
              RELIEF<span className="text-[#CFA75B]">APP</span>
            </span>
            <span className="text-[10px] uppercase tracking-[0.12em] text-[#EBD9B3]/75 block leading-none mt-1 truncate">
              Grasse 06 · Terrain &amp; Client
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <PWAInstallModalAndButton />
          <button
            type="button"
            onClick={onOpenAdmin}
            className="inline-flex items-center gap-1.5 px-3 min-h-[36px] rounded border border-white/20 bg-white/10 text-xs font-semibold text-[#FAF8F3] hover:bg-white/20 whitespace-nowrap"
          >
            <Lock className="w-3.5 h-3.5 text-[#CFA75B]" />
            <span>/admin</span>
          </button>
        </div>
      </header>

      <OfflineIndicator />

      {/* Main Responsive Workspace (Multi-column on desktop, thumb-friendly stack on mobile) */}
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 md:px-8 pt-4 md:pt-7">
        {/* Scrollable Mode Switcher + Desktop Tab Switcher */}
        <div className="bg-white border border-[#E5DEC9] rounded-xl p-3 md:p-4 mb-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9C7228]">
                Formule 06 · Prototype Live
              </p>
              <h1 className="font-serif text-xl md:text-2xl font-semibold text-[#0E281B]">
                {appMode === 'terrain'
                  ? 'Mode Terrain (Jason Claude)'
                  : 'Mode Propriétaire (Carnet Jardin)'}
              </h1>
            </div>
          </div>

          <div
            role="tablist"
            aria-label="Basculer de mode applicatif"
            className="grid grid-cols-2 md:inline-flex gap-1 p-1 bg-[#F3EFE5] rounded-lg border border-[#E5DEC9]"
          >
            <button
              type="button"
              role="tab"
              aria-selected={appMode === 'terrain'}
              onClick={() => setAppMode('terrain')}
              className={`min-h-[44px] px-4 rounded-md text-xs md:text-sm font-semibold transition-colors whitespace-nowrap ${
                appMode === 'terrain'
                  ? 'bg-[#0E281B] text-[#EBD9B3]'
                  : 'text-[#3E4A43] hover:text-[#0E281B]'
              }`}
            >
              Mode Terrain (Gérant)
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={appMode === 'client'}
              onClick={() => setAppMode('client')}
              className={`min-h-[44px] px-4 rounded-md text-xs md:text-sm font-semibold transition-colors whitespace-nowrap ${
                appMode === 'client'
                  ? 'bg-[#0E281B] text-[#EBD9B3]'
                  : 'text-[#3E4A43] hover:text-[#0E281B]'
              }`}
            >
              Mode Propriétaire
            </button>
          </div>
        </div>

        {/* Toast confirmation */}
        {toast && (
          <div
            role="status"
            className="mb-5 bg-[#E7F5ED] border border-[#BCE3CB] text-[#1E6B43] rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2.5"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toast}</span>
          </div>
        )}

        {appMode === 'terrain' ? (
          <>
            {/* Desktop horizontal navigation tabs for Terrain (on mobile we use fixed bottom bar) */}
            <nav
              aria-label="Navigation Terrain Desktop"
              className="hidden lg:flex items-center gap-2 mb-6"
            >
              {(
                [
                  { id: 'tournee', label: 'Tournée & Chrono', icon: CalendarClock },
                  { id: 'releve', label: 'Relevé Oliviers & OLD 06', icon: Trees },
                  { id: 'express', label: 'Devis Express Terrain', icon: FileText },
                  { id: 'clients', label: 'Fiches Terrains & Accès', icon: Users },
                ] as const
              ).map((tab) => {
                const Icon = tab.icon;
                const active = terrainTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setTerrainTab(tab.id)}
                    className={`min-h-[44px] px-4 rounded-lg text-sm font-semibold inline-flex items-center gap-2 border transition-colors whitespace-nowrap ${
                      active
                        ? 'bg-[#0E281B] text-[#EBD9B3] border-[#0E281B]'
                        : 'bg-white text-[#3E4A43] border-[#E5DEC9] hover:border-[#B5893A]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* ==================== TAB 1 : TOURNEE & CHRONO ==================== */}
            {terrainTab === 'tournee' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Chrono chantier card */}
                <section className="lg:col-span-5 bg-[#0E281B] text-[#FAF8F3] rounded-xl p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#CFA75B]">
                        Chrono Chantier Live
                      </span>
                      <span className="font-mono text-xs text-[#EBD9B3]/80">
                        {timerRunning ? 'En cours' : 'En pause'}
                      </span>
                    </div>

                    <div className="font-mono text-4xl md:text-5xl font-bold text-white tabular-nums tracking-wider my-3">
                      {formatStopwatchDuration(elapsedSeconds)}
                    </div>

                    {activeEvent && (
                      <div className="bg-white/10 rounded-lg p-3.5 mb-5">
                        <p className="text-xs text-[#CFA75B] font-semibold uppercase tracking-[0.12em]">
                          Intervention sélectionnée
                        </p>
                        <p className="text-sm font-semibold text-white mt-0.5">
                          {activeEvent.clientName}
                        </p>
                        <p className="text-xs text-[#EBD9B3]/80 mt-0.5">
                          {activeEvent.type} · {activeEvent.city} · {activeEvent.timeSlot}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setTimerRunning((r) => !r)}
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
                          <span>Démarrer</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTimerRunning(false);
                        setElapsedSeconds(0);
                      }}
                      className="min-h-[48px] px-4 rounded-lg border border-white/25 bg-white/10 text-white font-semibold text-sm inline-flex items-center justify-center gap-2 hover:bg-white/20"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Réinitialiser</span>
                    </button>
                  </div>
                </section>

                {/* Liste tournée du jour */}
                <section className="lg:col-span-7 bg-white border border-[#E5DEC9] rounded-xl p-5 md:p-6">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div>
                      <h2 className="font-serif text-2xl font-semibold text-[#0E281B]">
                        Tournée planifiée ({store.events.filter((e) => !e.completed).length} à
                        faire)
                      </h2>
                      <p className="text-xs text-[#647068]">
                        Synchronisé en direct avec votre agenda /admin.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {store.events.map((ev) => {
                      const matchingClient = store.clients.find(
                        (c) => c.name === ev.clientName
                      );
                      const phone = matchingClient?.phone || '';
                      const arrivalWaUrl = formatWhatsAppUrl(
                        phone,
                        buildWhatsAppTemplate('chantier', {
                          clientName: ev.clientName,
                          city: ev.city,
                          service: ev.type,
                          dateStr: `${ev.date} (${ev.timeSlot})`,
                        })
                      );
                      return (
                        <article
                          key={ev.id}
                          className={`rounded-xl border p-4 transition-colors ${
                            ev.completed
                              ? 'bg-[#FAF8F3] border-[#E5DEC9] opacity-75'
                              : activeEventId === ev.id
                                ? 'bg-[#F3EFE5] border-[#B5893A]'
                                : 'bg-white border-[#E5DEC9]'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div
                              className="cursor-pointer flex-1"
                              onClick={() => setActiveEventId(ev.id)}
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
                              <p className="text-xs font-semibold text-[#3E4A43] mt-0.5">
                                {ev.type}
                              </p>
                              <p className="text-xs text-[#647068] mt-1 leading-relaxed">
                                {ev.notes}
                              </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 shrink-0">
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
                                onClick={() => toggleEventDone(ev.id)}
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
            )}

            {/* ==================== TAB 2 : RELEVE OLIVIERS & OLD 06 ==================== */}
            {terrainTab === 'releve' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <section className="lg:col-span-7 bg-white border border-[#E5DEC9] rounded-xl p-5 md:p-6 space-y-5">
                  <div>
                    <h2 className="font-serif text-2xl font-semibold text-[#0E281B]">
                      Relevé Oliviers &amp; Conformité OLD 06
                    </h2>
                    <p className="text-xs text-[#647068] mt-0.5">
                      Comptez les sujets sur place, vérifiez les points feu de forêt et enregistrez
                      directement dans la fiche terrain.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="survey-client"
                      className="block text-xs font-semibold text-[#0E281B] mb-1.5"
                    >
                      Propriété visitée
                    </label>
                    <select
                      id="survey-client"
                      value={surveyClientId}
                      onChange={(e) => handleSelectSurveyClient(e.target.value)}
                      className="w-full min-h-[44px] px-3.5 rounded-lg border border-[#E5DEC9] bg-[#FAF8F3] text-sm font-medium focus:outline-none focus:border-[#B5893A]"
                    >
                      {store.clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.city})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Compteur oliviers & récolte */}
                  <div className="bg-[#F3EFE5] border border-[#E5DEC9] rounded-xl p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9C7228]">
                          Oliviers comptés / taillés
                        </span>
                        <div className="font-serif text-3xl font-bold text-[#0E281B] tabular-nums mt-0.5">
                          {oliveCount} arbre{oliveCount > 1 ? 's' : ''}
                        </div>
                        <p className="text-xs text-[#3E4A43] tabular-nums mt-1">
                          Estimation récolte ({oliveDensity}) :{' '}
                          <strong className="text-[#0E281B]">{estimatedHarvestKg} kg</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          aria-label="Retirer un olivier"
                          onClick={() => setOliveCount((n) => Math.max(0, n - 1))}
                          className="w-12 h-12 rounded-lg bg-white border border-[#E5DEC9] text-[#0E281B] inline-flex items-center justify-center hover:border-[#0E281B]"
                        >
                          <Minus className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          aria-label="Ajouter un olivier"
                          onClick={() => setOliveCount((n) => n + 1)}
                          className="w-12 h-12 rounded-lg bg-[#0E281B] text-[#EBD9B3] inline-flex items-center justify-center hover:bg-[#9C7228] hover:text-white"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {(['faible', 'moyenne', 'abondante'] as const).map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setOliveDensity(lvl)}
                          className={`min-h-[40px] rounded-md text-xs font-semibold capitalize transition-colors ${
                            oliveDensity === lvl
                              ? 'bg-[#0E281B] text-[#EBD9B3]'
                              : 'bg-white border border-[#E5DEC9] text-[#3E4A43]'
                          }`}
                        >
                          Charge {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Checklist OLD 06 */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#0E281B]">
                        Points de contrôle OLD (Alpes-Maritimes 06)
                      </span>
                      <span className="font-mono text-xs font-bold text-[#9C7228] tabular-nums">
                        {oldEvaluation.percent}% · {oldEvaluation.label}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {(
                        [
                          {
                            key: 'brushCleared50m',
                            label: 'Débroussaillement strate basse dans les 50 m autour du bâti',
                          },
                          {
                            key: 'canopySpacing3m',
                            label: 'Mise à distance ≥ 3 m entre houppiers des arbres maintenus',
                          },
                          {
                            key: 'roofClearance3m',
                            label: 'Élagage des branches à moins de 3 m des façades et toitures',
                          },
                          {
                            key: 'accessRoadCleared',
                            label: 'Dégagement voie d’accès secours (gabarit 4 m libre)',
                          },
                          {
                            key: 'debrisEvacuated',
                            label: 'Broyage fin ou évacuation complète des rémanents',
                          },
                        ] as const
                      ).map((item) => {
                        const checked = oldChecklist[item.key];
                        return (
                          <button
                            key={item.key}
                            type="button"
                            onClick={() =>
                              setOldChecklist((prev) => ({
                                ...prev,
                                [item.key]: !prev[item.key],
                              }))
                            }
                            className={`w-full min-h-[48px] px-3.5 py-2.5 rounded-lg border text-left text-xs md:text-sm flex items-center gap-3 transition-colors ${
                              checked
                                ? 'bg-[#E7F5ED] border-[#BCE3CB] text-[#0E281B] font-medium'
                                : 'bg-[#FAF8F3] border-[#E5DEC9] text-[#3E4A43]'
                            }`}
                          >
                            <span
                              className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                                checked
                                  ? 'bg-[#1E6B43] text-white'
                                  : 'bg-white border border-[#C5BDA8]'
                              }`}
                            >
                              {checked && <Check className="w-3.5 h-3.5" />}
                            </span>
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Irrigation + Notes */}
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => setIrrigationOk((v) => !v)}
                      className={`w-full min-h-[44px] px-3.5 rounded-lg border text-left text-xs md:text-sm font-medium flex items-center justify-between ${
                        irrigationOk
                          ? 'bg-[#FAF8F3] border-[#B5893A] text-[#0E281B]'
                          : 'bg-white border-[#E5DEC9] text-[#647068]'
                      }`}
                    >
                      <span>Réseau d’arrosage automatique contrôlé &amp; sans fuite</span>
                      <span className="font-mono text-xs font-semibold text-[#9C7228]">
                        {irrigationOk ? 'Vérifié OK' : 'À contrôler'}
                      </span>
                    </button>

                    <div>
                      <label
                        htmlFor="survey-notes"
                        className="block text-xs font-semibold text-[#0E281B] mb-1"
                      >
                        Observations terrain (état sanitaire, accès, suite à prévoir)
                      </label>
                      <textarea
                        id="survey-notes"
                        rows={3}
                        value={surveyNotes}
                        onChange={(e) => setSurveyNotes(e.target.value)}
                        placeholder="Ex. : 3 oliviers avec bois sec, prévoir broyeur sur la restanque 2…"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5DEC9] bg-[#FAF8F3] text-sm focus:outline-none focus:border-[#B5893A] focus:bg-white"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={saveFieldSurvey}
                    className="w-full min-h-[48px] rounded-lg bg-[#0E281B] text-[#EBD9B3] text-sm font-semibold hover:bg-[#9C7228] hover:text-white transition-colors inline-flex items-center justify-center gap-2"
                  >
                    <ClipboardCheck className="w-4 h-4" />
                    <span>Enregistrer le relevé terrain</span>
                  </button>
                </section>

                {/* Historique des relevés */}
                <section className="lg:col-span-5 bg-white border border-[#E5DEC9] rounded-xl p-5 md:p-6">
                  <h3 className="font-serif text-xl font-semibold text-[#0E281B] mb-1">
                    Derniers relevés enregistrés
                  </h3>
                  <p className="text-xs text-[#647068] mb-4">
                    Conservés hors-ligne sur l’appareil et visibles dans le carnet client.
                  </p>
                  <div className="space-y-3">
                    {fieldLogs.map((log) => (
                      <article
                        key={log.id}
                        className="rounded-lg bg-[#FAF8F3] border border-[#E5DEC9] p-3.5"
                      >
                        <div className="flex items-center justify-between gap-2 text-xs font-mono text-[#9C7228]">
                          <span>{log.date}</span>
                          <span>
                            OLD {log.oldScorePercent}% · {log.oliveTreesPruned} oliviers
                          </span>
                        </div>
                        <p className="font-semibold text-sm text-[#0E281B] mt-1">
                          {log.clientName} ({log.city})
                        </p>
                        <p className="text-xs text-[#3E4A43] mt-1 leading-relaxed">
                          {log.notes}
                        </p>
                      </article>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {/* ==================== TAB 3 : DEVIS EXPRESS SUR PLACE ==================== */}
            {terrainTab === 'express' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <section className="lg:col-span-7 bg-white border border-[#E5DEC9] rounded-xl p-5 md:p-6 space-y-4">
                  <div>
                    <h2 className="font-serif text-2xl font-semibold text-[#0E281B]">
                      Devis Express sur place
                    </h2>
                    <p className="text-xs text-[#647068]">
                      Chiffrez en 30 secondes devant le client : le devis est créé dans /admin et
                      prêt à partir par WhatsApp.
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
                      onChange={(e) => handleSelectExpressClient(e.target.value)}
                      className="w-full min-h-[44px] px-3.5 rounded-lg border border-[#E5DEC9] bg-[#FAF8F3] text-sm"
                    >
                      {store.clients.map((c) => (
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
                        onChange={(e) => setExpressName(e.target.value)}
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
                        onChange={(e) => setExpressPhone(e.target.value)}
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
                        onChange={(e) => setExpressCity(e.target.value)}
                        className="w-full min-h-[44px] px-3 rounded-lg border border-[#E5DEC9] bg-[#FAF8F3] text-sm"
                      />
                    </div>
                  </div>

                  {/* Quick quantity steppers */}
                  <div className="space-y-2.5 pt-2">
                    {[
                      {
                        label: 'Taille raisonnée d’oliviers (65 €/arbre)',
                        value: expressOlives,
                        unit: 'arbres',
                        onChange: setExpressOlives,
                        step: 1,
                      },
                      {
                        label: 'Débroussaillement OLD 06 (130 € / 100 m²)',
                        value: expressOldUnits,
                        unit: '× 100 m²',
                        onChange: setExpressOldUnits,
                        step: 1,
                      },
                      {
                        label: 'Réseau goutte-à-goutte (6,50 € / mètre)',
                        value: expressIrrigationM,
                        unit: 'mètres',
                        onChange: setExpressIrrigationM,
                        step: 10,
                      },
                    ].map((row) => (
                      <div
                        key={row.label}
                        className="bg-[#FAF8F3] border border-[#E5DEC9] rounded-lg px-3.5 py-2.5 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="text-xs md:text-sm font-medium text-[#0E281B]">
                            {row.label}
                          </p>
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
                      onClick={() => setExpressDebris((d) => !d)}
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
                      onChange={(e) => setExpressNotes(e.target.value)}
                      placeholder="Accès broyeur, délai d'intervention souhaité…"
                      className="w-full min-h-[44px] px-3.5 rounded-lg border border-[#E5DEC9] bg-[#FAF8F3] text-sm"
                    />
                  </div>
                </section>

                {/* Live Quote Summary + Save/WhatsApp Actions */}
                <section className="lg:col-span-5 bg-[#0E281B] text-[#FAF8F3] rounded-xl p-6 flex flex-col justify-between">
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
                      TVA non applicable, article 293 B du CGI. Synchronisé immédiatement avec
                      l’onglet Devis de /admin et l’espace Propriétaire.
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    <button
                      type="button"
                      onClick={() => handleSaveExpressQuote(true)}
                      className="w-full min-h-[48px] px-4 rounded-lg bg-[#CFA75B] text-[#091B12] text-sm font-bold hover:bg-[#EBD9B3] transition-colors inline-flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Enregistrer &amp; Envoyer WhatsApp</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveExpressQuote(false)}
                      className="w-full min-h-[44px] px-4 rounded-lg border border-white/25 bg-white/10 text-white text-sm font-semibold hover:bg-white/20 transition-colors"
                    >
                      Enregistrer uniquement dans /admin
                    </button>
                  </div>
                </section>
              </div>
            )}

            {/* ==================== TAB 4 : FICHES CLIENTS & ACCES ==================== */}
            {terrainTab === 'clients' && (
              <section className="bg-white border border-[#E5DEC9] rounded-xl p-5 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                  <div>
                    <h2 className="font-serif text-2xl font-semibold text-[#0E281B]">
                      Terrains &amp; Accès ({filteredClients.length})
                    </h2>
                    <p className="text-xs text-[#647068]">
                      Codes portail, zones OLD 06, points d’attention écologiques et appel direct.
                    </p>
                  </div>
                  <input
                    type="search"
                    value={clientQuery}
                    onChange={(e) => setClientQuery(e.target.value)}
                    placeholder="Rechercher commune ou client…"
                    className="w-full sm:w-72 min-h-[44px] px-3.5 rounded-lg border border-[#E5DEC9] bg-[#FAF8F3] text-sm focus:outline-none focus:border-[#B5893A]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredClients.map((cli) => (
                    <article
                      key={cli.id}
                      className="rounded-xl border border-[#E5DEC9] bg-[#FAF8F3] p-4 flex flex-col justify-between gap-3"
                    >
                      <div>
                        <p className="text-xs font-mono text-[#9C7228] font-semibold">
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
                          href={`tel:${cli.phone.replace(/\s+/g, '')}`}
                          className="min-h-[44px] rounded-lg border border-[#E5DEC9] bg-white text-xs font-semibold text-[#0E281B] inline-flex items-center justify-center gap-1.5"
                        >
                          <Phone className="w-3.5 h-3.5 text-[#9C7228]" />
                          <span>Appeler</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            handleSelectSurveyClient(cli.id);
                            setTerrainTab('releve');
                          }}
                          className="min-h-[44px] rounded-lg bg-[#0E281B] text-[#EBD9B3] text-xs font-semibold inline-flex items-center justify-center gap-1.5"
                        >
                          <Trees className="w-3.5 h-3.5" />
                          <span>Relevé</span>
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          /* ==================== MODE PROPRIETAIRE (CLIENT) ==================== */
          <div className="space-y-6">
            {/* Sélecteur propriété / résumé carnet */}
            <section className="bg-[#0E281B] text-[#FAF8F3] rounded-xl p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-7">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#CFA75B] mb-1.5">
                  Carnet de propriété · Pays de Grasse (06)
                </p>
                <h2 className="font-serif text-2xl md:text-3xl font-semibold text-white mb-2">
                  Suivi de votre domaine &amp; validations en 1 clic
                </h2>
                <p className="text-sm text-[#FAF8F3]/80 leading-relaxed">
                  Consultez vos alertes saisonnières (oliviers, OLD incendie, arrosage), validez un
                  devis directement depuis votre téléphone et contactez Jason Claude.
                </p>
              </div>
              <div className="lg:col-span-5 bg-white/10 rounded-xl p-4 space-y-3">
                <label
                  htmlFor="owner-filter"
                  className="block text-xs font-semibold uppercase tracking-[0.12em] text-[#EBD9B3]"
                >
                  Propriété affichée (démo)
                </label>
                <select
                  id="owner-filter"
                  value={ownerNameFilter}
                  onChange={(e) => setOwnerNameFilter(e.target.value)}
                  className="w-full min-h-[44px] px-3 rounded-lg bg-[#091B12] border border-[#CFA75B]/40 text-white text-sm"
                >
                  <option value="all">Toutes les propriétés (vue démo complète)</option>
                  {store.clients.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.city})
                    </option>
                  ))}
                  {store.quotes
                    .filter((q) => !store.clients.some((c) => c.name === q.clientName))
                    .map((q) => (
                      <option key={q.id} value={q.clientName}>
                        {q.clientName} ({q.clientCity})
                      </option>
                    ))}
                </select>
                <div className="flex flex-wrap gap-2 pt-1">
                  <a
                    href={COMPANY_INFO.phoneHref}
                    className="flex-1 min-h-[44px] px-3 rounded-lg bg-[#CFA75B] text-[#091B12] text-xs font-bold inline-flex items-center justify-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Appeler Jason Claude</span>
                  </a>
                </div>
              </div>
            </section>

            {/* Devis en attente / Validation 1 clic */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <section className="lg:col-span-7 bg-white border border-[#E5DEC9] rounded-xl p-5 md:p-6">
                <h3 className="font-serif text-2xl font-semibold text-[#0E281B] mb-1">
                  Vos devis &amp; validations
                </h3>
                <p className="text-xs text-[#647068] mb-4">
                  Un clic sur « Accepter ce devis » met immédiatement à jour le portail /admin de
                  Relief Paysage.
                </p>

                <div className="space-y-3">
                  {visibleOwnerQuotes.map((quote) => {
                    const totals = calculateDocumentTotals(quote.lines, quote.vatRate);
                    const canAccept = quote.status === 'Envoyé' || quote.status === 'Brouillon';
                    return (
                      <article
                        key={quote.id}
                        className="rounded-xl border border-[#E5DEC9] bg-[#FAF8F3] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div>
                          <div className="text-xs font-mono text-[#9C7228] font-semibold">
                            {quote.number} · {quote.createdAt} · Statut : {quote.status}
                          </div>
                          <h4 className="font-serif text-xl font-semibold text-[#0E281B] mt-0.5">
                            {quote.title}
                          </h4>
                          <p className="text-xs text-[#647068] mt-0.5">
                            {quote.clientName} ({quote.clientCity}) · {quote.lines.length} ligne(s)
                          </p>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                          <span className="font-serif text-2xl font-bold text-[#0E281B] tabular-nums">
                            {formatEuro(totals.totalTTC)}
                          </span>
                          {canAccept ? (
                            <button
                              type="button"
                              onClick={() => handleOwnerAcceptQuote(quote.id)}
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
                      </article>
                    );
                  })}
                </div>
              </section>

              {/* Alertes saisonnières Grasse 06 */}
              <section className="lg:col-span-5 bg-white border border-[#E5DEC9] rounded-xl p-5 md:p-6">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldAlert className="w-5 h-5 text-[#9C7228]" />
                  <h3 className="font-serif text-2xl font-semibold text-[#0E281B]">
                    Rappels saisonniers (06)
                  </h3>
                </div>
                <p className="text-xs text-[#647068] mb-4">
                  Recommandations automatiques adaptées au calendrier du Pays de Grasse.
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
                        onClick={() =>
                          handleOwnerRequestAlert(alert.recommendedService, alert.title)
                        }
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
        )}
      </main>

      {/* Mobile Fixed Thumb-Zone Bottom Tab Bar (hidden on lg desktop, 64px height) */}
      {appMode === 'terrain' && (
        <nav
          aria-label="Navigation Terrain Mobile"
          className="lg:hidden fixed bottom-0 inset-x-0 z-30 h-16 bg-[#091B12] border-t border-[#CFA75B]/30 grid grid-cols-4"
        >
          {(
            [
              { id: 'tournee', label: 'Tournée', icon: Clock },
              { id: 'releve', label: 'Relevé', icon: Trees },
              { id: 'express', label: 'Express', icon: FileText },
              { id: 'clients', label: 'Clients', icon: Users },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const active = terrainTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTerrainTab(tab.id)}
                className={`min-h-[44px] flex flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors ${
                  active ? 'text-[#CFA75B]' : 'text-[#FAF8F3]/70'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
};
