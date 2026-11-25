import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Download,
  FileText,
  Inbox,
  LayoutDashboard,
  Lock,
  Menu,
  MessageCircle,
  Plus,
  Printer,
  Receipt,
  RefreshCw,
  Share2,
  Trash2,
  Upload,
  Users,
  X,
} from 'lucide-react';
import { CATALOG_ITEMS, COMPANY_INFO, SERVICE_POLES } from '../../data/seedData';
import type {
  AdminStore,
  ClientProperty,
  EventType,
  Invoice,
  Lead,
  LeadSource,
  LeadStatus,
  PaymentMethod,
  PlanningEvent,
  Quote,
  QuoteStatus,
  VatRate,
} from '../../types/relief';
import {
  calculateDocumentTotals,
  calculateLineTotalHT,
  computeAdminKpis,
  convertQuoteToInvoice,
  createPrefilledQuoteFromLead,
  formatEuro,
  type WhatsAppTemplateType,
} from '../../utils/business';
import {
  getConfiguredPasscode,
  grantSessionUnlock,
  hasSessionUnlock,
  isModuleUnlockedInPreview,
  isPaidLicenseActive,
  verifyAccessPasscode,
} from '../../utils/accessControl';
import { loadAdminStore, resetAdminStore, saveAdminStore } from '../../utils/storage';
import { ModulePreviewLock, PreviewBanner, UnlockLicenseModal } from '../PreviewBanner';
import { ReliefEmblem } from '../ReliefLogo';
import { PrintDocumentModal } from './PrintDocumentModal';
import { SocialLaunchKit } from './SocialLaunchKit';
import { WhatsAppComposerModal } from './WhatsAppComposerModal';

interface AdminPortalProps {
  onBackToSite: () => void;
}

type AdminTab =
  | 'dashboard'
  | 'leads'
  | 'quotes'
  | 'invoices'
  | 'planning'
  | 'clients'
  | 'social'
  | 'backup';

