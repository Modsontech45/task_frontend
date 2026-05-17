import { BilingualStats, BilingualTip } from '../types';

interface Props {
  stats: BilingualStats | null;
  tip: BilingualTip | null;
}

export default function BilingualCard({ stats, tip }: Props) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
      <h3 className="font-semibold text-sm flex items-center gap-2">
        🌍 Progrès Bilingue
      </h3>

      {stats && (
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xl font-bold text-purple-600">{stats.avg_daily_minutes}</p>
            <p className="text-xs text-gray-400">min/jour moy.</p>
          </div>
          <div>
            <p className="text-xl font-bold text-purple-600">{stats.hours_logged}</p>
            <p className="text-xs text-gray-400">heures logées</p>
          </div>
          <div>
            <p className="text-xl font-bold text-purple-600">
              {stats.estimated_days_to_b2 ? `${stats.estimated_days_to_b2}j` : '—'}
            </p>
            <p className="text-xs text-gray-400">vers B2</p>
          </div>
        </div>
      )}

      {tip && (
        <div className="bg-purple-50 dark:bg-purple-950/30 rounded-lg p-3 space-y-1">
          <p className="text-xs font-medium text-purple-700 dark:text-purple-300">💡 Conseil du jour</p>
          <p className="text-xs text-gray-700 dark:text-gray-300">{tip.fr}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 italic">{tip.en}</p>
        </div>
      )}
    </div>
  );
}
