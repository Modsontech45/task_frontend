import api from './client';
import { ActivityBlock, Status } from '../types';

export interface UpdatePayload {
  status?: Status;
  note?: string;
  actual_start?: string;
  actual_end?: string;
  energy_after?: number;
}

export const updateActivity = (id: string, payload: UpdatePayload) =>
  api.patch<ActivityBlock>(`/activities/${id}`, payload).then(r => r.data);
