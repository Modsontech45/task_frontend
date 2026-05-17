import { useState } from 'react';
import { useActivities } from '../hooks/useActivities';
import ActivityBlockCard from '../components/ActivityBlock';
import { DAYS_FR } from '../types';

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d;
}

function toDateStr(d: Date): string {
  return d.toISOString().split('T')[0];
}

export default function Schedule() {
  const [selectedDate, setSelectedDate] = useState(toDateStr(new Date()));
  const { activities, loading, update } = useActivities(selectedDate);

  const weekStart = getWeekStart(new Date(selectedDate + 'T12:00:00Z'));
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Planning</h1>

      {/* Week selector */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {weekDays.map(d => {
          const ds = toDateStr(d);
          const today = toDateStr(new Date());
          const isSelected = ds === selectedDate;
          const isToday = ds === today;
          return (
            <button
              key={ds}
              onClick={() => setSelectedDate(ds)}
              className={`flex flex-col items-center px-3 py-2 rounded-xl min-w-[52px] transition-colors ${
                isSelected
                  ? 'bg-blue-600 text-white'
                  : isToday
                  ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 border border-blue-200 dark:border-blue-800'
                  : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <span className="text-xs font-medium">{DAYS_FR[d.getDay()].slice(0, 3)}</span>
              <span className="text-lg font-bold">{d.getDate()}</span>
            </button>
          );
        })}
      </div>

      {/* Date header */}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">
          {DAYS_FR[new Date(selectedDate + 'T12:00:00Z').getUTCDay()]} {selectedDate}
        </h2>
        <div className="flex gap-2 items-center text-sm text-gray-500">
          <span>{activities.filter(a => a.status === 'done').length} / {activities.length} fait</span>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-2">📅</p>
          <p>Aucune activité pour ce jour.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {activities.map(a => (
            <ActivityBlockCard key={a.id} block={a} onUpdate={update} />
          ))}
        </div>
      )}
    </div>
  );
}
