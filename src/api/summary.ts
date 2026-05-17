import api from './client';
import { DailySummary, WeeklySummary } from '../types';

export const getDailySummary = (date: string) =>
  api.get<DailySummary>(`/summary/daily/${date}`).then(r => r.data);

export const getWeeklySummary = (start?: string) =>
  api.get<WeeklySummary>(`/summary/weekly${start ? `?start=${start}` : ''}`).then(r => r.data);
