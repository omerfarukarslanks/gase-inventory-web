import { apiFetch } from './client';
import type { ProductsResponse } from '../types/domain';

export async function getProducts(params?: { page?: number; limit?: number; search?: string }) {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.search) query.set('search', params.search);

  const suffix = query.toString() ? `?${query.toString()}` : '';
  return apiFetch<ProductsResponse>(`/products${suffix}`);
}
