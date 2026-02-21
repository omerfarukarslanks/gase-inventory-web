import { apiFetch } from './client';
import type { StockSummaryResponse } from '../types/domain';

export async function getStockSummary(params?: { page?: number; limit?: number; search?: string }) {
  return apiFetch<StockSummaryResponse>('/inventory/stock/summary', {
    method: 'POST',
    body: JSON.stringify({
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
      search: params?.search,
    }),
  });
}
