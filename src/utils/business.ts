import type {
  AdminStore,
  Invoice,
  Lead,
  Quote,
  QuoteLine,
  VatRate,
} from '../types/relief';

export function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateLineTotalHT(quantity: number, unitPriceHT: number): number {
  const safeQty = Number.isFinite(quantity) && quantity > 0 ? quantity : 0;
  const safePrice = Number.isFinite(unitPriceHT) && unitPriceHT >= 0 ? unitPriceHT : 0;
  return roundCurrency(safeQty * safePrice);
}

export function calculateDocumentTotals(
  lines: Pick<QuoteLine, 'quantity' | 'unitPriceHT'>[],
  vatRate: VatRate
): { totalHT: number; totalTVA: number; totalTTC: number } {
  const totalHT = roundCurrency(
    lines.reduce((sum, line) => sum + calculateLineTotalHT(line.quantity, line.unitPriceHT), 0)
  );
  const totalTVA = roundCurrency(totalHT * (vatRate / 100));
  const totalTTC = roundCurrency(totalHT + totalTVA);
  return { totalHT, totalTVA, totalTTC };
}

export function formatEuro(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(roundCurrency(amount));
}

export function normalizeFrenchPhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, '');
  if (!digits) return '';
  if (digits.startsWith('+')) {
    return digits.slice(1);
  }
  if (digits.startsWith('00')) {
    return digits.slice(2);
  }
  if (digits.startsWith('0') && digits.length === 10) {
    return '33' + digits.slice(1);
  }
  return digits;
}

export function formatWhatsAppUrl(phone: string, message: string): string {
  const normalized = normalizeFrenchPhoneForWhatsApp(phone);
  const encoded = encodeURIComponent(message);
  if (!normalized) {
    return `https://wa.me/?text=${encoded}`;
  }
  return `https://wa.me/${normalized}?text=${encoded}`;
}

export type WhatsAppTemplateType =
  | 'reception'
  | 'visite'
  | 'devis'
  | 'chantier'
  | 'facture';

export function buildWhatsAppTemplate(
  type: WhatsAppTemplateType,
  ctx: {
    clientName: string;
    city?: string;
    service?: string;
    quoteNumber?: string;
    totalTTC?: number;
    dateStr?: string;
  }
): string {
  const firstName = ctx.clientName.trim() || 'Madame, Monsieur';
  const cityNote = ctx.city ? ` à ${ctx.city}` : '';
  const serviceNote = ctx.service || 'vos espaces extérieurs';

  switch (type) {
    case 'reception':
      return `Bonjour ${firstName},\n\nJe suis Jason Claude (Relief Paysage, Grasse). J'ai bien reçu votre demande concernant « ${serviceNote} »${cityNote}.\n\nQuand seriez-vous disponible cette semaine pour une brève visite technique sur place afin d'établir votre devis précis ?\n\nBien cordialement,\nJason Claude — 06 19 86 10 45`;
    case 'visite':
      return `Bonjour ${firstName},\n\nJe vous confirme notre rendez-vous de visite technique${cityNote}${ctx.dateStr ? ` le ${ctx.dateStr}` : ''} pour étudier votre projet (${serviceNote}).\n\nN'hésitez pas à m'indiquer un éventuel code portail ou accès particulier.\n\nÀ très bientôt,\nRelief Paysage — 06 19 86 10 45`;
    case 'devis':
      return `Bonjour ${firstName},\n\nSuite à notre échange, votre devis${ctx.quoteNumber ? ` n° ${ctx.quoteNumber}` : ''}${ctx.totalTTC !== undefined ? ` d'un montant de ${formatEuro(ctx.totalTTC)}` : ''} pour « ${serviceNote} » est prêt.\n\nJe reste à votre écoute pour ajuster les détails ou planifier l'intervention.\n\nCordialement,\nJason Claude — Relief Paysage`;
    case 'chantier':
      return `Bonjour ${firstName},\n\nVotre intervention Relief Paysage${cityNote} (${serviceNote}) est confirmée${ctx.dateStr ? ` pour le ${ctx.dateStr}` : ''}.\n\nJe vous préviendrai par message dès mon arrivée sur le terrain.\n\nBelle journée,\nJason Claude — 06 19 86 10 45`;
    case 'facture':
      return `Bonjour ${firstName},\n\nLes travaux${cityNote} sont désormais achevés. Vous trouverez ci-joint la facture correspondante${ctx.quoteNumber ? ` (${ctx.quoteNumber})` : ''}${ctx.totalTTC !== undefined ? ` de ${formatEuro(ctx.totalTTC)}` : ''}.\n\nMerci pour votre confiance et au plaisir d'entretenir votre domaine.\n\nJason Claude — Relief Paysage`;
  }
}

