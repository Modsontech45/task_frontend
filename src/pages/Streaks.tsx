import { useStreaks } from '../hooks/useStreaks';
import StreakCard from '../components/StreakCard';

const MOTIVATIONAL: Record<string, string[]> = {
  gym: ['💪 Le corps suit là où l\'esprit mène !', '🏋️ Une séance à la fois.'],
  bilingual: ['🌍 Chaque jour te rapproche de la fluidité.', '🗣️ Parle, écoute, répète !'],
  reading: ['📖 Les lecteurs d\'aujourd\'hui sont les leaders de demain.', '🧠 Nourris ton esprit chaque jour.'],
  skill: ['🛠️ La pratique rend parfait.', '💻 Code chaque jour, progresse chaque jour.'],
};

export default function Streaks() {
  const { streaks, loading } = useStreaks();

  const topStreak = streaks.reduce(
    (best, s) => s.current_streak > (best?.current_streak || 0) ? s : best,
    streaks[0]
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Séries 🔥</h1>
        <p className="text-sm text-gray-400 mt-1">Ta constance sur le long terme.</p>
      </div>

      {/* Top streak hero */}
      {topStreak && topStreak.current_streak > 0 && (
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-5 text-white">
          <p className="text-sm opacity-80">Meilleure série actuelle</p>
          <p className="text-5xl font-black mt-1">{topStreak.current_streak} 🔥</p>
          <p className="text-lg font-medium capitalize mt-1">{topStreak.category}</p>
          <p className="text-sm opacity-70 mt-1">Record : {topStreak.longest_streak} jours</p>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {streaks.map(s => (
            <div key={s.category} className="space-y-2">
              <StreakCard streak={s} />
              {MOTIVATIONAL[s.category] && s.current_streak > 0 && (
                <p className="text-xs text-gray-400 text-center">
                  {MOTIVATIONAL[s.category][s.current_streak % MOTIVATIONAL[s.category].length]}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {streaks.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-2">🔥</p>
          <p>Complète des activités pour démarrer tes séries !</p>
        </div>
      )}
    </div>
  );
}
