import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useActivities } from '../hooks/useActivities';
import { useStreaks } from '../hooks/useStreaks';
import { useBilingual } from '../hooks/useBilingual';
import ActivityBlockCard from '../components/ActivityBlock';
import StreakCard from '../components/StreakCard';
import PredictionCard from '../components/PredictionCard';
import BilingualCard from '../components/BilingualCard';
import TomorrowPreview from '../components/TomorrowPreview';
import { getPredictions } from '../api/predictions';
import { getDailyTip } from '../api/bilingual';
import { Prediction, BilingualTip, DAYS_FR } from '../types';

const QUOTES = [
  { fr: 'La discipline est le pont entre les objectifs et les réalisations.', en: 'Discipline is the bridge between goals and accomplishment.' },
  { fr: 'Chaque jour est une nouvelle chance de devenir meilleur.', en: 'Every day is a new chance to be better.' },
  { fr: 'Le succès n\'est pas final, l\'échec n\'est pas fatal.', en: 'Success is not final, failure is not fatal.' },
  { fr: 'Travaille en silence, laisse ton succès faire du bruit.', en: 'Work in silence, let your success make the noise.' },
  { fr: 'La constance est plus importante que la perfection.', en: 'Consistency is more important than perfection.' },
  { fr: 'Commence là où tu es, utilise ce que tu as, fais ce que tu peux.', en: 'Start where you are, use what you have, do what you can.' },
  { fr: 'Le progrès, pas la perfection.', en: 'Progress, not perfection.' },
];

export default function Dashboard() {
  const { today } = useApp();
  const { activities, loading: actLoading, update } = useActivities();
  const { streaks } = useStreaks();
  const { stats, loading: biloading } = useBilingual(14);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [predLoading, setPredLoading] = useState(true);
  const [tip, setTip] = useState<BilingualTip | null>(null);

  useEffect(() => {
    getPredictions(today).then(setPrediction).catch(console.error).finally(() => setPredLoading(false));
    getDailyTip().then(setTip).catch(console.error);
  }, [today]);

  const done = activities.filter(a => a.status === 'done').length;
  const total = activities.filter(a => a.category !== 'travel' && a.category !== 'personal').length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  const now = new Date();
  const dow = now.getDay();
  const quote = QUOTES[dow];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{DAYS_FR[dow]}, {today}</p>
          <h1 className="text-2xl font-bold">Bonjour 👋</h1>
        </div>
        {/* Completion ring */}
        <div className="text-center">
          <div className="relative inline-flex items-center justify-center w-16 h-16">
            <svg className="absolute -rotate-90" width="64" height="64">
              <circle cx="32" cy="32" r="26" fill="none" stroke="currentColor" strokeWidth="6"
                className="text-gray-200 dark:text-gray-700" />
              <circle cx="32" cy="32" r="26" fill="none"
                stroke={pct >= 80 ? '#22c55e' : pct >= 50 ? '#eab308' : '#3b82f6'}
                strokeWidth="6" strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 26}
                strokeDashoffset={2 * Math.PI * 26 * (1 - pct / 100)}
                style={{ transition: 'stroke-dashoffset 0.5s' }} />
            </svg>
            <span className="text-sm font-bold relative z-10">{pct}%</span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{done}/{total}</p>
        </div>
      </div>

      {/* Quote */}
      <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-3 border border-blue-100 dark:border-blue-900">
        <p className="text-sm text-gray-700 dark:text-gray-200 italic">« {quote.fr} »</p>
        <p className="text-xs text-gray-400 mt-0.5 italic">"{quote.en}"</p>
      </div>

      {/* Prediction card */}
      <PredictionCard prediction={prediction} loading={predLoading} />

      {/* Bilingual card */}
      {!biloading && <BilingualCard stats={stats} tip={tip} />}

      {/* Today's schedule */}
      <div>
        <h2 className="font-semibold text-base mb-3">Planning du jour</h2>
        {actLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <p className="text-gray-400 text-sm">Aucune activité planifiée.</p>
        ) : (
          <div className="space-y-2">
            {activities.map(a => (
              <ActivityBlockCard key={a.id} block={a} onUpdate={update} />
            ))}
          </div>
        )}
      </div>

      {/* Tomorrow preview */}
      <TomorrowPreview />

      {/* Streak mini row */}
      {streaks.length > 0 && (
        <div>
          <h2 className="font-semibold text-base mb-3">Séries 🔥</h2>
          <div className="grid grid-cols-2 gap-3">
            {streaks.slice(0, 4).map(s => (
              <StreakCard key={s.category} streak={s} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
