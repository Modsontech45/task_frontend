import { useState, useEffect } from 'react';
import { getSchoolSessions, logRevision, deleteRevision, SchoolSession, RevisionEntry } from '../api/revisions';
import { DAYS_FR } from '../types';

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(d: string): string {
  const date = new Date(d.split('T')[0] + 'T12:00:00Z');
  return `${DAYS_FR[date.getUTCDay()]} ${date.getUTCDate()} ${date.toLocaleString('fr-FR', { month: 'long', timeZone: 'UTC' })}`;
}

function scoreColor(score: number | null): string {
  if (!score) return 'text-gray-400';
  if (score >= 8) return 'text-green-600 dark:text-green-400';
  if (score >= 5) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-500 dark:text-red-400';
}

function scoreLabel(score: number | null): string {
  if (!score) return '—';
  if (score >= 8) return `${score}/10 ✅`;
  if (score >= 5) return `${score}/10 📖`;
  return `${score}/10 ⚠️`;
}

// ── Log revision form (inline per course) ────────────────────────────────────

function RevisionForm({
  session,
  onSave,
  onCancel,
}: {
  session: SchoolSession;
  onSave: (entry: RevisionEntry) => void;
  onCancel: () => void;
}) {
  const [duration, setDuration]     = useState(45);
  const [score, setScore]           = useState(7);
  const [notes, setNotes]           = useState('');
  const [saving, setSaving]         = useState(false);

  const submit = async () => {
    setSaving(true);
    const entry = await logRevision({
      activity_block_id: session.block_id,
      course_name: session.course_name,
      course_date: session.course_date.split('T')[0],
      duration_min: duration,
      understanding_score: score,
      notes,
    });
    onSave(entry);
    setSaving(false);
  };

  return (
    <div className="mt-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 space-y-3">
      <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">
        📝 Logger une révision — {session.course_name.split('—')[0].trim()}
      </p>

      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-500">Durée de révision</span>
          <span className="font-bold">{duration} min</span>
        </div>
        <input type="range" min={10} max={120} step={5} value={duration}
          onChange={e => setDuration(+e.target.value)}
          className="w-full accent-blue-600" />
        <div className="flex justify-between text-xs text-gray-400 mt-0.5">
          <span>10 min</span><span>1h</span><span>2h</span>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-500">Niveau de compréhension</span>
          <span className={`font-bold ${scoreColor(score)}`}>{score}/10</span>
        </div>
        <input type="range" min={1} max={10} value={score}
          onChange={e => setScore(+e.target.value)}
          className="w-full accent-blue-600" />
        <div className="flex justify-between text-xs text-gray-400 mt-0.5">
          <span>Difficile</span><span>Moyen</span><span>Maîtrisé</span>
        </div>
      </div>

      <textarea
        value={notes}
        onChange={e => setNotes(e.target.value)}
        placeholder="Ce que tu as revu, ce qui était difficile, ce qu'il faut retravailler…"
        rows={3}
        className="w-full text-sm p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div className="flex gap-2">
        <button onClick={submit} disabled={saving}
          className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors">
          {saving ? 'Enregistrement…' : '✓ Enregistrer la révision'}
        </button>
        <button onClick={onCancel}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          Annuler
        </button>
      </div>
    </div>
  );
}

// ── Single course card ────────────────────────────────────────────────────────

