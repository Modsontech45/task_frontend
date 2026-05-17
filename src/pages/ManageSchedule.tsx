import { useState, useEffect } from 'react';
import {
  getTemplates, createTemplate, updateTemplate, deleteTemplate, ScheduleTemplate,
} from '../api/templates';
import { Category, CATEGORY_BG, CATEGORY_LABELS, DAYS_FR } from '../types';

const CATEGORIES: Category[] = ['school','gym','skill','bilingual','reading','personal','travel'];

const DAYS = [1,2,3,4,5,6,0]; // Mon→Sun display order

// ── Blank template form ────────────────────────────────────────────────────
const blank = (day: number): Omit<ScheduleTemplate,'id'|'sort_order'> => ({
  day_of_week: day,
  category: 'personal',
  title: '',
  scheduled_start: '08:00',
  scheduled_end: '09:00',
  is_fixed: false,
});

// ── Single editable row ────────────────────────────────────────────────────
function TemplateRow({
  tpl,
  onSave,
  onDelete,
}: {
  tpl: ScheduleTemplate;
  onSave: (id: string, data: Partial<ScheduleTemplate>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState<ScheduleTemplate>({ ...tpl });
  const [busy, setBusy]       = useState(false);

  const save = async () => {
    setBusy(true);
    await onSave(tpl.id, {
      category: form.category,
      title: form.title,
      scheduled_start: form.scheduled_start,
      scheduled_end: form.scheduled_end,
      is_fixed: form.is_fixed,
    });
    setBusy(false);
    setEditing(false);
  };

  const remove = async () => {
    if (!confirm(`Supprimer "${tpl.title}" ?`)) return;
    setBusy(true);
    await onDelete(tpl.id);
    setBusy(false);
  };

  if (!editing) {
    return (
      <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 group">
        <span className={`w-2 h-8 rounded-full flex-shrink-0 ${CATEGORY_BG[tpl.category]}`} />
        <span className="font-mono text-xs text-gray-400 w-24 flex-shrink-0">
          {tpl.scheduled_start.slice(0,5)}–{tpl.scheduled_end.slice(0,5)}
        </span>
        <span className="flex-1 text-sm truncate">{tpl.title}</span>
        {tpl.is_fixed && (
          <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded flex-shrink-0">
            fixe
          </span>
        )}
        <div className="hidden group-hover:flex gap-1 flex-shrink-0">
          <button
            onClick={() => { setForm({ ...tpl }); setEditing(true); }}
            className="p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
            title="Modifier"
          >✏️</button>
          <button
            onClick={remove}
            disabled={busy}
            className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors disabled:opacity-40"
            title="Supprimer"
          >🗑️</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 space-y-2">
      <input
        value={form.title}
        onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
        placeholder="Titre du bloc"
        className="w-full text-sm p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-gray-500">Début</label>
          <input
            type="time"
            value={form.scheduled_start.slice(0,5)}
            onChange={e => setForm(f => ({ ...f, scheduled_start: e.target.value+':00' }))}
            className="w-full mt-0.5 text-sm p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">Fin</label>
          <input
            type="time"
            value={form.scheduled_end.slice(0,5)}
            onChange={e => setForm(f => ({ ...f, scheduled_end: e.target.value+':00' }))}
            className="w-full mt-0.5 text-sm p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-gray-500">Catégorie</label>
          <select
            value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value as Category }))}
            className="w-full mt-0.5 text-sm p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <input
            type="checkbox"
            id={`fixed-${tpl.id}`}
            checked={form.is_fixed}
            onChange={e => setForm(f => ({ ...f, is_fixed: e.target.checked }))}
            className="accent-blue-600"
          />
          <label htmlFor={`fixed-${tpl.id}`} className="text-sm text-gray-600 dark:text-gray-300">
            Bloc fixe (cours)
          </label>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={save}
          disabled={busy || !form.title.trim()}
          className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium disabled:opacity-50 transition-colors"
        >
          {busy ? 'Enregistrement…' : '✓ Enregistrer'}
        </button>
        <button
          onClick={() => setEditing(false)}
          className="px-4 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm rounded-lg transition-colors"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}

