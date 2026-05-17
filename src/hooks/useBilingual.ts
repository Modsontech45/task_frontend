import { useState, useEffect } from 'react';
import { BilingualEntry, BilingualStats } from '../types';
import { getBilingualProgress } from '../api/bilingual';

export function useBilingual(days = 30) {
  const [entries, setEntries] = useState<BilingualEntry[]>([]);
  const [stats, setStats] = useState<BilingualStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    setLoading(true);
    getBilingualProgress(days)
      .then(d => { setEntries(d.entries); setStats(d.stats); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(fetch, [days]);

  return { entries, stats, loading, refetch: fetch };
}
