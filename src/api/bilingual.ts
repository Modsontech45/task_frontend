import api from './client';
import { BilingualEntry, BilingualStats, BilingualTip } from '../types';

export const getBilingualProgress = (days = 30) =>
  api.get<{ entries: BilingualEntry[]; stats: BilingualStats }>(`/bilingual/progress?days=${days}`).then(r => r.data);

export const logBilingualSession = (data: Partial<BilingualEntry>) =>
  api.post<BilingualEntry>('/bilingual/progress', data).then(r => r.data);

export const getDailyTip = () =>
  api.get<BilingualTip>('/bilingual/tip').then(r => r.data);
