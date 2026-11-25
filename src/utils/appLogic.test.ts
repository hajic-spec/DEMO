import assert from 'node:assert/strict';
import test from 'node:test';
import { INITIAL_ADMIN_STORE } from '../data/seedData.ts';
import {
  buildExpressFieldQuote,
  buildGoogleMapsDirectionsUrl,
  calculateOldComplianceScore,
  computeTerrainDayMetrics,
  estimateOliveHarvestKg,
  formatHumanDuration,
  formatStopwatchDuration,
  getLatestLogForClient,
  getSeasonalAlertsForMonth,
  INITIAL_FIELD_LOGS,
} from './appLogic.ts';
import { calculateDocumentTotals } from './business.ts';

test('formatStopwatchDuration & formatHumanDuration format durations cleanly', () => {
  assert.equal(formatStopwatchDuration(0), '00:00:00');
  assert.equal(formatStopwatchDuration(65), '00:01:05');
  assert.equal(formatStopwatchDuration(3661), '01:01:01');
  assert.equal(formatStopwatchDuration(-15), '00:00:00');
  assert.equal(formatHumanDuration(2700), '45 min');
  assert.equal(formatHumanDuration(7800), '2h 10min');
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
  const totals = calculateDocumentTotals(quote.lines, quote.vatRate);
  assert.equal(totals.totalTTC, 1395);
});

test('computeTerrainDayMetrics, getLatestLogForClient, and buildGoogleMapsDirectionsUrl work accurately', () => {
  const metrics = computeTerrainDayMetrics(
    INITIAL_ADMIN_STORE.events,
    INITIAL_FIELD_LOGS,
    INITIAL_ADMIN_STORE.quotes
  );
  assert.equal(metrics.pendingStops, 3);
  assert.equal(metrics.completedStops, 0);
  assert.equal(metrics.totalOlivesSurveyed, 21);
  assert.equal(metrics.totalLoggedMinutes, 220);
  assert.equal(metrics.openQuotesTotalTTC, 955);

  const log = getLatestLogForClient(INITIAL_FIELD_LOGS, INITIAL_ADMIN_STORE.clients[0]);
  assert.ok(log && log.id === 'log-demo-1');

  const url = buildGoogleMapsDirectionsUrl('1 Avenue de la Libération', 'Grasse');
  assert.ok(url.startsWith('https://www.google.com/maps/search/?api=1&query='));
  assert.ok(url.includes('Grasse'));
});

test('getSeasonalAlertsForMonth returns relevant seasonal actions across the year', () => {
  assert.ok(getSeasonalAlertsForMonth(11).some((a) => a.title.toLowerCase().includes('récolte')));
  assert.ok(getSeasonalAlertsForMonth(3).some((a) => a.title.toLowerCase().includes('taille')));
  assert.ok(getSeasonalAlertsForMonth(7).some((a) => a.title.toLowerCase().includes('arrosage')));
});
