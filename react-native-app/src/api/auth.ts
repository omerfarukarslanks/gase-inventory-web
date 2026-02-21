import { apiFetch } from './client';
import type { User } from '../types/domain';

export type LoginResponse = {
  accessToken: string;
  user: User;
};

export async function login(email: string, password: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}
