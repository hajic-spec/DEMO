import {
  OFFER_COMPARISON_MATRIX,
  OFFER_COMPARISON_PROFILES,
  type OfferComparisonCell,
  type OfferComparisonRow,
} from '../data/seedData';
import type { BillingMode } from '../types/relief';

export interface DuelRowComparison {
  row: OfferComparisonRow;
  leftCell: OfferComparisonCell;
  rightCell: OfferComparisonCell;
  outcome: 'same' | 'right-better' | 'left-better';
}

export interface DuelComparisonResult {
  leftIndex: number;
  rightIndex: number;
  priceDiff: number;
  formattedDiff: string;
  rightUpgradesCount: number;
  rows: DuelRowComparison[];
}

function cellRank(cell: OfferComparisonCell): number {
  if (cell.status === 'none') return 0;
  if (cell.status === 'included') return 1;
  return 2;
}

export function formatOfferDelta(diff: number, billingMode: BillingMode): string {
  if (Math.abs(diff) < 0.01) {
    return 'Tarif identique';
  }
  const abs = Math.abs(diff);
  const rounded = Number.isInteger(abs) ? String(abs) : abs.toFixed(2).replace('.', ',');
  const formattedNumber = rounded.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const sign = diff > 0 ? '+' : '−';
  if (billingMode === 'sub') return `${sign} ${formattedNumber} €/mois`;
  if (billingMode === 'three') return `${sign} ${formattedNumber} €/mois (×3)`;
  return `${sign} ${formattedNumber} €`;
}

export function computeDuelComparison(
  leftIdx: number,
  rightIdx: number,
  billingMode: BillingMode
): DuelComparisonResult {
  const safeLeft = Math.max(0, Math.min(OFFER_COMPARISON_PROFILES.length - 1, leftIdx));
  const safeRight = Math.max(0, Math.min(OFFER_COMPARISON_PROFILES.length - 1, rightIdx));

  const leftProfile = OFFER_COMPARISON_PROFILES[safeLeft];
  const rightProfile = OFFER_COMPARISON_PROFILES[safeRight];
  const priceDiff =
    Math.round(
      (rightProfile.numericPrices[billingMode] - leftProfile.numericPrices[billingMode]) * 100
    ) / 100;

  let rightUpgradesCount = 0;
  const rows: DuelRowComparison[] = OFFER_COMPARISON_MATRIX.map((row) => {
    const leftCell = row.cells[safeLeft];
    const rightCell = row.cells[safeRight];
    const leftRank = cellRank(leftCell);
    const rightRank = cellRank(rightCell);

    let outcome: DuelRowComparison['outcome'] = 'same';
    if (rightRank > leftRank || (rightRank === leftRank && rightCell.label !== leftCell.label && safeRight > safeLeft && rightRank > 0)) {
      outcome = 'right-better';
      rightUpgradesCount += 1;
    } else if (leftRank > rightRank || (leftRank === rightRank && leftCell.label !== rightCell.label && safeLeft > safeRight && leftRank > 0)) {
      outcome = 'left-better';
    }

    return {
      row,
      leftCell,
      rightCell,
      outcome,
    };
  });

  return {
    leftIndex: safeLeft,
    rightIndex: safeRight,
    priceDiff,
    formattedDiff: formatOfferDelta(priceDiff, billingMode),
    rightUpgradesCount,
    rows,
  };
}
