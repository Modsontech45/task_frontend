import { useEffect, useRef } from 'react';
import { useActivities } from '../hooks/useActivities';

// Module-level: survives re-renders, resets on page refresh
const fired = new Set<string>();

function toMin(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m || 0);
}

function todayKey(): string {
  return new Date().toISOString().split('T')[0];
}

function nowMin(): number {
  const n = new Date();
  return n.getHours() * 60 + n.getMinutes();
}

function notify(title: string, body: string, tag: string) {
  if (Notification.permission !== 'granted') return;
  new Notification(title, { body, tag, icon: '/icon.png' });
}

export default function NotificationManager() {
  const { activities } = useActivities(); // today's activities
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Request permission once on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!('Notification' in window)) return;
    if (!activities.length) return;

    const check = () => {
      if (Notification.permission !== 'granted') return;

      const now = nowMin();
      const date = todayKey();

      for (const block of activities) {
        if (block.status === 'done' || block.status === 'skipped') continue;

        const start = toMin(block.scheduled_start);
        const end   = toMin(block.scheduled_end);
        const time5 = `${block.scheduled_start.slice(0, 5)}`;

        // 5 minutes before start
        const warnKey = `${date}:warn:${block.id}`;
        if (!fired.has(warnKey) && now >= start - 5 && now < start) {
          fired.add(warnKey);
          notify(
            `⏰ Dans 5 min — ${block.title}`,
            `Prévu à ${time5}. Prépare-toi !`,
            warnKey,
          );
        }

        // At start time (2-min window so 30s interval doesn't miss it)
        const startKey = `${date}:start:${block.id}`;
        if (!fired.has(startKey) && now >= start && now <= start + 1) {
          fired.add(startKey);
          notify(
            `▶ C'est l'heure — ${block.title}`,
            `Il est ${time5}, c'est parti !`,
            startKey,
          );
        }

        // At end time
        const endKey = `${date}:end:${block.id}`;
        if (!fired.has(endKey) && now >= end && now <= end + 1) {
          fired.add(endKey);
          notify(
            `🏁 Temps écoulé — ${block.title}`,
            `Fin prévue à ${block.scheduled_end.slice(0, 5)}`,
            endKey,
          );
        }
      }
    };

    check();
    intervalRef.current = setInterval(check, 30_000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [activities]);

  return null;
}
