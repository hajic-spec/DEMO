import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildPrefilledLinesForService,
  buildWhatsAppTemplate,
  calculateDocumentTotals,
  computeAdminKpis,
  convertQuoteToInvoice,
  createPrefilledQuoteFromLead,
  formatWhatsAppUrl,
  nextSequentialNumber,
  normalizeFrenchPhoneForWhatsApp,
  validateLeadInput,
} from './business';
import type { AdminStore, Lead } from '../types/relief';

test('calculateDocumentTotals handles 0%, 10% and 20% TVA accurately', () => {
  const lines = [
    { quantity: 6, unitPriceHT: 65 },
    { quantity: 1, unitPriceHT: 210 },
  ];
  assert.deepEqual(calculateDocumentTotals(lines, 0), {
    totalHT: 600,
    totalTVA: 0,
    totalTTC: 600,
  });
  assert.deepEqual(calculateDocumentTotals(lines, 10), {
    totalHT: 600,
    totalTVA: 60,
    totalTTC: 660,
  });
  assert.deepEqual(calculateDocumentTotals(lines, 20), {
    totalHT: 600,
    totalTVA: 120,
    totalTTC: 720,
  });
});

test('normalizeFrenchPhoneForWhatsApp converts local 06 numbers to 336', () => {
  assert.equal(normalizeFrenchPhoneForWhatsApp('06 19 86 10 45'), '33619861045');
  assert.equal(normalizeFrenchPhoneForWhatsApp('+33 6 33 81 69 20'), '33633816920');
  const url = formatWhatsAppUrl('06 19 86 10 45', 'Bonjour');
  assert.equal(url, 'https://wa.me/33619861045?text=Bonjour');
});

test('createPrefilledQuoteFromLead pre-fills olive pruning lines and sequential number', () => {
  const lead: Lead = {
    id: 'DEM-101',
    createdAt: '2026-11-20',
    name: 'Claire Moreau',
    phone: '06 12 34 56 78',
    city: 'Cabris',
    service: "Taille d'olivier et récolte d'olives",
    details: '8 oliviers centenaires sur restanques',
    status: 'Nouvelle',
    source: 'Site vitrine',
  };

  const quote = createPrefilledQuoteFromLead(lead, [], '2026-11-25');
  assert.equal(quote.number, 'DEV-2026-001');
  assert.equal(quote.clientName, 'Claire Moreau');
  assert.equal(quote.clientCity, 'Cabris');
  assert.equal(quote.lines.length, 3);
  assert.match(quote.lines[0].label, /oliviers/i);
  assert.equal(quote.validUntil, '2026-12-25');
});

test('nextSequentialNumber increments existing DEV / FAC sequences', () => {
  assert.equal(nextSequentialNumber('FAC', ['FAC-2026-001', 'FAC-2026-004'], 2026), 'FAC-2026-005');
  assert.equal(nextSequentialNumber('DEV', [], 2026), 'DEV-2026-001');
});

test('convertQuoteToInvoice preserves quote lines and creates sequential FAC number', () => {
  const lead: Lead = {
    id: 'DEM-102',
    createdAt: '2026-11-21',
    name: 'Marc Viale',
    phone: '06 44 55 66 77',
    city: 'Grasse',
    service: 'Élagage et travaux forestiers / OLD',
    details: 'Terrain boisé 1200 m2',
    status: 'Acceptée',
    source: 'Téléphone',
  };
  const quote = createPrefilledQuoteFromLead(lead, [], '2026-11-25');
  const invoice = convertQuoteToInvoice(quote, [], '2026-11-25');

  assert.equal(invoice.number, 'FAC-2026-001');
  assert.equal(invoice.quoteNumber, 'DEV-2026-001');
  assert.equal(invoice.status, 'À encaisser');
  assert.equal(invoice.lines.length, quote.lines.length);
});

test('buildPrefilledLinesForService covers all 6 service poles', () => {
  assert.ok(buildPrefilledLinesForService('Arrosage automatique').length >= 2);
  assert.ok(buildPrefilledLinesForService('Conseil et soin phytosanitaire raisonné').length >= 2);
  assert.ok(buildPrefilledLinesForService('Création et aménagement paysager').length >= 2);
  assert.ok(buildPrefilledLinesForService('Entretien de parc et jardin').length >= 2);
});

test('buildWhatsAppTemplate produces tailored client message', () => {
  const msg = buildWhatsAppTemplate('devis', {
    clientName: 'Henri Blanc',
    city: 'Valbonne',
    service: 'Taille d’oliviers',
    quoteNumber: 'DEV-2026-003',
    totalTTC: 695,
  });
  assert.match(msg, /Henri Blanc/);
  assert.match(msg, /DEV-2026-003/);
  assert.match(msg, /695,00/);
});

test('computeAdminKpis aggregates open quotes, invoices and events', () => {
  const store: AdminStore = {
    leads: [
      {
        id: '1',
        createdAt: '2026-11-20',
        name: 'A',
        phone: '0600000001',
        city: 'Grasse',
        service: 'Oliviers',
        details: 'Test',
        status: 'Nouvelle',
        source: 'Site vitrine',
      },
      {
        id: '2',
        createdAt: '2026-11-20',
        name: 'B',
        phone: '0600000002',
        city: 'Cabris',
        service: 'OLD',
        details: 'Test',
        status: 'Terminée',
        source: 'Téléphone',
      },
    ],
    quotes: [
      {
        id: 'q1',
        number: 'DEV-2026-001',
        createdAt: '2026-11-20',
        validUntil: '2026-12-20',
        clientName: 'A',
        clientPhone: '0600000001',
        clientCity: 'Grasse',
        title: 'Oliviers',
        vatRate: 0,
        lines: [{ id: 'l1', label: 'Taille', unit: 'u', quantity: 2, unitPriceHT: 100 }],
        notes: '',
        status: 'Envoyé',
      },
    ],
    invoices: [
      {
        id: 'i1',
        number: 'FAC-2026-001',
        issuedAt: '2026-11-18',
        dueAt: '2026-12-03',
        clientName: 'B',
        clientPhone: '0600000002',
        clientCity: 'Cabris',
        title: 'OLD',
        vatRate: 0,
        lines: [{ id: 'l2', label: 'OLD', unit: 'f', quantity: 1, unitPriceHT: 500 }],
        status: 'Payée',
        paymentMethod: 'Virement bancaire',
      },
    ],
    events: [
      {
        id: 'e1',
        date: '2026-11-27',
        timeSlot: '08:30',
        type: 'Visite technique',
        clientName: 'A',
        city: 'Grasse',
        notes: 'Portail sud',
        completed: false,
      },
    ],
    clients: [],
  };

  const kpis = computeAdminKpis(store);
  assert.equal(kpis.activeLeadsCount, 1);
  assert.equal(kpis.newLeadsCount, 1);
  assert.equal(kpis.pendingQuotesCount, 1);
  assert.equal(kpis.pendingQuotesTotalTTC, 200);
  assert.equal(kpis.invoicedPaidTotalTTC, 500);
  assert.equal(kpis.upcomingEventsCount, 1);
});

test('validateLeadInput rejects invalid inputs and accepts complete inputs', () => {
  assert.ok(validateLeadInput({ name: 'A', phone: '0619861045', city: 'Grasse', details: 'Taille oliviers' }));
  assert.ok(validateLeadInput({ name: 'Jean', phone: '0619', city: 'Grasse', details: 'Taille oliviers' }));
  assert.equal(
    validateLeadInput({ name: 'Jean', phone: '06 19 86 10 45', city: 'Grasse', details: 'Taille de 5 oliviers' }),
    null
  );
});