export function nextSequentialNumber(prefix: string, existingNumbers: string[], year = 2026): string {
  const pattern = new RegExp(`^${prefix}-${year}-(\\d+)$`);
  let maxSeq = 0;
  for (const num of existingNumbers) {
    const match = num.match(pattern);
    if (match) {
      const parsed = Number.parseInt(match[1], 10);
      if (parsed > maxSeq) maxSeq = parsed;
    }
  }
  const next = String(maxSeq + 1).padStart(3, '0');
  return `${prefix}-${year}-${next}`;
}

export function buildPrefilledLinesForService(service: string): QuoteLine[] {
  const s = service.toLowerCase();
  if (s.includes('olivier') || s.includes('olive') || s.includes('récolte')) {
    return [
      {
        id: 'line-1',
        label: 'Taille raisonnée d’oliviers (éclaircie et équilibre de la ramure)',
        unit: 'arbre',
        quantity: 6,
        unitPriceHT: 65,
      },
      {
        id: 'line-2',
        label: 'Accompagnement au ramassage / récolte des olives et mise en caisse',
        unit: 'demi-journée',
        quantity: 1,
        unitPriceHT: 210,
      },
      {
        id: 'line-3',
        label: 'Broyage sur place ou évacuation des branches et rémanents',
        unit: 'forfait',
        quantity: 1,
        unitPriceHT: 95,
      },
    ];
  }
  if (s.includes('old') || s.includes('forest') || s.includes('élagage')) {
    return [
      {
        id: 'line-1',
        label: 'Débroussaillement réglementaire OLD 06 (mise à distance & strate basse)',
        unit: '100 m²',
        quantity: 5,
        unitPriceHT: 130,
      },
      {
        id: 'line-2',
        label: 'Élagage de sécurité / suppression bois mort et remontée de couronne',
        unit: 'arbre',
        quantity: 3,
        unitPriceHT: 140,
      },
      {
        id: 'line-3',
        label: 'Broyage et gestion des déchets verts forestiers',
        unit: 'forfait',
        quantity: 1,
        unitPriceHT: 160,
      },
    ];
  }
  if (s.includes('arrosage')) {
    return [
      {
        id: 'line-1',
        label: 'Étude hydraulique, calepinage et pose programmateur multizone',
        unit: 'forfait',
        quantity: 1,
        unitPriceHT: 280,
      },
      {
        id: 'line-2',
        label: 'Réseau goutte-à-goutte autorégulant (massifs, haies et oliviers)',
        unit: 'mètre linéaire',
        quantity: 80,
        unitPriceHT: 6.5,
      },
      {
        id: 'line-3',
        label: 'Tests d’étanchéité et réglage des cycles saisonniers',
        unit: 'forfait',
        quantity: 1,
        unitPriceHT: 90,
      },
    ];
  }
  if (s.includes('phyto') || s.includes('sanitaire')) {
    return [
      {
        id: 'line-1',
        label: 'Diagnostic sanitaire des végétaux et inspection ravageurs / carences',
        unit: 'forfait',
        quantity: 1,
        unitPriceHT: 120,
      },
      {
        id: 'line-2',
        label: 'Soins préventifs raisonnés & solutions biocontrôle autorisées',
        unit: 'intervention',
        quantity: 1,
        unitPriceHT: 165,
      },
    ];
  }
  if (s.includes('création') || s.includes('aménagement')) {
    return [
      {
        id: 'line-1',
        label: 'Préparation des sols, amendement organique et mise en forme de massif',
        unit: 'm²',
        quantity: 25,
        unitPriceHT: 28,
      },
      {
        id: 'line-2',
        label: 'Fourniture et plantation de sujets méditerranéens (lavandes, agapanthes, romarins)',
        unit: 'lot',
        quantity: 1,
        unitPriceHT: 420,
      },
      {
        id: 'line-3',
        label: 'Paillage minéral ou végétal anti-évaporation',
        unit: 'm²',
        quantity: 25,
        unitPriceHT: 18,
      },
    ];
  }
  return [
    {
      id: 'line-1',
      label: 'Entretien complet de parc & jardin (tonte, bordures, désherbage manuel)',
      unit: 'forfait visite',
      quantity: 1,
      unitPriceHT: 240,
    },
    {
      id: 'line-2',
      label: 'Taille d’arbustes d’ornement et nettoyage des massifs',
      unit: 'heure',
      quantity: 3,
      unitPriceHT: 55,
    },
    {
      id: 'line-3',
      label: 'Ramassage et évacuation des déchets verts en filière agréée',
      unit: 'forfait',
      quantity: 1,
      unitPriceHT: 75,
    },
  ];
}

