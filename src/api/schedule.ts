import api from './client';
import { ActivityBlock } from '../types';

export const getScheduleForDate = (date: string) =>
  api.get<ActivityBlock[]>(`/schedule/${date}`).then(r => r.data);

export const getTodaySchedule = () =>
  api.get<ActivityBlock[]>('/schedule/today').then(r => r.data);

export const getWeekSchedule = (startDate: string) =>
  api.get<ActivityBlock[]>(`/schedule/week/${startDate}`).then(r => r.data);
