import type { Quote, QuoteLine } from '../types/relief';
import { nextSequentialNumber } from './business';

export type AppMode = 'terrain' | 'client';

export interface OldChecklistState {
  brushCleared50m: boolean;
  canopySpacing3m: boolean;
  roofClearance3m: boolean;
  accessRoadCleared: boolean;
  debrisEvacuated: boolean;
}

export interface FieldVisitLog {
  id: string;
  clientId: string;
  clientName: string;
  city: string;
  date: string;
  durationSeconds: number;
  oliveTreesPruned: number;
  estimatedHarvestKg: number;
  oldScorePercent: number;
  irrigationChecked: boolean;
  notes: string;
}

export interface SeasonalAlert {
  id: string;
  seasonTag: string;
  title: string;
  description: string;
  urgency: 'Prioritaire' | 'Saisonnier' | 'Préventif';
  recommendedService: string;
}

export const FIELD_LOGS_STORAGE_KEY = 'rp_field_logs_v1';

export const INITIAL_FIELD_LOGS: FieldVisitLog[] = [
  {
    id: 'log-demo-1',
    clientId: 'cli-1',
    clientName: 'Domaine de Saint-Mathieu (M. Delacroix)',
    city: 'Grasse',
    date: '2026-11-24',
    durationSeconds: 7800,
    oliveTreesPruned: 14,
    estimatedHarvestKg: 266,
    oldScorePercent: 80,
    irrigationChecked: true,
    notes: 'Restanque haute éclaircie, 2 sujets centenaires équilibrés. Goutte-à-goutte OK.',
  },
  {
    id: 'log-demo-2',
    clientId: 'cli-3',
    clientName: 'Villa Les Restanques (Mme Rochat)',
    city: 'Peymeinade',
    date: '2026-11-16',
    durationSeconds: 5400,
    oliveTreesPruned: 7,
    estimatedHarvestKg: 112,
    oldScorePercent: 100,
    irrigationChecked: true,
    notes: 'Haie sud laissée protégée (présence hérisson). Réseau programmateur hiverné.',
  },
];

export function formatStopwatchDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(Number.isFinite(totalSeconds) ? totalSeconds : 0));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  return [hours, minutes, seconds].map((v) => String(v).padStart(2, '0')).join(':');
}

export function estimateOliveHarvestKg(
  treeCount: number,
  densityLevel: 'faible' | 'moyenne' | 'abondante' = 'moyenne'
): number {
  const safeCount = Math.max(0, Math.floor(Number.isFinite(treeCount) ? treeCount : 0));
  const kgPerTree = densityLevel === 'faible' ? 12 : densityLevel === 'abondante' ? 28 : 19;
  return safeCount * kgPerTree;
}

export function calculateOldComplianceScore(checklist: OldChecklistState): {
  checkedCount: number;
  totalCount: number;
  percent: number;
  label: 'Conforme OLD 06' | 'Mise à niveau partielle' | 'Non conforme (intervention requise)';
} {
  const entries = [
    checklist.brushCleared50m,
    checklist.canopySpacing3m,
    checklist.roofClearance3m,
    checklist.accessRoadCleared,
    checklist.debrisEvacuated,
  ];
  const checkedCount = entries.filter(Boolean).length;
  const totalCount = entries.length;
  const percent = Math.round((checkedCount / totalCount) * 100);
  const label =
    percent === 100
      ? 'Conforme OLD 06'
      : percent >= 60
        ? 'Mise à niveau partielle'
        : 'Non conforme (intervention requise)';
  return { checkedCount, totalCount, percent, label };
}

export function buildExpressFieldQuote(input: {
  clientName: string;
  clientPhone: string;
  clientCity: string;
  clientAddress?: string;
  oliveTreesCount: number;
  oldSurfaceHundreds: number;
  irrigationMeters: number;
  includeDebrisEvacuation: boolean;
  notes?: string;
  existingQuotes: Quote[];
  todayIso?: string;
}): Quote {
  const todayIso = input.todayIso || new Date().toISOString().slice(0, 10);
  const year = Number.parseInt(todayIso.slice(0, 4), 10) || 2026;
  const number = nextSequentialNumber(
    'DEV',
    input.existingQuotes.map((q) => q.number),
    year
  );

  const validDate = new Date(todayIso);
  validDate.setDate(validDate.getDate() + 30);

  const lines: QuoteLine[] = [];
  if (input.oliveTreesCount > 0) {
    lines.push({
      id: 'exp-olives-' + Date.now(),
      label: 'Taille raisonnée d’oliviers (éclaircie & équilibre sur site)',
      unit: 'arbre',
      quantity: Math.floor(input.oliveTreesCount),
      unitPriceHT: 65,
    });
  }
  if (input.oldSurfaceHundreds > 0) {
    lines.push({
      id: 'exp-old-' + Date.now(),
      label: 'Débroussaillement réglementaire OLD 06 (strate basse & mise à distance)',
      unit: '100 m²',
      quantity: input.oldSurfaceHundreds,
      unitPriceHT: 130,
    });
  }
  if (input.irrigationMeters > 0) {
    lines.push({
      id: 'exp-irr-' + Date.now(),
      label: 'Pose / reprise réseau goutte-à-goutte autorégulant',
      unit: 'mètre linéaire',
      quantity: input.irrigationMeters,
      unitPriceHT: 6.5,
    });
  }
  if (input.includeDebrisEvacuation) {
    lines.push({
      id: 'exp-evac-' + Date.now(),
      label: 'Broyage sur place ou évacuation des rémanents en déchetterie pro',
      unit: 'forfait',
      quantity: 1,
      unitPriceHT: 95,
    });
  }
  if (lines.length === 0) {
    lines.push({
      id: 'exp-visit-' + Date.now(),
      label: 'Entretien parc & jardin (tonte, bordures, taille arbustes)',
      unit: 'forfait visite',
      quantity: 1,
      unitPriceHT: 240,
    });
  }

  return {
    id: 'quote-app-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
    number,
    createdAt: todayIso,
    validUntil: validDate.toISOString().slice(0, 10),
    clientName: input.clientName.trim() || 'Client relevé terrain',
    clientPhone: input.clientPhone.trim(),
    clientCity: input.clientCity.trim() || 'Grasse',
    clientAddress: input.clientAddress?.trim() || undefined,
    title: 'Chiffrage express établi depuis ReliefApp Terrain',
    vatRate: 0,
    lines,
    notes:
      input.notes?.trim() ||
      'Devis express généré sur place lors du relevé terrain. TVA non applicable, article 293 B du CGI.',
    status: 'Envoyé',
  };
}