export function createPrefilledQuoteFromLead(
  lead: Lead,
  existingQuotes: Quote[],
  todayIso = new Date().toISOString().slice(0, 10)
): Quote {
  const number = nextSequentialNumber(
    'DEV',
    existingQuotes.map((q) => q.number),
    Number.parseInt(todayIso.slice(0, 4), 10) || 2026
  );
  const validDate = new Date(todayIso);
  validDate.setDate(validDate.getDate() + 30);
  const validUntil = validDate.toISOString().slice(0, 10);

  return {
    id: 'quote-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
    number,
    leadId: lead.id,
    createdAt: todayIso,
    validUntil,
    clientName: lead.name,
    clientPhone: lead.phone,
    clientCity: lead.city,
    title: lead.service,
    vatRate: 0,
    lines: buildPrefilledLinesForService(lead.service),
    notes: lead.details
      ? `Contexte client : ${lead.details}`
      : 'Intervention dans les règles de l’art, évacuation des rémanents comprise.',
    status: 'Brouillon',
  };
}

export function convertQuoteToInvoice(
  quote: Quote,
  existingInvoices: Invoice[],
  todayIso = new Date().toISOString().slice(0, 10)
): Invoice {
  const number = nextSequentialNumber(
    'FAC',
    existingInvoices.map((inv) => inv.number),
    Number.parseInt(todayIso.slice(0, 4), 10) || 2026
  );
  const dueDate = new Date(todayIso);
  dueDate.setDate(dueDate.getDate() + 15);

  return {
    id: 'inv-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
    number,
    quoteId: quote.id,
    quoteNumber: quote.number,
    issuedAt: todayIso,
    dueAt: dueDate.toISOString().slice(0, 10),
    clientName: quote.clientName,
    clientPhone: quote.clientPhone,
    clientCity: quote.clientCity,
    clientAddress: quote.clientAddress,
    title: quote.title,
    vatRate: quote.vatRate,
    lines: quote.lines.map((l) => ({ ...l })),
    status: 'À encaisser',
    paymentMethod: 'Virement bancaire',
  };
}

export function computeAdminKpis(store: AdminStore): {
  activeLeadsCount: number;
  newLeadsCount: number;
  pendingQuotesCount: number;
  pendingQuotesTotalTTC: number;
  upcomingEventsCount: number;
  invoicedPaidTotalTTC: number;
  invoicedPendingTotalTTC: number;
} {
  const activeLeadsCount = store.leads.filter(
    (l) => l.status !== 'Terminée' && l.status !== 'Archivée'
  ).length;
  const newLeadsCount = store.leads.filter((l) => l.status === 'Nouvelle').length;

  const openQuotes = store.quotes.filter(
    (q) => q.status === 'Brouillon' || q.status === 'Envoyé'
  );
  const pendingQuotesTotalTTC = roundCurrency(
    openQuotes.reduce(
      (sum, q) => sum + calculateDocumentTotals(q.lines, q.vatRate).totalTTC,
      0
    )
  );

  const upcomingEventsCount = store.events.filter((e) => !e.completed).length;

  const invoicedPaidTotalTTC = roundCurrency(
    store.invoices
      .filter((i) => i.status === 'Payée')
      .reduce(
        (sum, i) => sum + calculateDocumentTotals(i.lines, i.vatRate).totalTTC,
        0
      )
  );
  const invoicedPendingTotalTTC = roundCurrency(
    store.invoices
      .filter((i) => i.status === 'À encaisser')
      .reduce(
        (sum, i) => sum + calculateDocumentTotals(i.lines, i.vatRate).totalTTC,
        0
      )
  );

  return {
    activeLeadsCount,
    newLeadsCount,
    pendingQuotesCount: openQuotes.length,
    pendingQuotesTotalTTC,
    upcomingEventsCount,
    invoicedPaidTotalTTC,
    invoicedPendingTotalTTC,
  };
}

export function validateLeadInput(input: {
  name: string;
  phone: string;
  city: string;
  details: string;
}): string | null {
  if (input.name.trim().length < 2) {
    return 'Veuillez renseigner votre nom ou prénom.';
  }
  const phoneDigits = input.phone.replace(/\D/g, '');
  if (phoneDigits.length < 10) {
    return 'Veuillez saisir un numéro de téléphone valide (au moins 10 chiffres).';
  }
  if (input.city.trim().length < 2) {
    return 'Veuillez indiquer la commune du terrain.';
  }
  if (input.details.trim().length < 5) {
    return 'Veuillez préciser brièvement votre besoin.';
  }
  return null;
}
