import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from 'recharts';
import { getWeeklySummary } from '../api/summary';
import { WeeklySummary, DAYS_FR, CATEGORY_COLORS, CATEGORY_LABELS } from '../types';

function dateStr(d: string): string {
  return d.split('T')[0];
}

function mondayOfWeek(offset = 0): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) + offset * 7;
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}

export default function WeeklyReview() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [summary, setSummary] = useState<WeeklySummary | null>(null);
  const [loading, setLoading] = useState(true);

  const start = mondayOfWeek(weekOffset);

  useEffect(() => {
    setLoading(true);
    getWeeklySummary(start)
      .then(setSummary)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [start]);

  const barData = summary?.days.map(d => ({
    day: DAYS_FR[new Date(dateStr(d.date) + 'T12:00:00Z').getUTCDay()].slice(0, 3),
    Planifié: d.total,
    Complété: d.completed,
  })) || [];

  const pieData = summary
    ? (['gym', 'school', 'skill', 'bilingual', 'reading', 'personal', 'travel'] as const)
        .map(cat => {
          const count = summary.days.reduce((s, d) => {
            if (cat === 'gym') return s + d.gym_done;
            if (cat === 'bilingual') return s + d.bilingual_done;
            if (cat === 'reading') return s + d.reading_done;
            if (cat === 'skill') return s + d.skill_done;
            return s;
          }, 0);
          return { name: CATEGORY_LABELS[cat], value: count, color: CATEGORY_COLORS[cat] };
        })
        .filter(d => d.value > 0)
    : [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Semaine 📊</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setWeekOffset(o => o - 1)}
            className="p-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
            ‹
          </button>
          <span className="text-sm text-gray-500 w-24 text-center">{start}</span>
          <button onClick={() => setWeekOffset(o => Math.min(0, o + 1))}
            disabled={weekOffset === 0}
            className="p-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40">
            ›
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-32 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />)}
        </div>
      ) : summary ? (
        <>
          {/* KPI row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-3 text-center">
              <p className="text-3xl font-black text-blue-600">{summary.overall_completion_rate}%</p>
              <p className="text-xs text-gray-400 mt-1">Taux global</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-3 text-center">
              <p className="text-3xl font-black text-green-600">{summary.total_completed}</p>
              <p className="text-xs text-gray-400 mt-1">Activités faites</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-3 text-center">
              <p className="text-2xl font-black text-yellow-500">
                {summary.best_day
                  ? DAYS_FR[new Date(dateStr(summary.best_day.date) + 'T12:00:00Z').getUTCDay()].slice(0, 3)
                  : '—'}
              </p>
              <p className="text-xs text-gray-400 mt-1">Meilleur jour</p>
            </div>
          </div>

          {/* Bar chart */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-semibold text-sm mb-3">Planifié vs Complété</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Planifié" fill="#93c5fd" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Complété" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie chart */}
          {pieData.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="font-semibold text-sm mb-3">Répartition des activités complétées</h3>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                      dataKey="value" paddingAngle={3}>
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-1.5 flex-1">
                  {pieData.map((d, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                      <span className="flex-1 text-gray-600 dark:text-gray-300">{d.name}</span>
                      <span className="font-bold">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Daily breakdown */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-semibold text-sm mb-3">Détail par jour</h3>
            <div className="space-y-2">
              {summary.days.map(d => (
                <div key={d.date} className="flex items-center gap-3">
                  <span className="text-xs w-8 text-gray-400 font-medium">
                    {DAYS_FR[new Date(dateStr(d.date) + 'T12:00:00Z').getUTCDay()].slice(0, 3)}
                  </span>
                  <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${d.completion_rate}%`,
                        backgroundColor: d.completion_rate >= 80 ? '#22c55e' : d.completion_rate >= 50 ? '#eab308' : '#3b82f6',
                      }}
                    />
                  </div>
                  <span className="text-xs font-bold w-10 text-right">
                    {d.completion_rate}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <p className="text-gray-400 text-sm text-center py-8">Impossible de charger les données.</p>
      )}
    </div>
  );
}
