import { apiRequest } from './client';
import type {
  ActivityInput,
  FoodInput,
  JournalDay,
  SleepInput,
  StatsResponse,
  User,
} from './types';

export const authApi = {
  login(username: string, password: string) {
    return apiRequest<{ user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },
  register(username: string, password: string) {
    return apiRequest<{ user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },
  status() {
    return apiRequest<{ hasUser: boolean }>('/auth/status');
  },
  logout() {
    return apiRequest<{ ok: boolean }>('/auth/logout', { method: 'POST' });
  },
  me() {
    return apiRequest<{ user: User }>('/auth/me');
  },
  deleteData(password: string) {
    return apiRequest<{ ok: boolean }>('/auth/data', {
      method: 'DELETE',
      body: JSON.stringify({ password }),
    });
  },
  deleteAccount(password: string) {
    return apiRequest<{ ok: boolean }>('/auth/account', {
      method: 'DELETE',
      body: JSON.stringify({ password }),
    });
  },
};

export const journalApi = {
  getDay(date: string) {
    return apiRequest<JournalDay>(`/journal/${date}`);
  },
  createDay(date: string) {
    return apiRequest<JournalDay>('/journal', {
      method: 'POST',
      body: JSON.stringify({ date }),
    });
  },
  updateNotes(date: string, notes: string | null) {
    return apiRequest<JournalDay>(`/journal/${date}`, {
      method: 'PUT',
      body: JSON.stringify({ notes }),
    });
  },
  updateWeight(date: string, weight: number | null) {
    return apiRequest<JournalDay>(`/journal/${date}/weight`, {
      method: 'PATCH',
      body: JSON.stringify({ weight }),
    });
  },
  updateHydration(date: string, hydrationLiters: number | null) {
    return apiRequest<JournalDay>(`/journal/${date}/hydration`, {
      method: 'PATCH',
      body: JSON.stringify({ hydrationLiters }),
    });
  },
};

export const foodApi = {
  create(date: string, input: FoodInput) {
    return apiRequest(`/journal/${date}/foods`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  update(id: number, input: FoodInput) {
    return apiRequest(`/foods/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  },
  delete(id: number) {
    return apiRequest(`/foods/${id}`, { method: 'DELETE' });
  },
};

export const activityApi = {
  create(date: string, input: ActivityInput) {
    return apiRequest(`/journal/${date}/activities`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  update(id: number, input: ActivityInput) {
    return apiRequest(`/activities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  },
  delete(id: number) {
    return apiRequest(`/activities/${id}`, { method: 'DELETE' });
  },
};

export const sleepApi = {
  upsert(date: string, input: SleepInput) {
    return apiRequest(`/journal/${date}/sleep`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  update(id: number, input: SleepInput) {
    return apiRequest(`/sleep/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  },
};

export const statsApi = {
  getRange(from: string, to: string) {
    return apiRequest<StatsResponse>(`/stats?from=${from}&to=${to}`);
  },
};
