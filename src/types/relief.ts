export type LeadStatus =
  | 'Nouvelle'
  | 'Visite terrain'
  | 'Devis envoyé'
  | 'Acceptée'
  | 'Terminée'
  | 'Archivée';

export type LeadSource = 'Site vitrine' | 'Téléphone' | 'WhatsApp' | 'Recommandation';

export interface Lead {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  email?: string;
  city: string;
  service: string;
  details: string;
  status: LeadStatus;
  source: LeadSource;
}

export type VatRate = 0 | 10 | 20;

export interface QuoteLine {
  id: string;
  label: string;
  unit: string;
  quantity: number;
  unitPriceHT: number;
}

export type QuoteStatus = 'Brouillon' | 'Envoyé' | 'Accepté' | 'Refusé';

export interface Quote {
  id: string;
  number: string;
  leadId?: string;
  createdAt: string;
  validUntil: string;
  clientName: string;
  clientPhone: string;
  clientCity: string;
  clientAddress?: string;
  title: string;
  vatRate: VatRate;
  lines: QuoteLine[];
  notes: string;
  status: QuoteStatus;
}

export type InvoiceStatus = 'À encaisser' | 'Payée';
export type PaymentMethod = 'Virement bancaire' | 'Chèque' | 'Espèces';

export interface Invoice {
  id: string;
  number: string;
  quoteId?: string;
  quoteNumber?: string;
  issuedAt: string;
  dueAt: string;
  clientName: string;
  clientPhone: string;
  clientCity: string;
  clientAddress?: string;
  title: string;
  vatRate: VatRate;
  lines: QuoteLine[];
  status: InvoiceStatus;
  paymentMethod: PaymentMethod;
  paidAt?: string;
}

export type EventType =
  | 'Visite technique'
  | 'Taille d’oliviers & Récolte'
  | 'Élagage & OLD'
  | 'Entretien parc & jardin'
  | 'Arrosage automatique'
  | 'Conseil & Soins';

export interface PlanningEvent {
  id: string;
  date: string;
  timeSlot: string;
  type: EventType;
  clientName: string;
  city: string;
  notes: string;
  completed: boolean;
}

export interface ClientProperty {
  id: string;
  name: string;
  phone: string;
  email?: string;
  city: string;
  address: string;
  oliveTreesCount: number;
  isOldZone: boolean;
  hasAutoIrrigation: boolean;
  accessNotes: string;
}

export interface AdminStore {
  leads: Lead[];
  quotes: Quote[];
  invoices: Invoice[];
  events: PlanningEvent[];
  clients: ClientProperty[];
}

export type BillingMode = 'once' | 'three' | 'sub';

export interface CatalogItem {
  id: string;
  category: string;
  label: string;
  unit: string;
  unitPriceHT: number;
}
