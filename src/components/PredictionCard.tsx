import { Prediction } from '../types';

interface Props { prediction: Prediction | null; loading: boolean; }

export default function PredictionCard({ prediction, loading }: Props) {
  if (loading) return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 animate-pulse h-28" />
  );
  if (!prediction) return null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Prédictions IA 🔮</h3>
        <span className="text-sm font-bold text-blue-600">
          ~{Math.round(prediction.predicted_completion_rate * 100)}% prévu
        </span>
      </div>

      {prediction.risk_flags.length > 0 && (
        <div className="space-y-1">
          {prediction.risk_flags.map((flag, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-red-600 dark:text-red-400">
              <span>⚠️</span><span>{flag}</span>
            </div>
          ))}
        </div>
      )}

      {prediction.suggestions.length > 0 && (
        <div className="space-y-1">
          {prediction.suggestions.slice(0, 3).map((s, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300">
              <span>💡</span><span>{s}</span>
            </div>
          ))}
        </div>
      )}

      {prediction.risk_flags.length === 0 && prediction.suggestions.length === 0 && (
        <p className="text-sm text-green-600 dark:text-green-400">
          ✅ Tout semble bien pour aujourd'hui. Continue comme ça !
        </p>
      )}
    </div>
  );
}
