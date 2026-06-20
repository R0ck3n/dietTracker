import { useCallback, useEffect, useState } from 'react';
import { journalApi } from '../api';
import type { JournalDay } from '../api/types';
import { ApiClientError } from '../api/client';

export function useJournal(date: string) {
  const [day, setDay] = useState<JournalDay | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const response = await journalApi.getDay(date);
        if (!cancelled) {
          setDay(response);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiClientError ? err.message : 'Erreur de chargement');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    setDay(null);
    void load();

    return () => {
      cancelled = true;
    };
  }, [date]);

  const mutate = useCallback((next: JournalDay) => {
    setDay(next);
  }, []);

  return { day, loading, error, mutate };
}
