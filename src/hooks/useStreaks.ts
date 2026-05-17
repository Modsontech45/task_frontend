import { useState, useEffect } from 'react';
import { Streak } from '../types';
import { getStreaks } from '../api/streaks';

export function useStreaks() {
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStreaks()
      .then(setStreaks)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { streaks, loading };
}
