import api from './client';
import { Category } from '../types';

export interface ScheduleTemplate {
  id: string;
  day_of_week: number;
  category: Category;
  title: string;
  scheduled_start: string;
  scheduled_end: string;
  is_fixed: boolean;
  sort_order: number;
}

export const getTemplates = () =>
  api.get<Record<number, ScheduleTemplate[]>>('/templates').then(r => r.data);

export const createTemplate = (data: Omit<ScheduleTemplate, 'id' | 'sort_order'>) =>
  api.post<ScheduleTemplate>('/templates', data).then(r => r.data);

export const updateTemplate = (id: string, data: Partial<Omit<ScheduleTemplate, 'id'>>) =>
  api.put<ScheduleTemplate>(`/templates/${id}`, data).then(r => r.data);

export const deleteTemplate = (id: string) =>
  api.delete(`/templates/${id}`).then(r => r.data);
