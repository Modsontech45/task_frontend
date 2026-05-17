import api from './client';

export interface RevisionEntry {
  id: string;
  activity_block_id: string;
  course_name: string;
  course_date: string;
  revised_on: string;
  duration_min: number;
  understanding_score: number | null;
  notes: string | null;
}

export interface SchoolSession {
  block_id: string;
  course_date: string;
  course_name: string;
  scheduled_start: string;
  scheduled_end: string;
  revision_count: number;
  last_revised: string | null;
  best_score: number | null;
  revision_history: RevisionEntry[];
}

export const getSchoolSessions = (days = 14) =>
  api.get<Record<string, SchoolSession[]>>(`/revisions/sessions?days=${days}`).then(r => r.data);

export const getPendingSessions = () =>
  api.get<SchoolSession[]>('/revisions/pending').then(r => r.data);

export const logRevision = (data: {
  activity_block_id: string;
  course_name: string;
  course_date: string;
  duration_min: number;
  understanding_score: number | null;
  notes: string;
}) => api.post<RevisionEntry>('/revisions', data).then(r => r.data);

export const deleteRevision = (id: string) =>
  api.delete(`/revisions/${id}`).then(r => r.data);