export const AdminPortal: React.FC<AdminPortalProps> = ({ onBackToSite }) => {
  const paidLicense = isPaidLicenseActive();
  const [unlocked, setUnlocked] = useState<boolean>(() => hasSessionUnlock('admin'));
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockReason, setUnlockReason] = useState<string | null>(null);

  const isPreviewOnly = !unlocked;

  const [store, setStore] = useState<AdminStore>(() => loadAdminStore());
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Filters & active editors
  const [leadStatusFilter, setLeadStatusFilter] = useState<'Toutes' | LeadStatus>('Toutes');
  const [showNewLeadForm, setShowNewLeadForm] = useState(false);
  const [newLead, setNewLead] = useState({
    name: '',
    phone: '',
    city: '',
    service: SERVICE_POLES[2].selectValue as string,
    details: '',
    source: 'Téléphone' as LeadSource,
  });

  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(
    () => store.quotes[0]?.id ?? null
  );
  const [printPreview, setPrintPreview] = useState<{
    mode: 'quote' | 'invoice';
    doc: Quote | Invoice;
  } | null>(null);
  const [waContext, setWaContext] = useState<{
    clientName: string;
    clientPhone: string;
    city?: string;
    service?: string;
    quoteNumber?: string;
    totalTTC?: number;
    initialTemplate?: WhatsAppTemplateType;
  } | null>(null);

  // New planning event form
  const [newEvent, setNewEvent] = useState({
    date: '2026-12-02',
    timeSlot: '08:30 - 12:00',
    type: 'Taille d’oliviers & Récolte' as EventType,
    clientName: '',
    city: 'Grasse',
    notes: '',
  });

  // New client property form
  const [newClient, setNewClient] = useState({
    name: '',
    phone: '',
    city: 'Grasse',
    address: '',
    oliveTreesCount: 0,
    isOldZone: false,
    hasAutoIrrigation: false,
    accessNotes: '',
  });

  const [backupNotice, setBackupNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!isPreviewOnly) {
      saveAdminStore(store);
    }
  }, [store, isPreviewOnly]);

  const kpis = computeAdminKpis(store);
  const selectedQuote = store.quotes.find((q) => q.id === selectedQuoteId) ?? null;

  const requireFullAdminUnlock = (reason: string): boolean => {
    if (!isPreviewOnly) return true;
    setUnlockReason(reason);
    setShowUnlockModal(true);
    return false;
  };

  const openPrintPreview = (payload: { mode: 'quote' | 'invoice'; doc: Quote | Invoice }) => {
    if (
      !requireFullAdminUnlock(
        'La génération et l’impression PDF A4 des devis et factures sont activées après souscription.'
      )
    ) {
      return;
    }
    setPrintPreview(payload);
  };

  const openWhatsAppModal = (ctx: NonNullable<typeof waContext>) => {
    if (
      !requireFullAdminUnlock(
        'L’envoi de messages WhatsApp pré-remplis vers vos clients est verrouillé en prévisualisation partielle.'
      )
    ) {
      return;
    }
    setWaContext(ctx);
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const expected = getConfiguredPasscode('admin');
    if (verifyAccessPasscode(pinInput, expected)) {
      grantSessionUnlock('admin');
      setUnlocked(true);
      setPinError('');
    } else {
      setPinError('Code incorrect. Veuillez contacter votre conseiller.');
    }
  };

  // Lead handlers
  const handleAddManualLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !requireFullAdminUnlock(
        'L’ajout de nouvelles demandes dans le suivi commercial est réservé aux comptes activés.'
      )
    ) {
      return;
    }
    if (!newLead.name.trim() || !newLead.phone.trim()) return;
    const created: Lead = {
      id: 'DEM-' + Date.now().toString().slice(-5),
      createdAt: new Date().toISOString().slice(0, 10),
      name: newLead.name.trim(),
      phone: newLead.phone.trim(),
      city: newLead.city.trim() || 'Grasse',
      service: newLead.service,
      details: newLead.details.trim() || 'Demande saisie manuellement.',
      status: 'Nouvelle',
      source: newLead.source,
    };
    setStore((prev) => ({ ...prev, leads: [created, ...prev.leads] }));
    setNewLead({
      name: '',
      phone: '',
      city: '',
      service: SERVICE_POLES[2].selectValue,
      details: '',
      source: 'Téléphone',
    });
    setShowNewLeadForm(false);
  };

  const handleLeadStatusChange = (leadId: string, status: LeadStatus) => {
    if (
      !requireFullAdminUnlock(
        'La mise à jour du statut des demandes est verrouillée en prévisualisation partielle.'
      )
    ) {
      return;
    }
    setStore((prev) => ({
      ...prev,
      leads: prev.leads.map((l) => (l.id === leadId ? { ...l, status } : l)),
    }));
  };

  const handleOpenPrefilledQuote = (lead: Lead) => {
    const existing = store.quotes.find((q) => q.leadId === lead.id);
    if (existing) {
      setSelectedQuoteId(existing.id);
      setActiveTab('quotes');
      return;
    }
    if (
      !requireFullAdminUnlock(
        'La création automatique de nouveaux pré-devis depuis une demande est réservée aux comptes activés.'
      )
    ) {
      return;
    }
    const createdQuote = createPrefilledQuoteFromLead(lead, store.quotes);
    setStore((prev) => ({
      ...prev,
      quotes: [createdQuote, ...prev.quotes],
      leads: prev.leads.map((l) =>
        l.id === lead.id && l.status === 'Nouvelle' ? { ...l, status: 'Visite terrain' } : l
      ),
    }));
    setSelectedQuoteId(createdQuote.id);
    setActiveTab('quotes');
  };

  // Quote editing handlers
  const updateSelectedQuote = (updater: (q: Quote) => Quote) => {
    if (
      !requireFullAdminUnlock(
        'L’édition et la sauvegarde des pré-devis sont verrouillées en prévisualisation partielle.'
      )
    ) {
      return;
    }
    if (!selectedQuoteId) return;
    setStore((prev) => ({
      ...prev,
      quotes: prev.quotes.map((q) => (q.id === selectedQuoteId ? updater(q) : q)),
    }));
  };

  const handleConvertQuoteToInvoice = (quote: Quote) => {
    if (
      !requireFullAdminUnlock(
        'La conversion en facture et l’accès au module Facturation nécessitent une activation complète.'
      )
    ) {
      return;
    }
    const existingInv = store.invoices.find((i) => i.quoteId === quote.id);
    if (existingInv) {
      setActiveTab('invoices');
      return;
    }
    const invoice = convertQuoteToInvoice(quote, store.invoices);
    setStore((prev) => ({
      ...prev,
      invoices: [invoice, ...prev.invoices],
      quotes: prev.quotes.map((q) => (q.id === quote.id ? { ...q, status: 'Accepté' } : q)),
      leads: quote.leadId
        ? prev.leads.map((l) => (l.id === quote.leadId ? { ...l, status: 'Acceptée' } : l))
        : prev.leads,
    }));
    setActiveTab('invoices');
  };

  // Invoice handlers
  const handleToggleInvoicePaid = (invoiceId: string) => {
    if (
      !requireFullAdminUnlock(
        'Le suivi des règlements et la facturation sont verrouillés en prévisualisation partielle.'
      )
    ) {
      return;
    }
    setStore((prev) => ({
      ...prev,
      invoices: prev.invoices.map((inv) => {
        if (inv.id !== invoiceId) return inv;
        const nextPaid = inv.status !== 'Payée';
        return {
          ...inv,
          status: nextPaid ? 'Payée' : 'À encaisser',
          paidAt: nextPaid ? new Date().toISOString().slice(0, 10) : undefined,
        };
      }),
    }));
  };

  const handleInvoicePaymentMethod = (invoiceId: string, method: PaymentMethod) => {
    if (
      !requireFullAdminUnlock(
        'La modification du mode de règlement est verrouillée en prévisualisation partielle.'
      )
    ) {
      return;
    }
    setStore((prev) => ({
      ...prev,
      invoices: prev.invoices.map((inv) =>
        inv.id === invoiceId ? { ...inv, paymentMethod: method } : inv
      ),
    }));
  };

  // Planning handlers
  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !requireFullAdminUnlock(
        'L’ajout d’interventions au planning est réservé aux comptes activés.'
      )
    ) {
      return;
    }
    if (!newEvent.clientName.trim()) return;
    const evt: PlanningEvent = {
      id: 'evt-' + Date.now(),
      date: newEvent.date,
      timeSlot: newEvent.timeSlot,
      type: newEvent.type,
      clientName: newEvent.clientName.trim(),
      city: newEvent.city.trim() || 'Grasse',
      notes: newEvent.notes.trim(),
      completed: false,
    };
    setStore((prev) => ({
      ...prev,
      events: [...prev.events, evt].sort((a, b) => a.date.localeCompare(b.date)),
    }));
    setNewEvent({
      date: newEvent.date,
      timeSlot: '08:30 - 12:00',
      type: 'Taille d’oliviers & Récolte',
      clientName: '',
      city: 'Grasse',
      notes: '',
    });
  };

  // Client directory handlers
  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !requireFullAdminUnlock(
        'La création de fiches clients et terrains est réservée aux comptes activés.'
      )
    ) {
      return;
    }
    if (!newClient.name.trim() || !newClient.phone.trim()) return;
    const cli: ClientProperty = {
      id: 'cli-' + Date.now(),
      name: newClient.name.trim(),
      phone: newClient.phone.trim(),
      city: newClient.city.trim() || 'Grasse',
      address: newClient.address.trim(),
      oliveTreesCount: Number(newClient.oliveTreesCount) || 0,
      isOldZone: newClient.isOldZone,
      hasAutoIrrigation: newClient.hasAutoIrrigation,
      accessNotes: newClient.accessNotes.trim(),
    };
    setStore((prev) => ({ ...prev, clients: [cli, ...prev.clients] }));
    setNewClient({
      name: '',
      phone: '',
      city: 'Grasse',
      address: '',
      oliveTreesCount: 0,
      isOldZone: false,
      hasAutoIrrigation: false,
      accessNotes: '',
    });
  };

  // Backup JSON export/import
  const handleExportJson = () => {
    if (
      !requireFullAdminUnlock(
        'L’export des sauvegardes JSON est verrouillé en prévisualisation partielle.'
      )
    ) {
      return;
    }
    const blob = new Blob([JSON.stringify(store, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relief-paysage-sauvegarde-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setBackupNotice('Sauvegarde JSON téléchargée.');
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (
      !requireFullAdminUnlock(
        'L’importation de données JSON est verrouillée en prévisualisation partielle.'
      )
    ) {
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as AdminStore;
        if (Array.isArray(parsed.leads) && Array.isArray(parsed.quotes)) {
          setStore(parsed);
          setBackupNotice('Données restaurées avec succès depuis votre fichier JSON.');
        } else {
          setBackupNotice('Fichier JSON invalide pour Relief Paysage.');
        }
      } catch {
        setBackupNotice('Impossible de lire le fichier JSON sélectionné.');
      }
    };
    reader.readAsText(file);
  };

  // ==================== PAID LICENSE PIN GATE ====================
  if (!unlocked && paidLicense) {

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#163B29] via-[#0E281B] to-[#091B12] flex items-center justify-center p-5">
        <div className="bg-[#FAF8F3] border border-[#CFA75B] rounded-2xl p-8 md:p-10 max-w-md w-full text-center shadow-2xl">
          <ReliefEmblem className="w-14 h-14 mx-auto mb-3" />
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9C7228] mb-1">
            Portail dissocié /admin
          </p>
          <h1 className="font-serif text-3xl font-bold text-[#0E281B] mb-2">
            Espace Gérant Relief Paysage
          </h1>
          <p className="text-sm text-[#647068] mb-6">
            Accès réservé à {COMPANY_INFO.ownerName} pour le pilotage des demandes, pré-devis,
            factures, planning et WhatsApp.
          </p>

          <form onSubmit={handleUnlock} className="space-y-3">
            <label htmlFor="admin-pin" className="sr-only">
              Code PIN d’accès
            </label>
            <input
              id="admin-pin"
              type="password"
              inputMode="numeric"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="Saisir votre code PIN"
              className="w-full text-center tracking-[0.35em] font-mono text-xl font-bold py-3 px-4 rounded-lg border border-[#E5DEC9] bg-white text-[#0E281B] focus:outline-none focus:border-[#B5893A]"
            />
            {pinError && (
              <p role="alert" className="text-xs font-semibold text-[#9B2C2C]">
                {pinError}
              </p>
            )}
            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-[#0E281B] text-[#EBD9B3] font-semibold text-sm hover:bg-[#163B29] transition-colors inline-flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Déverrouiller l’espace gérant</span>
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-[#E5DEC9] flex flex-col gap-2 text-xs text-[#647068]">
            <button
              type="button"
              onClick={onBackToSite}
              className="text-[#9C7228] font-semibold hover:underline inline-flex items-center justify-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Retourner au site public</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const navEntries: { id: AdminTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Tableau de bord', icon: <LayoutDashboard className="w-4 h-4" /> },
    {
      id: 'leads',
      label: 'Demandes & WA',
      icon: <Inbox className="w-4 h-4" />,
      badge: kpis.newLeadsCount || undefined,
    },
    {
      id: 'quotes',
      label: 'Pré-devis',
      icon: <FileText className="w-4 h-4" />,
      badge: kpis.pendingQuotesCount || undefined,
    },
    { id: 'invoices', label: 'Facturation', icon: <Receipt className="w-4 h-4" /> },
    {
      id: 'planning',
      label: 'Planning chantiers',
      icon: <Calendar className="w-4 h-4" />,
      badge: kpis.upcomingEventsCount || undefined,
    },
    { id: 'clients', label: 'Clients & Terrains', icon: <Users className="w-4 h-4" /> },
    { id: 'social', label: 'Réseaux & Lancement', icon: <Share2 className="w-4 h-4" /> },
    { id: 'backup', label: 'Sauvegarde JSON', icon: <Download className="w-4 h-4" /> },
  ];

  const filteredLeads =
    leadStatusFilter === 'Toutes'
      ? store.leads
      : store.leads.filter((l) => l.status === leadStatusFilter);

  const tabTitles: Record<AdminTab, string> = {
    dashboard: 'Tableau de bord dirigeant',
    leads: 'Suivi des demandes & WhatsApp',
    quotes: 'Pré-devis pré-remplis & PDF',
    invoices: 'Facturation & encaissements',
    planning: 'Planning visites & chantiers',
    clients: 'Fiches clients & terrains',
    social: 'Réseaux sociaux & Kit de lancement',
    backup: 'Sauvegarde & continuité des données',
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#1A211D] flex flex-col lg:grid lg:grid-cols-[270px_1fr]">
      {/* ==================== SIDEBAR ==================== */}
      <aside
        className={`${
          mobileNavOpen ? 'fixed inset-y-0 left-0 z-50 w-72' : 'hidden'
        } lg:block lg:sticky lg:top-0 lg:h-screen bg-[#091B12] text-[#FAF8F3] p-5 flex flex-col justify-between border-r border-[#CFA75B]/20 overflow-y-auto`}
      >
        <div>
          <div className="flex items-center justify-between gap-2 pb-5 mb-5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <ReliefEmblem className="w-9 h-9 shrink-0" />
              <div>
                <div className="font-serif text-lg font-bold tracking-wide text-white leading-none">
                  RELIEF <span className="text-[#CFA75B]">PAYSAGE</span>
                </div>
                <div className="text-[11px] uppercase tracking-[0.14em] text-[#EBD9B3] mt-1">
                  Portail Gérant
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMobileNavOpen(false)}
              aria-label="Fermer la navigation"
              className="lg:hidden text-white/75 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav aria-label="Menu espace gérant" className="space-y-1">
            {navEntries.map((item) => {
              const active = activeTab === item.id;
              const tabUnlocked = isModuleUnlockedInPreview('admin', item.id, !isPreviewOnly);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileNavOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-lg text-sm font-medium ${
                    active
                      ? 'bg-[#B5893A] text-[#091B12] font-bold'
                      : 'text-[#FAF8F3]/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2.5 truncate">
                    {item.icon}
                    <span className="truncate">{item.label}</span>
                  </span>
                  <span className="flex items-center gap-1.5 shrink-0">
                    {!tabUnlocked && (
                      <Lock
                        aria-label="Verrouillé en prévisualisation"
                        className={`w-3.5 h-3.5 ${active ? 'text-[#091B12]' : 'text-[#CFA75B]'}`}
                      />
                    )}
                    {item.badge !== undefined && (
                      <span
                        className={`font-mono-num text-xs px-1.5 py-0.5 rounded ${
                          active ? 'bg-[#091B12] text-[#EBD9B3]' : 'bg-white/15 text-[#EBD9B3]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-5 mt-6 border-t border-white/10 space-y-2.5 text-xs">
          <div className="text-[#FAF8F3]/65">
            {COMPANY_INFO.ownerName} · SIREN {COMPANY_INFO.siren}
          </div>
          <button
            type="button"
            onClick={onBackToSite}
            className="w-full py-2.5 px-3 rounded border border-white/20 text-[#EBD9B3] hover:bg-white/10 font-semibold inline-flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voir le site client</span>
          </button>
        </div>
      </aside>

      {/* ==================== MAIN AREA ==================== */}
      <div className="flex flex-col min-w-0">
        {isPreviewOnly && (
          <PreviewBanner
            area="admin"
            onRequestUnlock={() => {
              setUnlockReason(null);
              setShowUnlockModal(true);
            }}
            onBackToSite={onBackToSite}
          />
        )}
        <header className="bg-white border-b border-[#E5DEC9] px-5 md:px-8 py-4 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Ouvrir le menu gérant"
              className="lg:hidden p-2 rounded border border-[#E5DEC9] text-[#0E281B]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-serif text-2xl md:text-3xl font-semibold text-[#0E281B] truncate">
              {tabTitles[activeTab]}
            </h1>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (
                  !requireFullAdminUnlock(
                    'La saisie manuelle de nouvelles demandes est réservée aux comptes activés.'
                  )
                ) {
                  return;
                }
                setActiveTab('leads');
                setShowNewLeadForm(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded bg-[#0E281B] text-white text-xs font-semibold hover:bg-[#163B29] whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Saisir une demande</span>
            </button>
            <button
              type="button"
              onClick={onBackToSite}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded border border-[#E5DEC9] bg-[#FAF8F3] text-xs font-semibold text-[#0E281B] hover:border-[#B5893A] whitespace-nowrap"
            >
              <span>Site client</span>
            </button>
          </div>
        </header>

        <main className="p-5 md:p-8 space-y-6">
          {/* ========== TAB 1 : DASHBOARD ========== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="bg-white border border-[#E5DEC9] rounded-xl p-5">
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#647068] mb-1">
                    Demandes actives
                  </div>
                  <div className="font-serif text-4xl font-bold text-[#0E281B] tabular-nums">
                    {kpis.activeLeadsCount}
                  </div>
                  <div className="text-xs text-[#9C7228] font-medium mt-1 tabular-nums">
                    dont {kpis.newLeadsCount} nouvelle(s) à traiter
                  </div>
                </div>

                <div className="bg-white border border-[#E5DEC9] rounded-xl p-5">
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#647068] mb-1">
                    Devis en cours
                  </div>
                  <div className="font-serif text-4xl font-bold text-[#0E281B] tabular-nums">
                    {formatEuro(kpis.pendingQuotesTotalTTC)}
                  </div>
                  <div className="text-xs text-[#647068] mt-1 tabular-nums">
                    {kpis.pendingQuotesCount} devis brouillon / envoyé
                  </div>
                </div>

                <div className="bg-white border border-[#E5DEC9] rounded-xl p-5">
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#647068] mb-1">
                    Encaissé (factures)
                  </div>
                  <div className="font-serif text-4xl font-bold text-[#1E6B43] tabular-nums">
                    {formatEuro(kpis.invoicedPaidTotalTTC)}
                  </div>
                  <div className="text-xs text-[#647068] mt-1 tabular-nums">
                    À encaisser : {formatEuro(kpis.invoicedPendingTotalTTC)}
                  </div>
                </div>

                <div className="bg-white border border-[#E5DEC9] rounded-xl p-5">
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#647068] mb-1">
                    Chantiers &amp; visites
                  </div>
                  <div className="font-serif text-4xl font-bold text-[#0E281B] tabular-nums">
                    {kpis.upcomingEventsCount}
                  </div>
                  <div className="text-xs text-[#647068] mt-1">
                    Intervention(s) planifiée(s)
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-7 bg-white border border-[#E5DEC9] rounded-xl p-6">
                  <div className="flex items-center justify-between gap-4 pb-4 mb-4 border-b border-[#E5DEC9]">
                    <h2 className="font-serif text-2xl font-semibold text-[#0E281B]">
                      Dernières demandes reçues
                    </h2>
                    <button
                      type="button"
                      onClick={() => setActiveTab('leads')}
                      className="text-xs font-semibold text-[#9C7228] hover:underline"
                    >
                      Tout voir &rarr;
                    </button>
                  </div>

                  {store.leads.length === 0 ? (
                    <p className="text-sm text-[#647068]">Aucune demande enregistrée.</p>
                  ) : (
                    <div className="divide-y divide-[#E5DEC9]">
                      {store.leads.slice(0, 4).map((lead) => (
                        <div
                          key={lead.id}
                          className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div>
                            <div className="text-sm font-semibold text-[#0E281B]">
                              {lead.name}{' '}
                              <span className="font-normal text-[#647068]">· {lead.city}</span>
                            </div>
                            <div className="text-xs text-[#3E4A43] mt-0.5">
                              {lead.service} · <span className="text-[#9C7228]">{lead.status}</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleOpenPrefilledQuote(lead)}
                              className="px-3 py-1.5 rounded bg-[#0E281B] text-white text-xs font-semibold hover:bg-[#163B29]"
                            >
                              Pré-devis pré-rempli
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                openWhatsAppModal({
                                  clientName: lead.name,
                                  clientPhone: lead.phone,
                                  city: lead.city,
                                  service: lead.service,
                                  initialTemplate: 'reception',
                                })
                              }
                              className="px-3 py-1.5 rounded bg-[#1E7D4B] text-white text-xs font-semibold hover:bg-[#16623A]"
                            >
                              WhatsApp
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="lg:col-span-5 bg-white border border-[#E5DEC9] rounded-xl p-6">
                  <div className="flex items-center justify-between gap-4 pb-4 mb-4 border-b border-[#E5DEC9]">
                    <h2 className="font-serif text-2xl font-semibold text-[#0E281B]">
                      Prochains passages
                    </h2>
                    <button
                      type="button"
                      onClick={() => setActiveTab('planning')}
                      className="text-xs font-semibold text-[#9C7228] hover:underline"
                    >
                      Planning &rarr;
                    </button>
                  </div>
                  <div className="divide-y divide-[#E5DEC9]">
                    {store.events
                      .filter((e) => !e.completed)
                      .slice(0, 4)
                      .map((evt) => (
                        <div key={evt.id} className="py-3">
                          <div className="flex items-center justify-between text-xs text-[#9C7228] font-semibold font-mono-num">
                            <span>
                              {evt.date} · {evt.timeSlot}
                            </span>
                            <span>{evt.city}</span>
                          </div>
                          <div className="text-sm font-semibold text-[#0E281B] mt-0.5">
                            {evt.type} — {evt.clientName}
                          </div>
                          {evt.notes && (
                            <p className="text-xs text-[#647068] mt-0.5">{evt.notes}</p>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========== TAB 2 : DEMANDES & WHATSAPP ========== */}
          {activeTab === 'leads' && (
            <div className="space-y-6">
              {showNewLeadForm && (
                <form
                  onSubmit={handleAddManualLead}
                  className="bg-white border border-[#B5893A] rounded-xl p-6 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="font-serif text-2xl font-semibold text-[#0E281B]">
                      Nouvelle demande (appel, SMS ou WhatsApp)
                    </h2>
                    <button
                      type="button"
                      onClick={() => setShowNewLeadForm(false)}
                      className="text-xs font-semibold text-[#647068] hover:text-[#0E281B]"
                    >
                      Annuler
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1">Nom client *</label>
                      <input
                        type="text"
                        required
                        value={newLead.name}
                        onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                        placeholder="Nom / Domaine"
                        className="w-full px-3 py-2 rounded border border-[#E5DEC9] bg-[#FAF8F3] text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Téléphone *</label>
                      <input
                        type="tel"
                        required
                        value={newLead.phone}
                        onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                        placeholder="06 .. .. .. .."
                        className="w-full px-3 py-2 rounded border border-[#E5DEC9] bg-[#FAF8F3] text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Commune</label>
                      <input
                        type="text"
                        value={newLead.city}
                        onChange={(e) => setNewLead({ ...newLead, city: e.target.value })}
                        placeholder="Grasse, Cabris…"
                        className="w-full px-3 py-2 rounded border border-[#E5DEC9] bg-[#FAF8F3] text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1">Prestation</label>
                      <select
                        value={newLead.service}
                        onChange={(e) => setNewLead({ ...newLead, service: e.target.value })}
                        className="w-full px-3 py-2 rounded border border-[#E5DEC9] bg-[#FAF8F3] text-sm"
                      >
                        {SERVICE_POLES.map((p) => (
                          <option key={p.id} value={p.selectValue}>
                            {p.selectValue}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Canal d’entrée</label>
                      <select
                        value={newLead.source}
                        onChange={(e) =>
                          setNewLead({ ...newLead, source: e.target.value as LeadSource })
                        }
                        className="w-full px-3 py-2 rounded border border-[#E5DEC9] bg-[#FAF8F3] text-sm"
                      >
                        <option value="Téléphone">Téléphone (06 19 86 10 45)</option>
                        <option value="WhatsApp">WhatsApp</option>
                        <option value="Site vitrine">Site vitrine</option>
                        <option value="Recommandation">Recommandation</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Détails terrain</label>
                    <textarea
                      rows={2}
                      value={newLead.details}
                      onChange={(e) => setNewLead({ ...newLead, details: e.target.value })}
                      placeholder="Nombre d'oliviers, surface OLD, accès..."
                      className="w-full px-3 py-2 rounded border border-[#E5DEC9] bg-[#FAF8F3] text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded bg-[#B5893A] text-white text-xs font-semibold hover:bg-[#9C7228]"
                  >
                    Enregistrer la demande
                  </button>
                </form>
              )}

              <div className="bg-white border border-[#E5DEC9] rounded-xl p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-[#E5DEC9]">
                  <div className="inline-flex flex-wrap gap-1 p-1 bg-[#F3EFE5] rounded-lg border border-[#E5DEC9]">
                    {(
                      [
                        'Toutes',
                        'Nouvelle',
                        'Visite terrain',
                        'Devis envoyé',
                        'Acceptée',
                        'Terminée',
                      ] as const
                    ).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setLeadStatusFilter(st)}
                        className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                          leadStatusFilter === st
                            ? 'bg-[#0E281B] text-[#EBD9B3]'
                            : 'text-[#3E4A43] hover:text-[#0E281B]'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        !requireFullAdminUnlock(
                          'La saisie manuelle de nouvelles demandes est réservée aux comptes activés.'
                        )
                      ) {
                        return;
                      }
                      setShowNewLeadForm((prev) => !prev);
                    }}
                    className="px-3.5 py-2 rounded border border-[#E5DEC9] text-xs font-semibold text-[#0E281B] hover:border-[#B5893A]"
                  >
                    + Ajouter une demande manuelle
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-[#E5DEC9] text-left text-xs uppercase tracking-wider text-[#647068]">
                        <th className="py-2.5 pr-4">Réf. &amp; Date</th>
                        <th className="py-2.5 px-3">Client &amp; Commune</th>
                        <th className="py-2.5 px-3">Prestation &amp; Détails</th>
                        <th className="py-2.5 px-3">Statut</th>
                        <th className="py-2.5 pl-3 text-right">Actions rapides</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F3EFE5]">
                      {filteredLeads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-[#FAF8F3]">
                          <td className="py-3.5 pr-4 whitespace-nowrap">
                            <div className="font-mono text-xs font-semibold text-[#0E281B]">
                              {lead.id}
                            </div>
                            <div className="text-xs text-[#647068] tabular-nums">
                              {lead.createdAt}
                            </div>
                            <div className="text-[11px] text-[#9C7228]">{lead.source}</div>
                          </td>
                          <td className="py-3.5 px-3">
                            <div className="font-semibold text-[#0E281B]">{lead.name}</div>
                            <div className="text-xs text-[#3E4A43]">
                              {lead.city} · {lead.phone}
                            </div>
                          </td>
                          <td className="py-3.5 px-3 max-w-sm">
                            <div className="font-medium text-[#0E281B]">{lead.service}</div>
                            <p className="text-xs text-[#647068] mt-0.5">{lead.details}</p>
                          </td>
                          <td className="py-3.5 px-3">
                            <select
                              aria-label={`Statut de ${lead.name}`}
                              value={lead.status}
                              onChange={(e) =>
                                handleLeadStatusChange(lead.id, e.target.value as LeadStatus)
                              }
                              className="px-2.5 py-1.5 rounded border border-[#E5DEC9] bg-white text-xs font-semibold text-[#0E281B]"
                            >
                              <option value="Nouvelle">Nouvelle</option>
                              <option value="Visite terrain">Visite terrain</option>
                              <option value="Devis envoyé">Devis envoyé</option>
                              <option value="Acceptée">Acceptée</option>
                              <option value="Terminée">Terminée</option>
                              <option value="Archivée">Archivée</option>
                            </select>
                          </td>
                          <td className="py-3.5 pl-3">
                            <div className="flex flex-wrap justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenPrefilledQuote(lead)}
                                className="px-2.5 py-1.5 rounded bg-[#0E281B] text-white text-xs font-semibold hover:bg-[#163B29] whitespace-nowrap"
                              >
                                Pré-devis
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  openWhatsAppModal({
                                    clientName: lead.name,
                                    clientPhone: lead.phone,
                                    city: lead.city,
                                    service: lead.service,
                                    initialTemplate: 'reception',
                                  })
                                }
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-[#1E7D4B] text-white text-xs font-semibold hover:bg-[#16623A] whitespace-nowrap"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>WhatsApp</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========== TAB 3 : PRE-DEVIS PRE-REMPLIS ========== */}
          {activeTab === 'quotes' && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              {/* Liste devis */}
              <div className="xl:col-span-4 bg-white border border-[#E5DEC9] rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-[#E5DEC9]">
                  <h2 className="font-serif text-xl font-semibold text-[#0E281B]">
                    Devis ({store.quotes.length})
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        !requireFullAdminUnlock(
                          'La création de nouveaux devis et leur sauvegarde sont verrouillées en prévisualisation partielle.'
                        )
                      ) {
                        return;
                      }
                      const blank = createPrefilledQuoteFromLead(
                        {
                          id: '',
                          createdAt: new Date().toISOString().slice(0, 10),
                          name: 'Nouveau client',
                          phone: '06 ',
                          city: 'Grasse',
                          service: "Taille d'olivier et récolte d'olives",
                          details: '',
                          status: 'Nouvelle',
                          source: 'Téléphone',
                        },
                        store.quotes
                      );
                      delete blank.leadId;
                      setStore((prev) => ({ ...prev, quotes: [blank, ...prev.quotes] }));
                      setSelectedQuoteId(blank.id);
                    }}
                    className="px-3 py-1.5 rounded bg-[#B5893A] text-white text-xs font-semibold hover:bg-[#9C7228]"
                  >
                    + Nouveau devis
                  </button>
                </div>

                <div className="space-y-2">
                  {store.quotes.map((q) => {
                    const tot = calculateDocumentTotals(q.lines, q.vatRate).totalTTC;
                    const active = q.id === selectedQuoteId;
                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setSelectedQuoteId(q.id)}
                        className={`w-full text-left p-3.5 rounded-lg border transition-colors ${
                          active
                            ? 'bg-[#0E281B] text-white border-[#0E281B]'
                            : 'bg-[#FAF8F3] text-[#1A211D] border-[#E5DEC9] hover:border-[#B5893A]'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span
                            className={`font-mono font-semibold ${
                              active ? 'text-[#EBD9B3]' : 'text-[#9C7228]'
                            }`}
                          >
                            {q.number}
                          </span>
                          <span className="font-mono-num font-bold">{formatEuro(tot)}</span>
                        </div>
                        <div className="text-sm font-semibold truncate">{q.clientName}</div>
                        <div
                          className={`text-xs truncate mt-0.5 ${
                            active ? 'text-white/75' : 'text-[#647068]'
                          }`}
                        >
                          {q.clientCity} · {q.status}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Éditeur de pré-devis */}
              <div className="xl:col-span-8 bg-white border border-[#E5DEC9] rounded-xl p-6">
                {!selectedQuote ? (
                  <p className="text-sm text-[#647068]">
                    Sélectionnez un devis ou créez-en un depuis une demande client.
                  </p>
                ) : (
                  <div className="space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E5DEC9]">
                      <div>
                        <span className="font-mono text-xs font-semibold text-[#9C7228]">
                          {selectedQuote.number}
                        </span>
                        <h2 className="font-serif text-2xl font-semibold text-[#0E281B]">
                          Édition du pré-devis
                        </h2>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            openPrintPreview({ mode: 'quote', doc: selectedQuote })
                          }
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded border border-[#E5DEC9] text-xs font-semibold text-[#0E281B] hover:border-[#0E281B]"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>PDF / Imprimer</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            openWhatsAppModal({
                              clientName: selectedQuote.clientName,
                              clientPhone: selectedQuote.clientPhone,
                              city: selectedQuote.clientCity,
                              service: selectedQuote.title,
                              quoteNumber: selectedQuote.number,
                              totalTTC: calculateDocumentTotals(
                                selectedQuote.lines,
                                selectedQuote.vatRate
                              ).totalTTC,
                              initialTemplate: 'devis',
                            })
                          }
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded bg-[#1E7D4B] text-white text-xs font-semibold hover:bg-[#16623A]"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Envoyer WhatsApp</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleConvertQuoteToInvoice(selectedQuote)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded bg-[#B5893A] text-white text-xs font-semibold hover:bg-[#9C7228]"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>Convertir en Facture</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold mb-1">Client</label>
                        <input
                          type="text"
                          value={selectedQuote.clientName}
                          onChange={(e) =>
                            updateSelectedQuote((q) => ({ ...q, clientName: e.target.value }))
                          }
                          className="w-full px-3 py-2 rounded border border-[#E5DEC9] bg-[#FAF8F3] text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Téléphone</label>
                        <input
                          type="text"
                          value={selectedQuote.clientPhone}
                          onChange={(e) =>
                            updateSelectedQuote((q) => ({ ...q, clientPhone: e.target.value }))
                          }
                          className="w-full px-3 py-2 rounded border border-[#E5DEC9] bg-[#FAF8F3] text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Statut devis</label>
                        <select
                          value={selectedQuote.status}
                          onChange={(e) =>
                            updateSelectedQuote((q) => ({
                              ...q,
                              status: e.target.value as QuoteStatus,
                            }))
                          }
                          className="w-full px-3 py-2 rounded border border-[#E5DEC9] bg-[#FAF8F3] text-sm"
                        >
                          <option value="Brouillon">Brouillon</option>
                          <option value="Envoyé">Envoyé</option>
                          <option value="Accepté">Accepté</option>
                          <option value="Refusé">Refusé</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold mb-1">
                          Objet du devis
                        </label>
                        <input
                          type="text"
                          value={selectedQuote.title}
                          onChange={(e) =>
                            updateSelectedQuote((q) => ({ ...q, title: e.target.value }))
                          }
                          className="w-full px-3 py-2 rounded border border-[#E5DEC9] bg-[#FAF8F3] text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Régime TVA</label>
                        <select
                          value={selectedQuote.vatRate}
                          onChange={(e) =>
                            updateSelectedQuote((q) => ({
                              ...q,
                              vatRate: Number(e.target.value) as VatRate,
                            }))
                          }
                          className="w-full px-3 py-2 rounded border border-[#E5DEC9] bg-[#FAF8F3] text-sm"
                        >
                          <option value={0}>0% (Franchise art. 293 B)</option>
                          <option value={10}>10% (Entretien / SAP)</option>
                          <option value={20}>20% (Création / Aménagement)</option>
                        </select>
                      </div>
                    </div>

                    {/* Catalogue 1 clic */}
                    <div className="p-3.5 rounded-lg bg-[#FAF8F3] border border-[#E5DEC9]">
                      <div className="text-xs font-semibold text-[#0E281B] mb-2">
                        Ajouter une prestation type Relief Paysage en 1 clic :
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {CATALOG_ITEMS.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() =>
                              updateSelectedQuote((q) => ({
                                ...q,
                                lines: [
                                  ...q.lines,
                                  {
                                    id: 'line-' + Date.now() + '-' + Math.random().toString(36).slice(2, 5),
                                    label: item.label,
                                    unit: item.unit,
                                    quantity: 1,
                                    unitPriceHT: item.unitPriceHT,
                                  },
                                ],
                              }))
                            }
                            className="px-2.5 py-1 rounded bg-white border border-[#E5DEC9] text-xs text-[#3E4A43] hover:border-[#B5893A] hover:text-[#0E281B]"
                          >
                            + {item.category} ({formatEuro(item.unitPriceHT)})
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Lignes chiffrage */}
                    <div className="space-y-2.5">
                      {selectedQuote.lines.map((line) => (
                        <div
                          key={line.id}
                          className="grid grid-cols-1 md:grid-cols-[1fr_75px_95px_95px_90px_34px] gap-2 items-center p-2.5 rounded border border-[#E5DEC9] bg-white"
                        >
                          <input
                            type="text"
                            aria-label="Libellé ligne"
                            value={line.label}
                            onChange={(e) =>
                              updateSelectedQuote((q) => ({
                                ...q,
                                lines: q.lines.map((l) =>
                                  l.id === line.id ? { ...l, label: e.target.value } : l
                                ),
                              }))
                            }
                            className="px-2.5 py-1.5 rounded border border-[#E5DEC9] text-xs"
                          />
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            aria-label="Quantité"
                            value={line.quantity}
                            onChange={(e) =>
                              updateSelectedQuote((q) => ({
                                ...q,
                                lines: q.lines.map((l) =>
                                  l.id === line.id
                                    ? { ...l, quantity: Number(e.target.value) || 0 }
                                    : l
                                ),
                              }))
                            }
                            className="px-2 py-1.5 rounded border border-[#E5DEC9] text-xs text-right font-mono-num"
                          />
                          <input
                            type="text"
                            aria-label="Unité"
                            value={line.unit}
                            onChange={(e) =>
                              updateSelectedQuote((q) => ({
                                ...q,
                                lines: q.lines.map((l) =>
                                  l.id === line.id ? { ...l, unit: e.target.value } : l
                                ),
                              }))
                            }
                            className="px-2 py-1.5 rounded border border-[#E5DEC9] text-xs"
                          />
                          <input
                            type="number"
                            min="0"
                            step="1"
                            aria-label="Prix unitaire HT"
                            value={line.unitPriceHT}
                            onChange={(e) =>
                              updateSelectedQuote((q) => ({
                                ...q,
                                lines: q.lines.map((l) =>
                                  l.id === line.id
                                    ? { ...l, unitPriceHT: Number(e.target.value) || 0 }
                                    : l
                                ),
                              }))
                            }
                            className="px-2 py-1.5 rounded border border-[#E5DEC9] text-xs text-right font-mono-num"
                          />
                          <div className="text-right text-xs font-mono-num font-bold text-[#0E281B]">
                            {formatEuro(calculateLineTotalHT(line.quantity, line.unitPriceHT))}
                          </div>
                          <button
                            type="button"
                            aria-label="Supprimer cette ligne"
                            onClick={() =>
                              updateSelectedQuote((q) => ({
                                ...q,
                                lines: q.lines.filter((l) => l.id !== line.id),
                              }))
                            }
                            className="p-1.5 text-[#9B2C2C] hover:bg-[#FDECEC] rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {(() => {
                      const tot = calculateDocumentTotals(
                        selectedQuote.lines,
                        selectedQuote.vatRate
                      );
                      return (
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pt-3 border-t border-[#E5DEC9]">
                          <div className="w-full sm:max-w-sm">
                            <label className="block text-xs font-semibold mb-1">
                              Notes &amp; conditions
                            </label>
                            <textarea
                              rows={2}
                              value={selectedQuote.notes}
                              onChange={(e) =>
                                updateSelectedQuote((q) => ({ ...q, notes: e.target.value }))
                              }
                              className="w-full px-3 py-2 rounded border border-[#E5DEC9] bg-[#FAF8F3] text-xs"
                            />
                          </div>
                          <div className="w-full sm:w-64 bg-[#FAF8F3] border border-[#E5DEC9] rounded-lg p-4 space-y-1.5 text-sm">
                            <div className="flex justify-between">
                              <span className="text-[#647068]">Total HT</span>
                              <span className="font-mono-num font-semibold">
                                {formatEuro(tot.totalHT)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#647068]">
                                TVA ({selectedQuote.vatRate}%)
                              </span>
                              <span className="font-mono-num">{formatEuro(tot.totalTVA)}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-[#E5DEC9] font-bold text-[#0E281B]">
                              <span>Total TTC</span>
                              <span className="font-mono-num text-[#9C7228]">
                                {formatEuro(tot.totalTTC)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========== TAB 4 : FACTURATION ========== */}
          {activeTab === 'invoices' &&
            (isModuleUnlockedInPreview('admin', 'invoices', !isPreviewOnly) ? (
            <div className="bg-white border border-[#E5DEC9] rounded-xl p-6">
              <div className="flex items-center justify-between gap-4 pb-4 mb-4 border-b border-[#E5DEC9]">
                <h2 className="font-serif text-2xl font-semibold text-[#0E281B]">
                  Factures émises ({store.invoices.length})
                </h2>
                <span className="text-xs text-[#647068]">
                  Astuce : convertissez n’importe quel devis en facture en 1 clic depuis l’onglet
                  Pré-devis.
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-[#E5DEC9] text-left text-xs uppercase tracking-wider text-[#647068]">
                      <th className="py-2.5 pr-4">Numéro</th>
                      <th className="py-2.5 px-3">Client &amp; Objet</th>
                      <th className="py-2.5 px-3">Montant TTC</th>
                      <th className="py-2.5 px-3">Mode règlement</th>
                      <th className="py-2.5 px-3">Statut</th>
                      <th className="py-2.5 pl-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3EFE5]">
                    {store.invoices.map((inv) => {
                      const tot = calculateDocumentTotals(inv.lines, inv.vatRate).totalTTC;
                      return (
                        <tr key={inv.id} className="hover:bg-[#FAF8F3]">
                          <td className="py-3.5 pr-4 whitespace-nowrap">
                            <div className="font-mono text-xs font-bold text-[#0E281B]">
                              {inv.number}
                            </div>
                            <div className="text-xs text-[#647068] tabular-nums">
                              {inv.issuedAt}
                            </div>
                          </td>
                          <td className="py-3.5 px-3">
                            <div className="font-semibold text-[#0E281B]">{inv.clientName}</div>
                            <div className="text-xs text-[#647068]">{inv.title}</div>
                          </td>
                          <td className="py-3.5 px-3 font-mono-num font-bold text-[#0E281B]">
                            {formatEuro(tot)}
                          </td>
                          <td className="py-3.5 px-3">
                            <select
                              aria-label={`Mode règlement ${inv.number}`}
                              value={inv.paymentMethod}
                              onChange={(e) =>
                                handleInvoicePaymentMethod(
                                  inv.id,
                                  e.target.value as PaymentMethod
                                )
                              }
                              className="px-2.5 py-1.5 rounded border border-[#E5DEC9] bg-white text-xs"
                            >
                              <option value="Virement bancaire">Virement bancaire</option>
                              <option value="Chèque">Chèque</option>
                              <option value="Espèces">Espèces</option>
                            </select>
                          </td>
                          <td className="py-3.5 px-3">
                            <button
                              type="button"
                              onClick={() => handleToggleInvoicePaid(inv.id)}
                              className={`px-3 py-1 rounded text-xs font-semibold ${
                                inv.status === 'Payée'
                                  ? 'bg-[#E7F5ED] text-[#1E6B43] border border-[#BCE3CB]'
                                  : 'bg-[#FDF3E2] text-[#9C6214] border border-[#F3D9A6]'
                              }`}
                            >
                              {inv.status}
                            </button>
                          </td>
                          <td className="py-3.5 pl-3">
                            <div className="flex justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setPrintPreview({ mode: 'invoice', doc: inv })}
                                className="px-2.5 py-1.5 rounded border border-[#E5DEC9] text-xs font-semibold text-[#0E281B] hover:border-[#0E281B]"
                              >
                                PDF
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setWaContext({
                                    clientName: inv.clientName,
                                    clientPhone: inv.clientPhone,
                                    city: inv.clientCity,
                                    service: inv.title,
                                    quoteNumber: inv.number,
                                    totalTTC: tot,
                                    initialTemplate: 'facture',
                                  })
                                }
                                className="px-2.5 py-1.5 rounded bg-[#1E7D4B] text-white text-xs font-semibold hover:bg-[#16623A]"
                              >
                                WhatsApp
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            ) : (
              <ModulePreviewLock
                title="Facturation, encaissements & PDF A4"
                description="Transformez vos devis acceptés en factures conformes (franchise TVA art. 293 B ou taux 10% / 20%), suivez les règlements et exportez vos documents A4 prêts à imprimer."
                requiredFormula="Formule 04 · Devis & Factures"
                highlights={[
                  'Conversion devis → facture en 1 clic',
                  'Suivi Virement / Chèque / Espèces',
                  'Export PDF A4 haute netteté',
                  'Relance ou envoi facture par WhatsApp',
                ]}
                onRequestUnlock={() => {
                  setUnlockReason(null);
                  setShowUnlockModal(true);
                }}
                onBackToSite={onBackToSite}
              />
            ))}

          {/* ========== TAB 5 : PLANNING CHANTIERS ========== */}
          {activeTab === 'planning' &&
            (isModuleUnlockedInPreview('admin', 'planning', !isPreviewOnly) ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <form
                onSubmit={handleAddEvent}
                className="lg:col-span-4 bg-white border border-[#E5DEC9] rounded-xl p-6 space-y-3.5"
              >
                <h2 className="font-serif text-2xl font-semibold text-[#0E281B]">
                  Planifier un passage
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Date</label>
                    <input
                      type="date"
                      required
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                      className="w-full px-3 py-2 rounded border border-[#E5DEC9] bg-[#FAF8F3] text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Créneau</label>
                    <input
                      type="text"
                      value={newEvent.timeSlot}
                      onChange={(e) => setNewEvent({ ...newEvent, timeSlot: e.target.value })}
                      className="w-full px-3 py-2 rounded border border-[#E5DEC9] bg-[#FAF8F3] text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Type d’intervention</label>
                  <select
                    value={newEvent.type}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, type: e.target.value as EventType })
                    }
                    className="w-full px-3 py-2 rounded border border-[#E5DEC9] bg-[#FAF8F3] text-sm"
                  >
                    <option value="Visite technique">Visite technique</option>
                    <option value="Taille d’oliviers & Récolte">Taille d’oliviers &amp; Récolte</option>
                    <option value="Élagage & OLD">Élagage &amp; OLD</option>
                    <option value="Entretien parc & jardin">Entretien parc &amp; jardin</option>
                    <option value="Arrosage automatique">Arrosage automatique</option>
                    <option value="Conseil & Soins">Conseil &amp; Soins</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Client *</label>
                  <input
                    type="text"
                    required
                    value={newEvent.clientName}
                    onChange={(e) => setNewEvent({ ...newEvent, clientName: e.target.value })}
                    placeholder="Nom du client"
                    className="w-full px-3 py-2 rounded border border-[#E5DEC9] bg-[#FAF8F3] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Commune</label>
                  <input
                    type="text"
                    value={newEvent.city}
                    onChange={(e) => setNewEvent({ ...newEvent, city: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-[#E5DEC9] bg-[#FAF8F3] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Matériel / Notes</label>
                  <textarea
                    rows={2}
                    value={newEvent.notes}
                    onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })}
                    placeholder="Broyeur, filets olives, code portail…"
                    className="w-full px-3 py-2 rounded border border-[#E5DEC9] bg-[#FAF8F3] text-xs"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded bg-[#0E281B] text-white text-xs font-semibold hover:bg-[#163B29]"
                >
                  Ajouter au planning
                </button>
              </form>

              <div className="lg:col-span-8 bg-white border border-[#E5DEC9] rounded-xl p-6 space-y-3">
                <h2 className="font-serif text-2xl font-semibold text-[#0E281B] pb-3 border-b border-[#E5DEC9]">
                  Agenda des visites &amp; chantiers
                </h2>
                <div className="divide-y divide-[#E5DEC9]">
                  {store.events.map((evt) => (
                    <div
                      key={evt.id}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            setStore((prev) => ({
                              ...prev,
                              events: prev.events.map((item) =>
                                item.id === evt.id
                                  ? { ...item, completed: !item.completed }
                                  : item
                              ),
                            }))
                          }
                          aria-label={`Marquer ${evt.clientName} comme terminé`}
                          className={`mt-0.5 ${
                            evt.completed ? 'text-[#1E6B43]' : 'text-[#647068]'
                          }`}
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                        <div className={evt.completed ? 'opacity-55 line-through' : ''}>
                          <div className="font-mono text-xs font-semibold text-[#9C7228]">
                            {evt.date} · {evt.timeSlot} · {evt.city}
                          </div>
                          <div className="text-sm font-semibold text-[#0E281B]">
                            {evt.type} — {evt.clientName}
                          </div>
                          {evt.notes && <p className="text-xs text-[#647068]">{evt.notes}</p>}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setStore((prev) => ({
                            ...prev,
                            events: prev.events.filter((item) => item.id !== evt.id),
                          }))
                        }
                        aria-label={`Supprimer le rendez-vous ${evt.clientName}`}
                        className="text-xs text-[#9B2C2C] hover:underline self-end sm:self-center"
                      >
                        Supprimer
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            ) : (
              <ModulePreviewLock
                title="Planning des chantiers & visites"
                description="Organisez vos tournées hebdomadaires entre Grasse, Cabris et Mougins, notez les accès et matériels nécessaires et synchronisez chaque passage avec l’application terrain."
                requiredFormula="Formule 04 · Gestion complète"
                highlights={[
                  'Planification par créneau et type d’intervention',
                  'Checklist matériel (broyeur, filets, nacelle)',
                  'Suivi d’avancement en temps réel',
                  'Synchronisation avec la tournée mobile /app',
                ]}
                onRequestUnlock={() => {
                  setUnlockReason(null);
                  setShowUnlockModal(true);
                }}
                onBackToSite={onBackToSite}
              />
            ))}

          {/* ========== TAB 6 : CLIENTS & TERRAINS ========== */}
          {activeTab === 'clients' &&
            (isModuleUnlockedInPreview('admin', 'clients', !isPreviewOnly) ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <form
                onSubmit={handleAddClient}
                className="lg:col-span-4 bg-white border border-[#E5DEC9] rounded-xl p-6 space-y-3"
              >
                <h2 className="font-serif text-2xl font-semibold text-[#0E281B]">
                  Nouvelle fiche terrain
                </h2>
                <input
                  type="text"
                  required
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  placeholder="Nom client / Domaine *"
                  className="w-full px-3 py-2 rounded border border-[#E5DEC9] bg-[#FAF8F3] text-sm"
                />
                <input
                  type="tel"
                  required
                  value={newClient.phone}
                  onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                  placeholder="Téléphone *"
                  className="w-full px-3 py-2 rounded border border-[#E5DEC9] bg-[#FAF8F3] text-sm"
                />
                <input
                  type="text"
                  value={newClient.city}
                  onChange={(e) => setNewClient({ ...newClient, city: e.target.value })}
                  placeholder="Commune"
                  className="w-full px-3 py-2 rounded border border-[#E5DEC9] bg-[#FAF8F3] text-sm"
                />
                <input
                  type="text"
                  value={newClient.address}
                  onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                  placeholder="Adresse précise"
                  className="w-full px-3 py-2 rounded border border-[#E5DEC9] bg-[#FAF8F3] text-sm"
                />
                <div>
                  <label className="block text-xs font-semibold mb-1">Nombre d’oliviers</label>
                  <input
                    type="number"
                    min="0"
                    value={newClient.oliveTreesCount}
                    onChange={(e) =>
                      setNewClient({
                        ...newClient,
                        oliveTreesCount: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 rounded border border-[#E5DEC9] bg-[#FAF8F3] text-sm font-mono-num"
                  />
                </div>
                <div className="flex flex-col gap-1.5 text-xs">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newClient.isOldZone}
                      onChange={(e) => setNewClient({ ...newClient, isOldZone: e.target.checked })}
                    />
                    <span>Terrain soumis aux OLD (06)</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newClient.hasAutoIrrigation}
                      onChange={(e) =>
                        setNewClient({ ...newClient, hasAutoIrrigation: e.target.checked })
                      }
                    />
                    <span>Équipé d’un arrosage automatique</span>
                  </label>
                </div>
                <textarea
                  rows={2}
                  value={newClient.accessNotes}
                  onChange={(e) => setNewClient({ ...newClient, accessNotes: e.target.value })}
                  placeholder="Accès, digicode, présence animaux / biodiversité…"
                  className="w-full px-3 py-2 rounded border border-[#E5DEC9] bg-[#FAF8F3] text-xs"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded bg-[#0E281B] text-white text-xs font-semibold hover:bg-[#163B29]"
                >
                  Enregistrer le terrain
                </button>
              </form>

              <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                {store.clients.map((cli) => (
                  <div
                    key={cli.id}
                    className="bg-white border border-[#E5DEC9] rounded-xl p-5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-[#9C7228] mb-1">
                        {cli.city}
                      </div>
                      <h3 className="font-serif text-xl font-semibold text-[#0E281B] mb-1">
                        {cli.name}
                      </h3>
                      <p className="text-xs text-[#647068] mb-3">
                        {cli.address || cli.city} · {cli.phone}
                      </p>

                      <div className="text-xs text-[#3E4A43] space-y-1 py-3 border-y border-[#F3EFE5] mb-3">
                        <div className="tabular-nums">
                          Oliviers recensés : <strong>{cli.oliveTreesCount}</strong>
                        </div>
                        <div>
                          Zone OLD 06 : <strong>{cli.isOldZone ? 'Oui' : 'Non'}</strong> · Arrosage
                          auto : <strong>{cli.hasAutoIrrigation ? 'Oui' : 'Non'}</strong>
                        </div>
                      </div>
                      {cli.accessNotes && (
                        <p className="text-xs text-[#647068] mb-4">{cli.accessNotes}</p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setWaContext({
                            clientName: cli.name,
                            clientPhone: cli.phone,
                            city: cli.city,
                            initialTemplate: 'visite',
                          })
                        }
                        className="flex-1 py-2 rounded bg-[#1E7D4B] text-white text-xs font-semibold hover:bg-[#16623A]"
                      >
                        WhatsApp
                      </button>
                      <a
                        href={`tel:${cli.phone.replace(/\s+/g, '')}`}
                        className="flex-1 py-2 rounded border border-[#E5DEC9] text-center text-xs font-semibold text-[#0E281B] hover:border-[#0E281B]"
                      >
                        Appeler
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            ) : (
              <ModulePreviewLock
                title="Fiches clients, terrains & zones OLD 06"
                description="Centralisez l’historique de chaque propriété (nombre d’oliviers, périmètre OLD 06, arrosage automatique, digicodes d’accès) pour gagner du temps avant chaque visite."
                requiredFormula="Formule 05 / 06 · Suivi Propriétés"
                highlights={[
                  'Inventaire oliviers & équipements arrosage',
                  'Repérage des parcelles soumises aux OLD 06',
                  'Codes portail et consignes de sécurité',
                  'Contact téléphone / WhatsApp instantané',
                ]}
                onRequestUnlock={() => {
                  setUnlockReason(null);
                  setShowUnlockModal(true);
                }}
                onBackToSite={onBackToSite}
              />
            ))}

          {/* ========== TAB 7 : RESEAUX SOCIAUX & LANCEMENT ========== */}
          {activeTab === 'social' &&
            (isModuleUnlockedInPreview('admin', 'social', !isPreviewOnly) ? (
              <SocialLaunchKit />
            ) : (
              <ModulePreviewLock
                title="Réseaux sociaux & Kit de lancement (PNG)"
                description="Téléchargez vos flyers Affiche A4, visuels Instagram/WhatsApp prêts à publier et textes d’annonce géolocalisés pour démarrer votre visibilité sur le Pays de Grasse."
                requiredFormula="Formule 03+ · Kit de lancement"
                highlights={[
                  'Flyers et vignettes PNG téléchargeables',
                  'Textes prêts à copier (Google, Instagram, Facebook)',
                  'QR Code vers votre vitrine professionnelle',
                  'Plan d’action terrain des 7 premiers jours',
                ]}
                onRequestUnlock={() => {
                  setUnlockReason(null);
                  setShowUnlockModal(true);
                }}
                onBackToSite={onBackToSite}
              />
            ))}

          {/* ========== TAB 8 : SAUVEGARDE JSON ========== */}
          {activeTab === 'backup' &&
            (isModuleUnlockedInPreview('admin', 'backup', !isPreviewOnly) ? (
            <div className="bg-white border border-[#E5DEC9] rounded-xl p-6 max-w-2xl space-y-5">
              <div>
                <h2 className="font-serif text-2xl font-semibold text-[#0E281B] mb-1">
                  Sauvegarde &amp; portabilité de vos données (0 €)
                </h2>
                <p className="text-sm text-[#647068]">
                  Vos données de gestion sont enregistrées localement dans votre navigateur. Exportez
                  régulièrement une copie JSON pour archiver vos devis, factures et fiches terrains.
                </p>
              </div>

              {backupNotice && (
                <div className="p-3.5 rounded bg-[#E7F5ED] border border-[#BCE3CB] text-xs font-semibold text-[#1E6B43]">
                  {backupNotice}
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleExportJson}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-[#0E281B] text-white text-xs font-semibold hover:bg-[#163B29]"
                >
                  <Download className="w-4 h-4" />
                  <span>Télécharger sauvegarde (.json)</span>
                </button>

                <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded border border-[#E5DEC9] bg-[#FAF8F3] text-xs font-semibold text-[#0E281B] hover:border-[#B5893A] cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>Importer une sauvegarde (.json)</span>
                  <input
                    type="file"
                    accept="application/json"
                    onChange={handleImportJson}
                    className="sr-only"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => {
                    const fresh = resetAdminStore();
                    setStore(fresh);
                    setSelectedQuoteId(fresh.quotes[0]?.id ?? null);
                    setBackupNotice('Données de démonstration réinitialisées.');
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded border border-[#F4C7C7] bg-[#FDECEC] text-xs font-semibold text-[#9B2C2C]"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Réinitialiser la démo</span>
                </button>
              </div>
            </div>
            ) : (
              <ModulePreviewLock
                title="Sauvegarde & portabilité JSON (0 €)"
                description="Exportez à tout moment l’intégralité de vos devis, factures, fiches clients et planning au format JSON ouvert pour conserver une archive locale sans abonnement cloud."
                requiredFormula="Formule 03+ · Portabilité données"
                highlights={[
                  'Export complet en 1 clic (.json)',
                  'Restauration sécurisée sur un nouvel ordinateur',
                  'Propriété intégrale de votre fichier client',
                  'Zéro dépendance et zéro loyer caché',
                ]}
                onRequestUnlock={() => {
                  setUnlockReason(null);
                  setShowUnlockModal(true);
                }}
                onBackToSite={onBackToSite}
              />
            ))}
        </main>
      </div>

      {/* Modales PDF, WhatsApp & Activation */}
      {!isPreviewOnly && printPreview && (
        <PrintDocumentModal
          mode={printPreview.mode}
          doc={printPreview.doc}
          onClose={() => setPrintPreview(null)}
        />
      )}
      {!isPreviewOnly && waContext && (
        <WhatsAppComposerModal
          clientName={waContext.clientName}
          clientPhone={waContext.clientPhone}
          city={waContext.city}
          service={waContext.service}
          quoteNumber={waContext.quoteNumber}
          totalTTC={waContext.totalTTC}
          initialTemplate={waContext.initialTemplate}
          onClose={() => setWaContext(null)}
        />
      )}
      {showUnlockModal && (
        <UnlockLicenseModal
          area="admin"
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