export function getSeasonalAlertsForMonth(month1To12: number): SeasonalAlert[] {
  const m = Math.min(12, Math.max(1, Math.floor(month1To12)));
  if (m >= 10 || m <= 1) {
    return [
      {
        id: 'alert-harvest',
        seasonTag: 'Octobre – Janvier · Oléiculture',
        title: 'Récolte des olives & préparation hivernale',
        description:
          'Fenêtre idéale pour le ramassage des olives (Cailletier / variétés de Grasse), la mise en caisse et le broyage des rameaux.',
        urgency: 'Prioritaire',
        recommendedService: "Taille d'olivier et récolte d'olives",
      },
      {
        id: 'alert-old-winter',
        seasonTag: 'Hiver 06 · Prévention incendie',
        title: 'Mise en conformité OLD avant le printemps',
        description:
          'Période recommandée par les arrêtés des Alpes-Maritimes pour réaliser le débroussaillement des 50 m et la remontée de couronne.',
        urgency: 'Prioritaire',
        recommendedService: 'Élagage et travaux forestiers / OLD',
      },
      {
        id: 'alert-hivernage',
        seasonTag: 'Automne / Hiver · Eau',
        title: 'Mise en veille & purge de l’arrosage automatique',
        description:
          'Réduction des cycles sur programmateur et vérification des électrovannes contre les gelées nocturnes du moyen-pays.',
        urgency: 'Préventif',
        recommendedService: 'Arrosage automatique',
      },
    ];
  }

  if (m >= 2 && m <= 5) {
    return [
      {
        id: 'alert-taille-olivier',
        seasonTag: 'Février – Avril · Oléiculture',
        title: 'Taille de fructification et d’éclaircie des oliviers',
        description:
          'Aérer le cœur de la ramure avant la montée de sève pour limiter l’œil de paon et stimuler la floraison.',
        urgency: 'Prioritaire',
        recommendedService: "Taille d'olivier et récolte d'olives",
      },
      {
        id: 'alert-old-spring',
        seasonTag: 'Avant Juin · Réglementation 06',
        title: 'Contrôle final OLD 50 m avant l’été',
        description:
          'Obligation légale dans le Pays de Grasse : éliminer broussailles et branches basses avant la saison sèche.',
        urgency: 'Prioritaire',
        recommendedService: 'Élagage et travaux forestiers / OLD',
      },
      {
        id: 'alert-sanitaire-spring',
        seasonTag: 'Printemps · Soins raisonnés',
        title: 'Inspection sanitaire & relance arrosage',
        description:
          'Contrôle préventif des jeunes pousses (cochenille, mouche de l’olive) et remise en eau progressive du goutte-à-goutte.',
        urgency: 'Saisonnier',
        recommendedService: 'Conseil et soin phytosanitaire raisonné',
      },
    ];
  }

  return [
    {
      id: 'alert-summer-water',
      seasonTag: 'Juin – Septembre · Hydrique',
      title: 'Réglage estival de l’arrosage & paillage',
      description:
        'Contrôle des goutteurs nocturnes et paillage des pieds pour économiser jusqu’à 40 % d’eau durant les pics de chaleur.',
      urgency: 'Prioritaire',
      recommendedService: 'Arrosage automatique',
    },
    {
      id: 'alert-summer-entretien',
      seasonTag: 'Été · Propriété',
      title: 'Entretien sec, tonte haute & sécurité abords',
      description:
        'Maintien des accès pompiers dégagés, nettoyage des aiguilles de pin en toiture et surveillance des arbres fragilisés.',
      urgency: 'Saisonnier',
      recommendedService: 'Entretien de parc et jardin',
    },
  ];
}

export function loadFieldLogs(): FieldVisitLog[] {
  if (typeof window === 'undefined') return structuredClone(INITIAL_FIELD_LOGS);
  try {
    const raw = window.localStorage.getItem(FIELD_LOGS_STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(FIELD_LOGS_STORAGE_KEY, JSON.stringify(INITIAL_FIELD_LOGS));
      return structuredClone(INITIAL_FIELD_LOGS);
    }
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as FieldVisitLog[]) : structuredClone(INITIAL_FIELD_LOGS);
  } catch {
    return structuredClone(INITIAL_FIELD_LOGS);
  }
}

export function saveFieldLogs(logs: FieldVisitLog[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(FIELD_LOGS_STORAGE_KEY, JSON.stringify(logs));
  } catch {
    // Ignore storage quota issues
  }
}
