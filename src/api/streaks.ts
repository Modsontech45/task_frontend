import api from './client';
import { Streak } from '../types';

export const getStreaks = () =>
  api.get<Streak[]>('/streaks').then(r => r.data);
