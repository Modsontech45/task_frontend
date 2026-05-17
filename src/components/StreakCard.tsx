import { Streak, CATEGORY_LABELS, CATEGORY_BG } from '../types';

const CATEGORY_ICONS: Record<string, string> = {
  gym: '🏋️', bilingual: '🌍', reading: '📖', skill: '🛠️',
};

interface Props { streak: Streak; }

export default function StreakCard({ streak }: Props) {
  const fire = streak.current_streak >= 7 ? '🔥🔥' : streak.current_streak >= 3 ? '🔥' : '';

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${CATEGORY_BG[streak.category]}`} />
          <span className="font-medium text-sm">{CATEGORY_LABELS[streak.category as keyof typeof CATEGORY_LABELS]}</span>
          <span className="text-lg">{CATEGORY_ICONS[streak.category] || '⭐'}</span>
        </div>
        {fire && <span className="text-xl">{fire}</span>}
      </div>

      <div className="flex items-end gap-4">
        <div>
          <p className="text-3xl font-bold">{streak.current_streak}</p>
          <p className="text-xs text-gray-400">Série actuelle</p>
        </div>
        <div className="text-right ml-auto">
          <p className="text-lg font-semibold text-gray-500">{streak.longest_streak}</p>
          <p className="text-xs text-gray-400">Record</p>
        </div>
      </div>

      {/* Mini streak bar */}
      <div className="flex gap-0.5 mt-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-1.5 rounded-full ${
              i < streak.current_streak % 8
                ? CATEGORY_BG[streak.category]
                : 'bg-gray-100 dark:bg-gray-800'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
