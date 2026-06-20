import { useCallback, useEffect, useState } from 'react';
import { journalApi } from '../api';
import type { JournalDay } from '../api/types';
import { ApiClientError } from '../api/client';

export function useJournal(date: string) {
  const [day, setDay] = useState<JournalDay | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await journalApi.getDay(date);
      setDay(response);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const mutate = useCallback((next: JournalDay) => {
    setDay(next);
  }, []);

  return { day, loading, error, reload, mutate };
}
