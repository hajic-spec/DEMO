import React from 'react';
import { Check, ClipboardCheck, Minus, Plus, Trash2 } from 'lucide-react';
import type { ClientProperty } from '../../types/relief';
import {
  formatHumanDuration,
  type FieldVisitLog,
  type OldChecklistState,
} from '../../utils/appLogic';

interface FieldSurveyViewProps {
  clients: ClientProperty[];
  surveyClientId: string;
  onSelectSurveyClient: (clientId: string) => void;
  oliveCount: number;
  onChangeOliveCount: (next: number) => void;
  oliveDensity: 'faible' | 'moyenne' | 'abondante';
  onChangeOliveDensity: (density: 'faible' | 'moyenne' | 'abondante') => void;
  estimatedHarvestKg: number;
  oldChecklist: OldChecklistState;
  onToggleOldItem: (key: keyof OldChecklistState) => void;
  oldEvaluation: {
    checkedCount: number;
    totalCount: number;
    percent: number;
    label: string;
  };
  irrigationOk: boolean;
  onToggleIrrigation: () => void;
  surveyNotes: string;
  onChangeSurveyNotes: (notes: string) => void;
  onSaveFieldSurvey: () => void;
  fieldLogs: FieldVisitLog[];
  onDeleteLog: (logId: string) => void;
}

const OLD_CHECKLIST_ITEMS: ReadonlyArray<{
  key: keyof OldChecklistState;
  label: string;
}> = [
  {
    key: 'brushCleared50m',
    label: 'Débroussaillement strate basse dans les 50 m autour du bâti',
  },
  {
    key: 'canopySpacing3m',
    label: 'Mise à distance ≥ 3 m entre houppiers des arbres maintenus',
  },
  {
    key: 'roofClearance3m',
    label: 'Élagage des branches à moins de 3 m des façades et toitures',
  },
  {
    key: 'accessRoadCleared',
    label: 'Dégagement voie d’accès secours (gabarit 4 m libre)',
  },
  {
    key: 'debrisEvacuated',
    label: 'Broyage fin ou évacuation complète des rémanents',
  },
];

