import assert from 'node:assert/strict';
import test from 'node:test';
import { computeDuelComparison, formatOfferDelta } from './offersLogic';

test('formatOfferDelta formats positive, negative and zero deltas across all 3 billing modes', () => {
  assert.equal(formatOfferDelta(0, 'once'), 'Tarif identique');
  assert.equal(formatOfferDelta(1900, 'once'), '+ 1 900 €');
  assert.equal(formatOfferDelta(-600, 'once'), '− 600 €');
  assert.equal(formatOfferDelta(160, 'sub'), '+ 160 €/mois');
  assert.equal(formatOfferDelta(633.34, 'three'), '+ 633,34 €/mois (×3)');
});

test('computeDuelComparison highlights exact price delta and unlocked features between Formule 03 and Formule 06', () => {
  const duel = computeDuelComparison(2, 5, 'once');
  assert.equal(duel.priceDiff, 1900);
  assert.equal(duel.formattedDiff, '+ 1 900 €');
  assert.ok(duel.rightUpgradesCount >= 4);

  const appRow = duel.rows.find((r) => r.row.id === 'appli-terrain-pwa');
  assert.equal(appRow?.leftCell.status, 'none');
  assert.equal(appRow?.rightCell.status, 'best');
  assert.equal(appRow?.outcome, 'right-better');
});
