import { useState, useEffect } from 'react';
import { ActivityBlock, CATEGORY_BG, CATEGORY_LABELS, DAYS_FR } from '../types';
import { getScheduleForDate } from '../api/schedule';
import { updateActivity } from '../api/activities';

function tomorrow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

function minutesBetween(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return (eh * 60 + em) - (sh * 60 + sm);
}

function formatDuration(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h${m}` : `${h}h`;
}

export default function TomorrowPreview() {
  const [open, setOpen] = useState(false);
  const [blocks, setBlocks] = useState<ActivityBlock[]>([]);
  const [loading, setLoading] = useState(false);
  const [noteMap, setNoteMap] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  const date = tomorrow();
  const dow = new Date(date + 'T12:00:00Z').getUTCDay();
  const dayLabel = DAYS_FR[dow];

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getScheduleForDate(date)
      .then(data => {
        setBlocks(data);
        const map: Record<string, string> = {};
        data.forEach(b => { if (b.note) map[b.id] = b.note; });
        setNoteMap(map);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [open, date]);

  const saveNote = async (id: string) => {
    setSavingId(id);
    await updateActivity(id, { note: noteMap[id] || '' });
    setSavedId(id);
    setTimeout(() => setSavedId(null), 1800);
    setSavingId(null);
  };

  // Compute free time: gaps between consecutive blocks
  type Gap = { from: string; to: string; minutes: number };
  const freeSlots: Gap[] = [];
  if (blocks.length > 1) {
    const sorted = [...blocks].sort((a, b) => a.scheduled_start.localeCompare(b.scheduled_start));
    for (let i = 0; i < sorted.length - 1; i++) {
      const gapMin = minutesBetween(sorted[i].scheduled_end, sorted[i + 1].scheduled_start);
      if (gapMin >= 20) {
        freeSlots.push({
          from: sorted[i].scheduled_end.slice(0, 5),
          to: sorted[i + 1].scheduled_start.slice(0, 5),
          minutes: gapMin,
        });
      }
    }
  }

  const totalScheduledMin = blocks.reduce((s, b) => s + minutesBetween(b.scheduled_start, b.scheduled_end), 0);
  const totalFreeMin = freeSlots.reduce((s, g) => s + g.minutes, 0);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header — always visible */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <div>
          <h3 className="font-semibold text-sm flex items-center gap-2">
            🗓️ Plan pour demain
            <span className="text-gray-400 font-normal">— {dayLabel} {date}</span>
          </h3>
          {!open && (
            <p className="text-xs text-gray-400 mt-0.5">Voir et préparer ta journée de demain</p>
          )}
        </div>
        <span className="text-gray-400 text-lg">{open ? '▲' : '▼'}</span>
      </button>

      {/* Expanded panel */}
      {open && (
        <div className="border-t border-gray-100 dark:border-gray-800 p-4 space-y-4">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <div key={i} className="h-12 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />)}
            </div>
          ) : (
            <>
              {/* Time summary */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                  <p className="text-lg font-bold">{blocks.length}</p>
                  <p className="text-xs text-gray-400">activités</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-2">
                  <p className="text-lg font-bold text-blue-600">{formatDuration(totalScheduledMin)}</p>
                  <p className="text-xs text-gray-400">planifié</p>
                </div>
                <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-2">
                  <p className="text-lg font-bold text-green-600">{formatDuration(totalFreeMin)}</p>
                  <p className="text-xs text-gray-400">temps libre</p>
                </div>
              </div>

              {/* Free time slots */}
              {freeSlots.length > 0 && (
                <div className="bg-green-50 dark:bg-green-950/20 rounded-xl p-3 space-y-1.5">
                  <p className="text-xs font-semibold text-green-700 dark:text-green-400">
                    ✅ Créneaux libres disponibles :
                  </p>
                  {freeSlots.map((g, i) => (
                    <div key={i} className="flex items-center justify-between text-xs text-green-700 dark:text-green-300">
                      <span>{g.from} → {g.to}</span>
                      <span className="font-medium">{formatDuration(g.minutes)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Activity list with note prep */}
              <div className="space-y-2">
                {blocks.map(b => (
                  <div
                    key={b.id}
                    className="rounded-lg border border-gray-100 dark:border-gray-800 p-3 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-8 rounded-full flex-shrink-0 ${CATEGORY_BG[b.category]}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{b.title}</p>
                        <p className="text-xs text-gray-400 font-mono">
                          {b.scheduled_start.slice(0, 5)} – {b.scheduled_end.slice(0, 5)}
                          <span className="ml-1 not-italic text-gray-300 dark:text-gray-600">·</span>
                          <span className="ml-1">{formatDuration(minutesBetween(b.scheduled_start, b.scheduled_end))}</span>
                          {b.is_fixed && <span className="ml-1 text-gray-400">· fixe</span>}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORY_BG[b.category]} text-white`}>
                        {CATEGORY_LABELS[b.category]}
                      </span>
                    </div>

                    {/* Note prep for non-fixed blocks */}
                    {!b.is_fixed && (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Préparer une note..."
                          value={noteMap[b.id] || ''}
                          onChange={e => setNoteMap(m => ({ ...m, [b.id]: e.target.value }))}
                          className="flex-1 text-xs p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          onKeyDown={e => e.key === 'Enter' && saveNote(b.id)}
                        />
                        <button
                          onClick={() => saveNote(b.id)}
                          disabled={savingId === b.id}
                          className="text-xs px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50 flex-shrink-0"
                        >
                          {savedId === b.id ? '✓' : 'Sauver'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
