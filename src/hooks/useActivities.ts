import { useState, useEffect, useCallback, useRef } from 'react';
import { ActivityBlock } from '../types';
import { getTodaySchedule, getScheduleForDate } from '../api/schedule';
import { updateActivity, UpdatePayload } from '../api/activities';

function timeToMin(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m || 0);
}

export function useActivities(date?: string) {
  const [activities, setActivities] = useState<ActivityBlock[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const activitiesRef               = useRef<ActivityBlock[]>([]);
  activitiesRef.current             = activities;

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = date ? await getScheduleForDate(date) : await getTodaySchedule();
      setActivities(data);
    } catch {
      setError('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => { fetchActivities(); }, [fetchActivities]);

  const update = useCallback(async (id: string, payload: UpdatePayload) => {
    const updated = await updateActivity(id, payload);
    setActivities(prev => prev.map(a => a.id === id ? updated : a));
    return updated;
  }, []);

  // Auto-pass: mark pending activities as skipped when their scheduled end has passed
  // Only runs for today's schedule (no date prop = today)
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (date && date !== today) return; // only auto-pass today

    const check = () => {
      const now  = new Date();
      const nowMin = now.getHours() * 60 + now.getMinutes();

      activitiesRef.current.forEach(a => {
        if (a.status !== 'pending') return;
        if (timeToMin(a.scheduled_end) < nowMin) {
          updateActivity(a.id, { status: 'skipped' }).then(updated => {
            setActivities(prev => prev.map(x => x.id === updated.id ? updated : x));
          }).catch(console.error);
        }
      });
    };

    // Run immediately, then every 60 s
    check();
    const interval = setInterval(check, 60_000);
    return () => clearInterval(interval);
  }, [date]); // stable: only re-runs if date changes

  return { activities, loading, error, refetch: fetchActivities, update };
}
