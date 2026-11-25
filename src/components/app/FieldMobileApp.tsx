import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  FileText,
  Lock,
  Trees,
  Users,
} from 'lucide-react';
import { COMPANY_INFO } from '../../data/seedData';
import type { AdminStore, ClientProperty } from '../../types/relief';
import {
  buildExpressFieldQuote,
  calculateOldComplianceScore,
  computeTerrainDayMetrics,
  estimateOliveHarvestKg,
  formatHumanDuration,
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
import {
  hasSessionUnlock,
  isModuleUnlockedInPreview,
  isPaidLicenseActive,
} from '../../utils/accessControl';
import { appendLeadToStore, loadAdminStore, saveAdminStore } from '../../utils/storage';
import { ModulePreviewLock, PreviewBanner, UnlockLicenseModal } from '../PreviewBanner';
import { ReliefEmblem } from '../ReliefLogo';
import { FieldClientsView } from './FieldClientsView';
import { FieldExpressQuoteView } from './FieldExpressQuoteView';
import { FieldSurveyView } from './FieldSurveyView';
import { FieldTourView } from './FieldTourView';
import { OwnerPortalView } from './OwnerPortalView';
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
  const [unlocked, setUnlocked] = useState<boolean>(
    () => isPaidLicenseActive() || hasSessionUnlock('app')
  );
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockReason, setUnlockReason] = useState<string | null>(null);
  const [store, setStore] = useState<AdminStore>(() => loadAdminStore());
  const [fieldLogs, setFieldLogs] = useState<FieldVisitLog[]>(() => loadFieldLogs());
  const [appMode, setAppMode] = useState<AppMode>('terrain');
  const [terrainTab, setTerrainTab] = useState<TerrainTab>('tournee');
  const [toast, setToast] = useState<string | null>(null);

  // Chrono chantier
  const [timerRunning, setTimerRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [activeEventId, setActiveEventId] = useState<string>(
    () => store.events.find((e) => !e.completed)?.id || store.events[0]?.id || ''
  );

  // Relevé oliviers & OLD 06
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

  // Devis express
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

  // Répertoire terrains & espace propriétaire
  const [clientQuery, setClientQuery] = useState<string>('');
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
  const dayMetrics = useMemo(
    () => computeTerrainDayMetrics(store.events, fieldLogs, store.quotes),
    [store.events, fieldLogs, store.quotes]
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

  const requireFullUnlock = (reason: string): boolean => {
    if (unlocked) return true;
    setUnlockReason(reason);
    setShowUnlockModal(true);
    return false;
  };

  const handleToggleEventDone = (eventId: string) => {
    if (
      !requireFullUnlock(
        'La validation des interventions et la synchronisation avec /admin sont activées après souscription (Formule 06).'
      )
    ) {
      return;
    }
    const updatedEvents = store.events.map((ev) =>
      ev.id === eventId ? { ...ev, completed: !ev.completed } : ev
    );
    commitStore({ ...store, events: updatedEvents });
    showFeedback('Statut de la visite synchronisé avec /admin.');
  };

  const handleSaveTimerToLog = () => {
    if (
      !requireFullUnlock(
        'L’enregistrement des temps chronométrés dans le carnet chantier est réservé aux comptes activés.'
      )
    ) {
      return;
    }
    const activeEvent = store.events.find((e) => e.id === activeEventId) || store.events[0];
    if (!activeEvent || elapsedSeconds < 1) return;
    const matchingClient = store.clients.find((c) => c.name === activeEvent.clientName);

    const logEntry: FieldVisitLog = {
      id: 'log-time-' + Date.now(),
      clientId: matchingClient?.id || activeEvent.id,
      clientName: activeEvent.clientName,
      city: activeEvent.city,
      date: new Date().toISOString().slice(0, 10),
      durationSeconds: elapsedSeconds,
      oliveTreesPruned: matchingClient?.oliveTreesCount ?? 0,
      estimatedHarvestKg: estimateOliveHarvestKg(matchingClient?.oliveTreesCount ?? 0, 'moyenne'),
      oldScorePercent: oldEvaluation.percent,
      irrigationChecked: matchingClient?.hasAutoIrrigation ?? true,
      notes: `Temps chronométré (${formatHumanDuration(elapsedSeconds)}) sur ${activeEvent.type}.`,
    };
    const nextLogs = [logEntry, ...fieldLogs];
    setFieldLogs(nextLogs);
    saveFieldLogs(nextLogs);
    setTimerRunning(false);
    setElapsedSeconds(0);
    showFeedback(`Durée enregistrée pour ${activeEvent.clientName} dans les relevés terrain.`);
  };

  const handleSaveFieldSurvey = () => {
    if (
      !requireFullUnlock(
        'La sauvegarde des relevés oliviers et audits OLD 06 est verrouillée en prévisualisation partielle.'
      )
    ) {
      return;
    }
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
    showFeedback(
      `Relevé enregistré pour ${selectedSurveyClient.name} (${oldEvaluation.percent}% OLD).`
    );
  };

  const handleDeleteLog = (logId: string) => {
    if (
      !requireFullUnlock(
        'La modification de l’historique terrain est désactivée en prévisualisation partielle.'
      )
    ) {
      return;
    }
    const nextLogs = fieldLogs.filter((l) => l.id !== logId);
    setFieldLogs(nextLogs);
    saveFieldLogs(nextLogs);
    showFeedback('Relevé supprimé.');
  };

  const handleSaveExpressQuote = (alsoOpenWhatsApp: boolean) => {
    if (
      !requireFullUnlock(
        'Le générateur de Devis Express sur place et l’envoi WhatsApp sont activés après souscription.'
      )
    ) {
      return;
    }
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
    if (
      !requireFullUnlock(
        'L’acceptation client en 1 clic et la notification vers /admin nécessitent une licence active.'
      )
    ) {
      return;
    }
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
    if (
      !requireFullUnlock(
        'L’envoi de demandes saisonnières depuis le Carnet Propriétaire nécessite une licence active.'
      )
    ) {
      return;
    }
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

  const seasonalAlerts = useMemo(
    () => getSeasonalAlertsForMonth(new Date().getMonth() + 1),
    []
  );

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#1A211D] flex flex-col pb-20 lg:pb-10 overflow-x-hidden">
      {/* Compact Sticky App Header (52px tall for <= 15% mobile chrome cap) */}
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

      {!unlocked && (
        <PreviewBanner
          area="app"
          onRequestUnlock={() => {
            setUnlockReason(null);
            setShowUnlockModal(true);
          }}
          onBackToSite={onBackToSite}
        />
      )}

      {/* Main Responsive Workspace */}
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 md:px-8 pt-4 md:pt-7">
        {/* Scrollable Mode Switcher */}
        <div className="bg-white border border-[#E5DEC9] rounded-xl p-3.5 md:p-4 mb-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9C7228]">
              Formule 06 · Hors-ligne &amp; Synchronisée /admin
            </p>
            <h1 className="font-serif text-xl md:text-2xl font-semibold text-[#0E281B]">
              {appMode === 'terrain'
                ? 'Mode Terrain (Jason Claude)'
                : 'Mode Propriétaire (Carnet Jardin)'}
            </h1>
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
            {/* Scrollable Terrain Day KPI Strip */}
            <section
              aria-label="Synthèse activité terrain"
              className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5"
            >
              <div className="bg-white border border-[#E5DEC9] rounded-xl px-4 py-3">
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#647068]">
                  Tournée
                </span>
                <p className="font-serif text-2xl font-bold text-[#0E281B] tabular-nums mt-0.5">
                  {dayMetrics.completedStops}/{dayMetrics.completedStops + dayMetrics.pendingStops}
                </p>
              </div>
              <div className="bg-white border border-[#E5DEC9] rounded-xl px-4 py-3">
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#647068]">
                  Oliviers relevés
                </span>
                <p className="font-serif text-2xl font-bold text-[#0E281B] tabular-nums mt-0.5">
                  {dayMetrics.totalOlivesSurveyed}
                </p>
              </div>
              <div className="bg-white border border-[#E5DEC9] rounded-xl px-4 py-3">
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#647068]">
                  Temps consigné
                </span>
                <p className="font-serif text-2xl font-bold text-[#0E281B] tabular-nums mt-0.5">
                  {dayMetrics.totalLoggedMinutes} min
                </p>
              </div>
              <div className="bg-white border border-[#E5DEC9] rounded-xl px-4 py-3">
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#647068]">
                  Devis en attente
                </span>
                <p className="font-serif text-2xl font-bold text-[#9C7228] tabular-nums mt-0.5">
                  {formatEuro(dayMetrics.openQuotesTotalTTC)}
                </p>
              </div>
            </section>

            {/* Desktop horizontal navigation tabs for Terrain */}
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
                const tabUnlocked = isModuleUnlockedInPreview('app', tab.id, unlocked);
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
                    {!tabUnlocked && (
                      <Lock
                        aria-label="Verrouillé en prévisualisation"
                        className={`w-3.5 h-3.5 ${active ? 'text-[#CFA75B]' : 'text-[#9C7228]'}`}
                      />
                    )}
                  </button>
                );
              })}
            </nav>

            {terrainTab === 'tournee' && (
              <FieldTourView
                events={store.events}
                clients={store.clients}
                quotes={store.quotes}
                activeEventId={activeEventId}
                onSelectActiveEvent={setActiveEventId}
                timerRunning={timerRunning}
                elapsedSeconds={elapsedSeconds}
                onToggleTimer={() => setTimerRunning((r) => !r)}
                onResetTimer={() => {
                  setTimerRunning(false);
                  setElapsedSeconds(0);
                }}
                onSaveTimerToLog={handleSaveTimerToLog}
                onToggleEventDone={handleToggleEventDone}
                isPreviewOnly={!unlocked}
                onRequireUnlock={(reason) => {
                  setUnlockReason(reason);
                  setShowUnlockModal(true);
                }}
              />
            )}

            {terrainTab === 'releve' && (
              <FieldSurveyView
                clients={store.clients}
                surveyClientId={surveyClientId}
                onSelectSurveyClient={handleSelectSurveyClient}
                oliveCount={oliveCount}
                onChangeOliveCount={setOliveCount}
                oliveDensity={oliveDensity}
                onChangeOliveDensity={setOliveDensity}
                estimatedHarvestKg={estimatedHarvestKg}
                oldChecklist={oldChecklist}
                onToggleOldItem={(key) =>
                  setOldChecklist((prev) => ({ ...prev, [key]: !prev[key] }))
                }
                oldEvaluation={oldEvaluation}
                irrigationOk={irrigationOk}
                onToggleIrrigation={() => setIrrigationOk((v) => !v)}
                surveyNotes={surveyNotes}
                onChangeSurveyNotes={setSurveyNotes}
                onSaveFieldSurvey={handleSaveFieldSurvey}
                fieldLogs={fieldLogs}
                onDeleteLog={handleDeleteLog}
              />
            )}

            {terrainTab === 'express' &&
              (isModuleUnlockedInPreview('app', 'express', unlocked) ? (
                <FieldExpressQuoteView
                  clients={store.clients}
                  expressClientId={expressClientId}
                  onSelectExpressClient={handleSelectExpressClient}
                  expressName={expressName}
                  onChangeExpressName={setExpressName}
                  expressPhone={expressPhone}
                  onChangeExpressPhone={setExpressPhone}
                  expressCity={expressCity}
                  onChangeExpressCity={setExpressCity}
                  expressOlives={expressOlives}
                  onChangeExpressOlives={setExpressOlives}
                  expressOldUnits={expressOldUnits}
                  onChangeExpressOldUnits={setExpressOldUnits}
                  expressIrrigationM={expressIrrigationM}
                  onChangeExpressIrrigationM={setExpressIrrigationM}
                  expressDebris={expressDebris}
                  onToggleExpressDebris={() => setExpressDebris((d) => !d)}
                  expressNotes={expressNotes}
                  onChangeExpressNotes={setExpressNotes}
                  expressPreviewQuote={expressPreviewQuote}
                  expressTotals={expressTotals}
                  onSaveExpressQuote={handleSaveExpressQuote}
                />
              ) : (
                <ModulePreviewLock
                  title="Devis Express sur place & WhatsApp"
                  description="Chiffrez une taille d’oliviers, un débroussaillement OLD 06 ou un réseau d’arrosage en 30 secondes devant le client, puis générez et envoyez le devis directement."
                  requiredFormula="Formule 06 · Appli Terrain"
                  highlights={[
                    'Calcul HT / TTC automatique sur le terrain',
                    'Synchronisation immédiate avec /admin',
                    'Envoi WhatsApp pré-rempli en 1 clic',
                    'Fonctionnement hors-ligne en restanques',
                  ]}
                  onRequestUnlock={() => {
                    setUnlockReason(null);
                    setShowUnlockModal(true);
                  }}
                  onBackToSite={onBackToSite}
                />
              ))}

            {terrainTab === 'clients' &&
              (isModuleUnlockedInPreview('app', 'clients', unlocked) ? (
                <FieldClientsView
                  clients={store.clients}
                  clientQuery={clientQuery}
                  onChangeClientQuery={setClientQuery}
                  onOpenSurveyForClient={(clientId) => {
                    handleSelectSurveyClient(clientId);
                    setTerrainTab('releve');
                  }}
                />
              ) : (
                <ModulePreviewLock
                  title="Fiches Terrains, Codes Portail & Accès"
                  description="Retrouvez en un geste l’historique de chaque propriété, les codes d’accès portail, le déclenchement GPS Google Maps et l’appel direct propriétaire."
                  requiredFormula="Formule 06 · Appli Terrain"
                  highlights={[
                    'Recherche rapide par commune ou propriétaire',
                    'Codes portail et consignes de sécurité',
                    'Itinéraire GPS + appel / WhatsApp direct',
                    'Passage immédiat vers un nouveau relevé',
                  ]}
                  onRequestUnlock={() => {
                    setUnlockReason(null);
                    setShowUnlockModal(true);
                  }}
                  onBackToSite={onBackToSite}
                />
              ))}
          </>
        ) : (
          <OwnerPortalView
            clients={store.clients}
            quotes={store.quotes}
            invoices={store.invoices}
            fieldLogs={fieldLogs}
            seasonalAlerts={seasonalAlerts}
            ownerNameFilter={ownerNameFilter}
            onChangeOwnerFilter={setOwnerNameFilter}
            onAcceptQuote={handleOwnerAcceptQuote}
            onRequestAlert={handleOwnerRequestAlert}
          />
        )}
      </main>

      {/* Mobile Fixed Thumb-Zone Bottom Tab Bar (64px height, hidden on lg) */}
      {appMode === 'terrain' && (
        <nav
          aria-label="Navigation Terrain Mobile"
          className="lg:hidden fixed bottom-0 inset-x-0 z-30 h-16 bg-[#091B12] border-t border-[#CFA75B]/30 grid grid-cols-4"
        >
          {(
            [
              { id: 'tournee', label: 'Tournée', icon: CalendarClock },
              { id: 'releve', label: 'Relevé', icon: Trees },
              { id: 'express', label: 'Express', icon: FileText },
              { id: 'clients', label: 'Clients', icon: Users },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const active = terrainTab === tab.id;
            const tabUnlocked = isModuleUnlockedInPreview('app', tab.id, unlocked);
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTerrainTab(tab.id)}
                className={`min-h-[44px] relative flex flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors ${
                  active ? 'text-[#CFA75B]' : 'text-[#FAF8F3]/70'
                }`}
              >
                <span className="relative inline-flex">
                  <Icon className="w-5 h-5" />
                  {!tabUnlocked && (
                    <Lock
                      aria-label="Verrouillé en prévisualisation"
                      className="w-2.5 h-2.5 text-[#CFA75B] absolute -top-1 -right-1.5"
                    />
                  )}
                </span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      )}
      {showUnlockModal && (
        <UnlockLicenseModal
          area="app"
          reason={unlockReason}
          onUnlocked={() => {
            setUnlocked(true);
            setShowUnlockModal(false);
            setUnlockReason(null);
          }}
          onClose={() => {
            setShowUnlockModal(false);
            setUnlockReason(null);
          }}
          onBackToSite={onBackToSite}
        />
      )}
    </div>
  );
};
