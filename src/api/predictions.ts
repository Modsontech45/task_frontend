import api from './client';
import { Prediction } from '../types';

export const getPredictions = (date: string) =>
  api.get<Prediction>(`/predictions/${date}`).then(r => r.data);
