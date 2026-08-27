import type { Paginated, RatingSummary, Review } from '@aura/types';
import { request, qs } from './client.js';

export const reviewKeys = {
  list: (productId?: string) => ['reviews', productId ?? 'all'] as const,
  summary: (productId: string) => ['review-summary', productId] as const,
};

export function fetchReviews(productId?: string): Promise<Paginated<Review>> {
  return request<Paginated<Review>>(`/reviews${qs({ productId, pageSize: 50 })}`);
}

export function fetchRatingSummary(productId: string): Promise<RatingSummary> {
  return request<RatingSummary>(`/reviews/summary/${encodeURIComponent(productId)}`);
}