export const FieldSurveyView: React.FC<FieldSurveyViewProps> = ({
  clients,
  surveyClientId,
  onSelectSurveyClient,
  oliveCount,
  onChangeOliveCount,
  oliveDensity,
  onChangeOliveDensity,
  estimatedHarvestKg,
  oldChecklist,
  onToggleOldItem,
  oldEvaluation,
  irrigationOk,
  onToggleIrrigation,
  surveyNotes,
  onChangeSurveyNotes,
  onSaveFieldSurvey,
  fieldLogs,
  onDeleteLog,
}) => {
  const ringRadius = 28;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference * (1 - oldEvaluation.percent / 100);
  const ringColor =
    oldEvaluation.percent === 100
      ? '#1E6B43'
      : oldEvaluation.percent >= 60
        ? '#B5893A'
        : '#991B1B';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Formulaire de relevé terrain */}
      <section className="lg:col-span-7 bg-white border border-[#E5DEC9] rounded-xl p-5 md:p-6 space-y-5">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-[#0E281B]">
            Relevé Oliviers &amp; Conformité OLD 06
          </h2>
          <p className="text-xs text-[#647068] mt-0.5">
            Comptez les sujets sur place, mesurez la conformité incendie 06 et mettez à jour le
            carnet du propriétaire.
          </p>
        </div>

        <div>
          <label
            htmlFor="survey-client"
            className="block text-xs font-semibold text-[#0E281B] mb-1.5"
          >
            Propriété visitée
          </label>
          <select
            id="survey-client"
            value={surveyClientId}
            onChange={(e) => onSelectSurveyClient(e.target.value)}
            className="w-full min-h-[44px] px-3.5 rounded-lg border border-[#E5DEC9] bg-[#FAF8F3] text-sm font-medium focus:outline-none focus:border-[#B5893A]"
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.city})
              </option>
            ))}
          </select>
        </div>

        {/* Compteur oliviers & récolte */}
        <div className="bg-[#F3EFE5] border border-[#E5DEC9] rounded-xl p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9C7228]">
                Oliviers comptés / taillés
              </span>
              <div className="font-serif text-3xl font-bold text-[#0E281B] tabular-nums mt-0.5">
                {oliveCount} arbre{oliveCount > 1 ? 's' : ''}
              </div>
              <p className="text-xs text-[#3E4A43] tabular-nums mt-1">
                Estimation récolte ({oliveDensity}) :{' '}
                <strong className="text-[#0E281B]">{estimatedHarvestKg} kg</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Retirer un olivier"
                onClick={() => onChangeOliveCount(Math.max(0, oliveCount - 1))}
                className="w-12 h-12 rounded-lg bg-white border border-[#E5DEC9] text-[#0E281B] inline-flex items-center justify-center hover:border-[#0E281B]"
              >
                <Minus className="w-5 h-5" />
              </button>
              <button
                type="button"
                aria-label="Ajouter un olivier"
                onClick={() => onChangeOliveCount(oliveCount + 1)}
                className="w-12 h-12 rounded-lg bg-[#0E281B] text-[#EBD9B3] inline-flex items-center justify-center hover:bg-[#9C7228] hover:text-white"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3">
            {(['faible', 'moyenne', 'abondante'] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => onChangeOliveDensity(lvl)}
                className={`min-h-[44px] rounded-md text-xs font-semibold capitalize transition-colors ${
                  oliveDensity === lvl
                    ? 'bg-[#0E281B] text-[#EBD9B3]'
                    : 'bg-white border border-[#E5DEC9] text-[#3E4A43]'
                }`}
              >
                Charge {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Jauge SVG Circulaire + Checklist OLD 06 */}
        <div>
          <div className="bg-[#FAF8F3] border border-[#E5DEC9] rounded-xl p-4 mb-3 flex items-center gap-4">
            <div className="relative w-[72px] h-[72px] shrink-0 flex items-center justify-center">
              <svg className="w-[72px] h-[72px] -rotate-90" viewBox="0 0 72 72" aria-hidden="true">
                <circle
                  cx="36"
                  cy="36"
                  r={ringRadius}
                  fill="none"
                  stroke="#E5DEC9"
                  strokeWidth="6"
                />
                <circle
                  cx="36"
                  cy="36"
                  r={ringRadius}
                  fill="none"
                  stroke={ringColor}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringOffset}
                  className="transition-all duration-300"
                />
              </svg>
              <span className="absolute font-mono text-sm font-bold text-[#0E281B] tabular-nums">
                {oldEvaluation.percent}%
              </span>
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9C7228]">
                Conformité OLD · Alpes-Maritimes 06
              </p>
              <p className="font-serif text-xl font-semibold text-[#0E281B] leading-snug">
                {oldEvaluation.label}
              </p>
              <p className="text-xs text-[#647068] tabular-nums mt-0.5">
                {oldEvaluation.checkedCount} sur {oldEvaluation.totalCount} critères validés
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {OLD_CHECKLIST_ITEMS.map((item) => {
              const checked = oldChecklist[item.key];
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onToggleOldItem(item.key)}
                  className={`w-full min-h-[48px] px-3.5 py-2.5 rounded-lg border text-left text-xs md:text-sm flex items-center gap-3 transition-colors ${
                    checked
                      ? 'bg-[#E7F5ED] border-[#BCE3CB] text-[#0E281B] font-medium'
                      : 'bg-[#FAF8F3] border-[#E5DEC9] text-[#3E4A43]'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                      checked
                        ? 'bg-[#1E6B43] text-white'
                        : 'bg-white border border-[#C5BDA8]'
                    }`}
                  >
                    {checked && <Check className="w-3.5 h-3.5" />}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Irrigation + Notes */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={onToggleIrrigation}
            className={`w-full min-h-[48px] px-3.5 rounded-lg border text-left text-xs md:text-sm font-medium flex items-center justify-between ${
              irrigationOk
                ? 'bg-[#FAF8F3] border-[#B5893A] text-[#0E281B]'
                : 'bg-white border-[#E5DEC9] text-[#647068]'
            }`}
          >
            <span>Réseau d’arrosage automatique contrôlé &amp; sans fuite</span>
            <span className="font-mono text-xs font-semibold text-[#9C7228]">
              {irrigationOk ? 'Vérifié OK' : 'À contrôler'}
            </span>
          </button>

          <div>
            <label
              htmlFor="survey-notes"
              className="block text-xs font-semibold text-[#0E281B] mb-1"
            >
              Observations terrain (état sanitaire, accès, suite à prévoir)
            </label>
            <textarea
              id="survey-notes"
              rows={3}
              value={surveyNotes}
              onChange={(e) => onChangeSurveyNotes(e.target.value)}
              placeholder="Ex. : 3 oliviers avec bois sec, prévoir broyeur sur la restanque 2…"
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5DEC9] bg-[#FAF8F3] text-sm focus:outline-none focus:border-[#B5893A] focus:bg-white"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={onSaveFieldSurvey}
          className="w-full min-h-[48px] rounded-lg bg-[#0E281B] text-[#EBD9B3] text-sm font-semibold hover:bg-[#9C7228] hover:text-white transition-colors inline-flex items-center justify-center gap-2"
        >
          <ClipboardCheck className="w-4 h-4" />
          <span>Enregistrer le relevé terrain</span>
        </button>
      </section>

      {/* Historique des relevés */}
      <section className="lg:col-span-5 bg-white border border-[#E5DEC9] rounded-xl p-5 md:p-6">
        <h3 className="font-serif text-2xl font-semibold text-[#0E281B] mb-1">
          Derniers relevés ({fieldLogs.length})
        </h3>
        <p className="text-xs text-[#647068] mb-4">
          Conservés hors-ligne sur l’appareil et visibles dans le carnet du propriétaire.
        </p>

        {fieldLogs.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#E5DEC9] bg-[#FAF8F3] p-5 text-center text-xs text-[#647068]">
            Aucun relevé enregistré pour le moment.
          </div>
        ) : (
          <div className="space-y-3">
            {fieldLogs.map((log) => (
              <article
                key={log.id}
                className="rounded-lg bg-[#FAF8F3] border border-[#E5DEC9] p-3.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-mono text-[#9C7228] tabular-nums">
                      {log.date} · {formatHumanDuration(log.durationSeconds)} · OLD{' '}
                      {log.oldScorePercent}%
                    </div>
                    <p className="font-semibold text-sm text-[#0E281B] mt-1">
                      {log.clientName} ({log.city})
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Supprimer le relevé du ${log.date}`}
                    onClick={() => onDeleteLog(log.id)}
                    className="w-11 h-11 rounded-lg text-[#647068] hover:text-[#991B1B] hover:bg-white inline-flex items-center justify-center shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs font-mono text-[#3E4A43] mt-1 tabular-nums">
                  {log.oliveTreesPruned} oliviers · ~{log.estimatedHarvestKg} kg · Arrosage{' '}
                  {log.irrigationChecked ? 'OK' : 'À voir'}
                </p>
                <p className="text-xs text-[#3E4A43] mt-1.5 leading-relaxed">{log.notes}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