function CourseCard({
  session,
  onRevisionAdded,
}: {
  session: SchoolSession;
  onRevisionAdded: (blockId: string, entry: RevisionEntry) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<RevisionEntry[]>(session.revision_history || []);

  const count = history.length;
  const lastScore = history[0]?.understanding_score ?? null;

  const handleSave = (entry: RevisionEntry) => {
    setHistory(h => [entry, ...h]);
    setShowForm(false);
    onRevisionAdded(session.block_id, entry);
  };

  const handleDelete = async (id: string) => {
    await deleteRevision(id);
    setHistory(h => h.filter(r => r.id !== id));
  };

  // Short course label (before the —)
  const shortName = session.course_name.includes('—')
    ? session.course_name.split('—')[0].trim()
    : session.course_name;
  const teacher = session.course_name.includes('—')
    ? session.course_name.split('—')[1]?.trim()
    : null;

  return (
    <div className={`rounded-xl border p-3 space-y-2 transition-all ${
      count === 0
        ? 'border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/10'
        : lastScore && lastScore >= 8
        ? 'border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-950/20'
        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'
    }`}>

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">{shortName}</p>
          {teacher && <p className="text-xs text-gray-400">{teacher}</p>}
          <p className="text-xs font-mono text-gray-400 mt-0.5">
            {session.scheduled_start.slice(0,5)}–{session.scheduled_end.slice(0,5)}
          </p>
        </div>

        {/* Revision badge */}
        <div className="text-right flex-shrink-0">
          {count === 0 ? (
            <span className="text-xs bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full font-medium">
              ⚠️ Non révisé
            </span>
          ) : (
            <span className={`text-xs font-medium ${scoreColor(lastScore)}`}>
              {scoreLabel(lastScore)}
            </span>
          )}
          {count > 0 && (
            <p className="text-xs text-gray-400 mt-0.5">
              {count} révision{count > 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      {!showForm && (
        <div className="flex gap-2">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
          >
            📝 {count === 0 ? 'Réviser maintenant' : 'Réviser encore'}
          </button>
          {count > 0 && (
            <button
              onClick={() => setShowHistory(h => !h)}
              className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs rounded-lg transition-colors"
            >
              {showHistory ? '▲ Masquer' : `📋 Historique (${count})`}
            </button>
          )}
        </div>
      )}

      {/* Revision form */}
      {showForm && (
        <RevisionForm
          session={session}
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Revision history */}
      {showHistory && history.length > 0 && (
        <div className="space-y-2 pt-1 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs font-medium text-gray-400">Historique des révisions</p>
          {history.map(r => (
            <div key={r.id} className="flex items-start gap-2 bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">
                    {r.revised_on ? r.revised_on.split('T')[0] : '—'}
                  </span>
                  <span className="text-xs text-gray-400">{r.duration_min} min</span>
                  {r.understanding_score && (
                    <span className={`text-xs font-bold ${scoreColor(r.understanding_score)}`}>
                      {r.understanding_score}/10
                    </span>
                  )}
                </div>
                {r.notes && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 italic">{r.notes}</p>}
              </div>
              <button
                onClick={() => handleDelete(r.id)}
                className="text-gray-300 hover:text-red-400 text-xs p-1 transition-colors flex-shrink-0"
                title="Supprimer"
              >✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Revisions() {
  const [grouped, setGrouped] = useState<Record<string, SchoolSession[]>>({});
  const [loading, setLoading] = useState(true);
  const [days, setDays]       = useState(14);
  const [filter, setFilter]   = useState<'all' | 'pending'>('all');

  const load = () => {
    setLoading(true);
    getSchoolSessions(days)
      .then(setGrouped)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(load, [days]);

  const handleRevisionAdded = (blockId: string, entry: RevisionEntry) => {
    setGrouped(g => {
      const next = { ...g };
      for (const date of Object.keys(next)) {
        next[date] = next[date].map(s =>
          s.block_id === blockId
            ? { ...s, revision_count: s.revision_count + 1, revision_history: [entry, ...s.revision_history] }
            : s
        );
      }
      return next;
    });
  };

  // Stats
  const allSessions = Object.values(grouped).flat();
  const totalCourses = allSessions.length;
  const revised      = allSessions.filter(s => s.revision_count > 0).length;
  const notRevised   = totalCourses - revised;
  const avgScore     = allSessions
    .filter(s => s.best_score !== null)
    .reduce((sum, s, _, arr) => sum + (s.best_score ?? 0) / arr.length, 0);

  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Révisions 📚</h1>
        <p className="text-sm text-gray-400 mt-1">Suis ta révision des cours des jours précédents.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-3 text-center">
          <p className="text-2xl font-black text-blue-600">{revised}/{totalCourses}</p>
          <p className="text-xs text-gray-400 mt-0.5">cours révisés</p>
        </div>
        <div className={`rounded-xl border p-3 text-center ${
          notRevised > 0
            ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800'
            : 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
        }`}>
          <p className={`text-2xl font-black ${notRevised > 0 ? 'text-orange-500' : 'text-green-600'}`}>
            {notRevised}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">en attente</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-3 text-center">
          <p className="text-2xl font-black text-purple-600">
            {avgScore > 0 ? avgScore.toFixed(1) : '—'}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">score moy.</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2 items-center flex-wrap">
        <div className="flex gap-1">
          {([7, 14, 21] as const).map(d => (
            <button key={d} onClick={() => setDays(d)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                days === d
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}>
              {d} jours
            </button>
          ))}
        </div>
        <div className="flex gap-1 ml-auto">
          {(['all','pending'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                filter === f
                  ? 'bg-orange-500 text-white'
                  : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}>
              {f === 'all' ? 'Tous' : '⚠️ Non révisés'}
            </button>
          ))}
        </div>
      </div>

      {/* Course list */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-20 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />)}
        </div>
      ) : dates.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-2">📚</p>
          <p>Aucune séance de cours trouvée sur les {days} derniers jours.</p>
          <p className="text-sm mt-1">Les cours apparaissent ici après que le planning du jour est généré.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {dates.map(date => {
            const sessions = (grouped[date] || [])
              .filter(s => filter === 'all' || s.revision_count === 0);
            if (sessions.length === 0) return null;

            return (
              <div key={date}>
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="font-semibold text-sm">{fmt(date)}</h2>
                  <span className="text-xs text-gray-400">
                    {sessions.filter(s => s.revision_count > 0).length}/{sessions.length} révisé
                  </span>
                </div>
                <div className="space-y-2">
                  {sessions.map(s => (
                    <CourseCard
                      key={s.block_id}
                      session={s}
                      onRevisionAdded={handleRevisionAdded}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
