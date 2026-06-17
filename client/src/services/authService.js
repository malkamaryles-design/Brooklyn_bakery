import { apiGet, apiPost, apiPatch } from './apiClient';
export const registerUser = (name, email, password) =>
  apiPost('/api/auth/register', { name, email, password });
export const loginUser = (email, password) =>
  apiPost('/api/auth/login', { email, password });
export const getMe = () => apiGet('/api/auth/me');
export const updateProfile = (data) => apiPatch('/api/auth/profile', data);
export const changePassword = (currentPassword, newPassword) =>
  apiPatch('/api/auth/password', { currentPassword, newPassword });