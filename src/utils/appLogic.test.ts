import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildExpressFieldQuote,
  calculateOldComplianceScore,
  estimateOliveHarvestKg,
  formatStopwatchDuration,
  getSeasonalAlertsForMonth,
} from './appLogic.ts';
import { calculateDocumentTotals } from './business.ts';

test('formatStopwatchDuration formats seconds into HH:MM:SS cleanly', () => {
  assert.equal(formatStopwatchDuration(0), '00:00:00');
  assert.equal(formatStopwatchDuration(65), '00:01:05');
  assert.equal(formatStopwatchDuration(3661), '01:01:01');
  assert.equal(formatStopwatchDuration(-15), '00:00:00');
});

test('estimateOliveHarvestKg computes realistic Grasse olive yield', () => {
  assert.equal(estimateOliveHarvestKg(10, 'faible'), 120);
  assert.equal(estimateOliveHarvestKg(14, 'moyenne'), 266);
  assert.equal(estimateOliveHarvestKg(5, 'abondante'), 140);
  assert.equal(estimateOliveHarvestKg(-3, 'moyenne'), 0);
});

test('calculateOldComplianceScore evaluates OLD 06 conformity tiers', () => {
  assert.deepEqual(
    calculateOldComplianceScore({
      brushCleared50m: true,
      canopySpacing3m: true,
      roofClearance3m: true,
      accessRoadCleared: true,
      debrisEvacuated: true,
    }),
    {
      checkedCount: 5,
      totalCount: 5,
      percent: 100,
      label: 'Conforme OLD 06',
    }
  );

  const partial = calculateOldComplianceScore({
    brushCleared50m: true,
    canopySpacing3m: true,
    roofClearance3m: true,
    accessRoadCleared: false,
    debrisEvacuated: false,
  });
  assert.equal(partial.percent, 60);
  assert.equal(partial.label, 'Mise à niveau partielle');

  const nonConforme = calculateOldComplianceScore({
    brushCleared50m: true,
    canopySpacing3m: false,
    roofClearance3m: false,
    accessRoadCleared: false,
    debrisEvacuated: false,
  });
  assert.equal(nonConforme.percent, 20);
  assert.equal(nonConforme.label, 'Non conforme (intervention requise)');
});

test('buildExpressFieldQuote generates sequential quote with exact HT/TTC totals', () => {
  const quote = buildExpressFieldQuote({
    clientName: 'Domaine de Saint-Mathieu',
    clientPhone: '06 24 78 19 30',
    clientCity: 'Grasse',
    oliveTreesCount: 10,
    oldSurfaceHundreds: 4,
    irrigationMeters: 20,
    includeDebrisEvacuation: true,
    existingQuotes: [
      {
        id: 'q1',
        number: 'DEV-2026-002',
        createdAt: '2026-11-10',
        validUntil: '2026-12-10',
        clientName: 'Test',
        clientPhone: '0600000000',
        clientCity: 'Grasse',
        title: 'Test',
        vatRate: 0,
        lines: [],
        notes: '',
        status: 'Envoyé',
      },
    ],
    todayIso: '2026-11-25',
  });

  assert.equal(quote.number, 'DEV-2026-003');
  assert.equal(quote.status, 'Envoyé');
  assert.equal(quote.lines.length, 4);

  // 10 * 65 (650) + 4 * 130 (520) + 20 * 6.5 (130) + 95 = 1395
  const totals = calculateDocumentTotals(quote.lines, quote.vatRate);
  assert.equal(totals.totalTTC, 1395);
});

test('getSeasonalAlertsForMonth returns relevant seasonal actions across the year', () => {
  const november = getSeasonalAlertsForMonth(11);
  assert.ok(november.some((a) => a.title.toLowerCase().includes('récolte')));

  const march = getSeasonalAlertsForMonth(3);
  assert.ok(march.some((a) => a.title.toLowerCase().includes('taille')));

  const july = getSeasonalAlertsForMonth(7);
  assert.ok(july.some((a) => a.title.toLowerCase().includes('arrosage')));
});
