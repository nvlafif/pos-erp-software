import api from '../../../api/axios';
import type { LoginRequest, LoginResponse } from '../types/auth.types';

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post('/auth/login', credentials);
    const payload = response.data?.data || response.data;
    return payload as LoginResponse;
  },
};