// ── Add new template form ──────────────────────────────────────────────────
function AddForm({
  day,
  onAdd,
}: {
  day: number;
  onAdd: (data: Omit<ScheduleTemplate,'id'|'sort_order'>) => Promise<void>;
}) {
  const [open, setOpen]   = useState(false);
  const [form, setForm]   = useState(blank(day));
  const [busy, setBusy]   = useState(false);

  const submit = async () => {
    if (!form.title.trim()) return;
    setBusy(true);
    await onAdd(form);
    setForm(blank(day));
    setBusy(false);
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full mt-1 flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
      >
        + Ajouter un bloc
      </button>
    );
  }

  return (
    <div className="mt-2 p-3 rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20 space-y-2">
      <p className="text-xs font-semibold text-green-700 dark:text-green-400">Nouveau bloc</p>
      <input
        value={form.title}
        onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
        placeholder="Titre du bloc"
        autoFocus
        className="w-full text-sm p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
      />
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-gray-500">Début</label>
          <input
            type="time"
            value={form.scheduled_start.slice(0,5)}
            onChange={e => setForm(f => ({ ...f, scheduled_start: e.target.value+':00' }))}
            className="w-full mt-0.5 text-sm p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">Fin</label>
          <input
            type="time"
            value={form.scheduled_end.slice(0,5)}
            onChange={e => setForm(f => ({ ...f, scheduled_end: e.target.value+':00' }))}
            className="w-full mt-0.5 text-sm p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-gray-500">Catégorie</label>
          <select
            value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value as Category }))}
            className="w-full mt-0.5 text-sm p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <input
            type="checkbox"
            id="new-fixed"
            checked={form.is_fixed}
            onChange={e => setForm(f => ({ ...f, is_fixed: e.target.checked }))}
            className="accent-green-600"
          />
          <label htmlFor="new-fixed" className="text-sm text-gray-600 dark:text-gray-300">Bloc fixe</label>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={submit}
          disabled={busy || !form.title.trim()}
          className="flex-1 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg font-medium disabled:opacity-50 transition-colors"
        >
          {busy ? 'Ajout…' : '+ Ajouter'}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="px-4 py-1.5 bg-gray-100 dark:bg-gray-800 text-sm rounded-lg transition-colors"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function ManageSchedule() {
  const [grouped, setGrouped] = useState<Record<number, ScheduleTemplate[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(1);

  useEffect(() => {
    getTemplates().then(setGrouped).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSave = async (id: string, data: Partial<ScheduleTemplate>) => {
    const updated = await updateTemplate(id, data);
    setGrouped(g => {
      const day = updated.day_of_week;
      return { ...g, [day]: (g[day] || []).map(t => t.id === id ? updated : t) };
    });
  };

  const handleDelete = async (id: string) => {
    await deleteTemplate(id);
    setGrouped(g => {
      const next = { ...g };
      for (const day of Object.keys(next) as unknown as number[]) {
        next[day] = next[day].filter(t => t.id !== id);
      }
      return next;
    });
  };

  const handleAdd = async (data: Omit<ScheduleTemplate,'id'|'sort_order'>) => {
    const created = await createTemplate(data);
    setGrouped(g => ({
      ...g,
      [data.day_of_week]: [...(g[data.day_of_week] || []), created],
    }));
  };

  const dayBlocks = grouped[activeDay] || [];
  const sorted = [...dayBlocks].sort((a,b) => a.scheduled_start.localeCompare(b.scheduled_start));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Gérer le Planning ⚙️</h1>
        <p className="text-sm text-gray-400 mt-1">
          Modifie, ajoute ou supprime des blocs dans ton modèle hebdomadaire.
          Les changements s'appliquent aux <span className="font-medium">prochains jours générés</span>.
        </p>
      </div>

      {/* Day tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {DAYS.map(d => (
          <button
            key={d}
            onClick={() => setActiveDay(d)}
            className={`px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
              activeDay === d
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            {DAYS_FR[d]}
            <span className="ml-1.5 text-xs opacity-60">{(grouped[d] || []).length}</span>
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(c => (
          <span key={c} className="flex items-center gap-1 text-xs text-gray-500">
            <span className={`w-2 h-2 rounded-full ${CATEGORY_BG[c]}`} />
            {CATEGORY_LABELS[c]}
          </span>
        ))}
      </div>

      {/* Template list */}
      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="h-10 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-3 space-y-0.5">
          <p className="text-xs font-semibold text-gray-400 px-2 mb-2">
            {DAYS_FR[activeDay]} — {sorted.length} bloc{sorted.length !== 1 ? 's' : ''}
          </p>

          {sorted.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">
              Aucun bloc pour ce jour. Ajoute-en un ci-dessous.
            </p>
          )}

          {sorted.map(t => (
            <TemplateRow
              key={t.id}
              tpl={t}
              onSave={handleSave}
              onDelete={handleDelete}
            />
          ))}

          <AddForm day={activeDay} onAdd={handleAdd} />
        </div>
      )}

      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
        <p className="text-xs text-amber-700 dark:text-amber-400">
          ⚠️ Les modifications ici n'affectent pas les activités déjà générées pour aujourd'hui ou les jours passés.
          Elles s'appliquent aux prochains jours quand tu ouvriras le planning pour la première fois.
        </p>
      </div>
    </div>
  );
}
