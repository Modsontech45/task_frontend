import { useState, useEffect, useRef } from 'react';
import { ActivityBlock as Block, Status, CATEGORY_BG, CATEGORY_LABELS } from '../types';
import { UpdatePayload } from '../api/activities';

interface Props {
  block: Block;
  onUpdate: (id: string, payload: UpdatePayload) => Promise<unknown>;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function nowTimeStr(): string {
  const n = new Date();
  return [n.getHours(), n.getMinutes(), n.getSeconds()]
    .map(v => String(v).padStart(2, '0'))
    .join(':');
}

function timeToSec(t: string): number {
  const [h, m, s = 0] = t.split(':').map(Number);
  return h * 3600 + m * 60 + (s || 0);
}

function formatElapsed(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatSpent(start: string, end: string): string {
  const diff = Math.max(0, timeToSec(end) - timeToSec(start));
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  if (h > 0) return `${h}h${m > 0 ? m + 'min' : ''}`;
  return `${m} min`;
}

function isOverdue(scheduledEnd: string): boolean {
  const now = new Date();
  const nowSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  return nowSec > timeToSec(scheduledEnd);
}

// ── Status styling ────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<Status, string> = {
  pending:       'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  'in-progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  done:          'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  skipped:       'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300',
};

const STATUS_LABELS: Record<Status, string> = {
  pending:       'À faire',
  'in-progress': 'En cours',
  done:          'Terminé',
  skipped:       'Passé',
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function ActivityBlockCard({ block, onUpdate }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [note, setNote]         = useState(block.note || '');
  const [energy, setEnergy]     = useState(block.energy_after || 5);
  const [saving, setSaving]     = useState(false);
  const [elapsed, setElapsed]   = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Live timer when in-progress
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (block.status === 'in-progress' && block.actual_start) {
      const now = new Date();
      const startSec = timeToSec(block.actual_start);
      const nowSec   = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
      setElapsed(Math.max(0, nowSec - startSec));

      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      setElapsed(0);
    }

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [block.status, block.actual_start]);

  // Sync note/energy when block data changes from parent
  useEffect(() => { setNote(block.note || ''); }, [block.note]);
  useEffect(() => { setEnergy(block.energy_after || 5); }, [block.energy_after]);

  // ── Action handlers ────────────────────────────────────────────────────────

  const handleStart = async () => {
    setSaving(true);
    await onUpdate(block.id, { status: 'in-progress', actual_start: nowTimeStr() });
    setSaving(false);
  };

  const handleDone = async () => {
    setSaving(true);
    const payload: UpdatePayload = { status: 'done', actual_end: nowTimeStr() };
    // If not yet started, record start as scheduled_start
    if (!block.actual_start) payload.actual_start = block.scheduled_start.slice(0, 8);
    await onUpdate(block.id, payload);
    setSaving(false);
    setExpanded(false);
  };

  const handleSkip = async () => {
    setSaving(true);
    await onUpdate(block.id, { status: 'skipped' });
    setSaving(false);
  };

  const handleSaveNote = async () => {
    setSaving(true);
    await onUpdate(block.id, { note, energy_after: energy });
    setSaving(false);
    setExpanded(false);
  };

  // ── Derived state ──────────────────────────────────────────────────────────

  const overdue    = block.status === 'pending' && isOverdue(block.scheduled_end);
  const isFixed    = block.is_fixed;
  const timeSpent  = block.status === 'done' && block.actual_start && block.actual_end
    ? formatSpent(block.actual_start, block.actual_end)
    : null;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className={`rounded-xl border transition-all ${
      block.status === 'done'
        ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30'
        : block.status === 'skipped'
        ? 'border-red-100 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20 opacity-60'
        : block.status === 'in-progress'
        ? 'border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-950/20 shadow-sm shadow-blue-200 dark:shadow-blue-900'
        : overdue
        ? 'border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/10'
        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'
    }`}>

      {/* ── Header row ── */}
      <div className="flex items-center gap-3 p-3">
        <span className={`w-2 h-10 rounded-full flex-shrink-0 ${CATEGORY_BG[block.category]}`} />

        {/* Time */}
        <div className="text-xs text-gray-400 dark:text-gray-500 w-20 flex-shrink-0 font-mono leading-tight">
          {block.scheduled_start.slice(0, 5)}<br />
          {block.scheduled_end.slice(0, 5)}
        </div>

        {/* Title + meta */}
        <div className="flex-1 min-w-0">
          <p className={`font-medium text-sm truncate ${block.status === 'done' ? 'line-through text-gray-400' : ''}`}>
            {block.title}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {CATEGORY_LABELS[block.category]}
            {isFixed && ' · Fixe'}
            {overdue && !isFixed && <span className="text-orange-500 ml-1">· En retard</span>}
          </p>
        </div>

        {/* Status badge / timer */}
        {block.status === 'in-progress' ? (
          <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400 tabular-nums flex-shrink-0">
            {formatElapsed(elapsed)}
          </span>
        ) : timeSpent ? (
          <span className="text-xs text-green-600 dark:text-green-400 font-medium flex-shrink-0">
            ⏱ {timeSpent}
          </span>
        ) : (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${STATUS_BADGE[block.status]}`}>
            {STATUS_LABELS[block.status]}
          </span>
        )}
      </div>

      {/* ── Action bar (non-fixed activities only) ── */}
      {!isFixed && (
        <div className="flex gap-2 px-3 pb-3">

          {/* START button — only when pending */}
          {block.status === 'pending' && (
            <button
              disabled={saving}
              onClick={handleStart}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
            >
              ▶ Démarrer
            </button>
          )}

          {/* DONE button */}
          {(block.status === 'pending' || block.status === 'in-progress') && (
            <button
              disabled={saving}
              onClick={handleDone}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              ✓ Terminer
            </button>
          )}

          {/* SKIP button — only when pending */}
          {block.status === 'pending' && (
            <button
              disabled={saving}
              onClick={handleSkip}
              className="px-2.5 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-lg transition-colors disabled:opacity-50"
            >
              Passer
            </button>
          )}

          {/* Note toggle */}
          {block.status !== 'skipped' && (
            <button
              onClick={() => setExpanded(e => !e)}
              className="ml-auto px-2.5 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-lg transition-colors"
            >
              {expanded ? '▲' : '📝 Note'}
            </button>
          )}
        </div>
      )}

      {/* ── Actual time display (done) ── */}
      {block.status === 'done' && block.actual_start && block.actual_end && (
        <div className="px-3 pb-2 flex gap-3 text-xs text-gray-400">
          <span>Début réel : {block.actual_start.slice(0, 5)}</span>
          <span>Fin : {block.actual_end.slice(0, 5)}</span>
        </div>
      )}

      {/* ── Note editor ── */}
      {expanded && (
        <div className="px-3 pb-3 border-t border-gray-100 dark:border-gray-800 pt-3 space-y-2">
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Ajouter une note..."
            rows={2}
            className="w-full text-sm p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex items-center gap-3">
            <label className="text-xs text-gray-500 flex-shrink-0">Énergie après :</label>
            <input
              type="range" min={1} max={10} value={energy}
              onChange={e => setEnergy(parseInt(e.target.value))}
              className="flex-1 accent-blue-600"
            />
            <span className="text-sm font-bold w-4">{energy}</span>
          </div>
          <button
            onClick={handleSaveNote}
            disabled={saving}
            className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Enregistrer
          </button>
        </div>
      )}
    </div>
  );
}
