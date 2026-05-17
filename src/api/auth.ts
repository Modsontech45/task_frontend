import api from './client';

interface AuthResponse {
  token: string;
  user: { id: string; email: string; name: string };
}

export const loginUser = (email: string, password: string) =>
  api.post<AuthResponse>('/auth/login', { email, password }).then(r => r.data);

export const registerUser = (email: string, name: string, password: string) =>
  api.post<AuthResponse>('/auth/register', { email, name, password }).then(r => r.data);

export const forgotPassword = (email: string) =>
  api.post<{ token: string; expires_in: string }>('/auth/forgot-password', { email }).then(r => r.data);

export const resetPassword = (token: string, new_password: string) =>
  api.post<{ message: string }>('/auth/reset-password', { token, new_password }).then(r => r.data);
