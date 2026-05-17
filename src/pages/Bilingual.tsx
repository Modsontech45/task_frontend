import { useState } from 'react';
import { useBilingual } from '../hooks/useBilingual';
import { logBilingualSession } from '../api/bilingual';

export default function Bilingual() {
  const { entries, stats, loading, refetch } = useBilingual(30);
  const [form, setForm] = useState({
    vocabulary_score: 5,
    speaking_score: 5,
    listening_score: 5,
    words_learned: 0,
    minutes_practiced: 25,
    note: '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await logBilingualSession(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    refetch();
    setSaving(false);
  };

  const avgLevel = (entry: typeof entries[0]) => {
    const scores = [entry.vocabulary_score, entry.speaking_score, entry.listening_score].filter(Boolean) as number[];
    return scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : '—';
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Module Bilingue 🌍</h1>
        <p className="text-sm text-gray-400 mt-1">Suivi de ta progression vers la fluidité.</p>
      </div>

      {/* Stats hero */}
      {stats && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-purple-600 text-white rounded-xl p-4">
            <p className="text-3xl font-black">{stats.hours_logged}h</p>
            <p className="text-sm opacity-80">Heures d'anglais loguées</p>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <p className="text-3xl font-black text-purple-600">
              {stats.estimated_days_to_b2 ? `${stats.estimated_days_to_b2}j` : '?'}
            </p>
            <p className="text-sm text-gray-400">Jours estimés vers B2</p>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <p className="text-3xl font-black">{stats.avg_daily_minutes}</p>
            <p className="text-sm text-gray-400">min/jour en moyenne</p>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <p className="text-3xl font-black text-purple-600">{stats.avg_score}/10</p>
            <p className="text-sm text-gray-400">Score moyen</p>
          </div>
        </div>
      )}

      {/* B2 progress bar */}
      {stats && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Progression vers B2</span>
            <span className="text-purple-600 font-bold">
              {Math.min(100, Math.round((stats.hours_logged / 400) * 100))}%
            </span>
          </div>
          <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, (stats.hours_logged / 400) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>A2 (maintenant)</span>
            <span>B2 (~400h)</span>
          </div>
        </div>
      )}

      {/* Log session form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
        <h3 className="font-semibold">Logger une session</h3>

        {(['vocabulary_score', 'speaking_score', 'listening_score'] as const).map(field => {
          const labels = { vocabulary_score: 'Vocabulaire', speaking_score: 'Expression orale', listening_score: 'Écoute' };
          return (
            <div key={field}>
              <div className="flex justify-between text-sm mb-1">
                <label>{labels[field]}</label>
                <span className="font-bold text-purple-600">{form[field]}/10</span>
              </div>
              <input type="range" min={1} max={10}
                value={form[field]}
                onChange={e => setForm(f => ({ ...f, [field]: parseInt(e.target.value) }))}
                className="w-full accent-purple-600"
              />
            </div>
          );
        })}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-gray-500">Minutes pratiquées</label>
            <input type="number" min={0} max={300}
              value={form.minutes_practiced}
              onChange={e => setForm(f => ({ ...f, minutes_practiced: parseInt(e.target.value) || 0 }))}
              className="w-full mt-1 p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
            />
          </div>
          <div>
            <label className="text-sm text-gray-500">Mots appris</label>
            <input type="number" min={0}
              value={form.words_learned}
              onChange={e => setForm(f => ({ ...f, words_learned: parseInt(e.target.value) || 0 }))}
              className="w-full mt-1 p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
            />
          </div>
        </div>

        <textarea
          value={form.note}
          onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
          placeholder="Notes de la session..."
          rows={2}
          className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm resize-none"
        />

        <button
          type="submit"
          disabled={saving}
          className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {saved ? '✅ Enregistré !' : saving ? 'Enregistrement...' : 'Enregistrer la session'}
        </button>
      </form>

      {/* History */}
      {!loading && entries.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Historique</h3>
          <div className="space-y-2">
            {entries.slice(0, 14).map(e => (
              <div key={e.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-3 flex items-center gap-3">
                <div className="text-center w-12 flex-shrink-0">
                  <p className="text-2xl font-black text-purple-600">{avgLevel(e)}</p>
                  <p className="text-xs text-gray-400">moy.</p>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{e.date}</p>
                  <p className="text-xs text-gray-400">{e.minutes_practiced} min · {e.words_learned} mots</p>
                  {e.note && <p className="text-xs text-gray-500 italic mt-0.5">{e.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
