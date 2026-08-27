import type {
  AdminLoginInput,
  AdminProductInput,
  AdminSession,
  Inquiry,
  InquiryStatus,
  Product,
  Review,
} from '@aura/types';
import { request, qs } from './client.js';

const TOKEN_KEY = 'aura-admin-token';

/**
 * The admin token lives in localStorage rather than a cookie because the API is
 * a separate origin in production and this panel is a single-operator internal
 * tool. If it ever becomes multi-user, move to an httpOnly cookie.
 */
export function readToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function writeToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* private mode — the session simply will not persist */
  }
}

function auth(): HeadersInit {
  const token = readToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const adminKeys = {
  me: () => ['admin', 'me'] as const,
  stats: () => ['admin', 'stats'] as const,
  products: () => ['admin', 'products'] as const,
  reviews: (status?: string) => ['admin', 'reviews', status ?? 'all'] as const,
  inquiries: (status?: string) => ['admin', 'inquiries', status ?? 'all'] as const,
};

export function login(input: AdminLoginInput): Promise<AdminSession> {
  return request<AdminSession>('/admin/login', { method: 'POST', body: JSON.stringify(input) });
}

export function me(): Promise<{ admin: { id: string; email: string } }> {
  return request('/admin/me', { headers: auth() });
}

export interface AdminStats {
  pendingReviews: number;
  newInquiries: number;
  products: number;
  projects: number;
}

export function fetchStats(): Promise<AdminStats> {
  return request<AdminStats>('/admin/stats', { headers: auth() });
}

export function fetchAdminProducts(): Promise<{ items: Product[] }> {
  return request('/admin/products', { headers: auth() });
}

export function createProduct(input: AdminProductInput): Promise<Product> {
  return request('/admin/products', {
    method: 'POST',
    headers: auth(),
    body: JSON.stringify(input),
  });
}

export function updateProduct(id: string, input: AdminProductInput): Promise<Product> {
  return request(`/admin/products/${id}`, {
    method: 'PUT',
    headers: auth(),
    body: JSON.stringify(input),
  });
}

export function deleteProduct(id: string): Promise<{ ok: boolean }> {
  return request(`/admin/products/${id}`, { method: 'DELETE', headers: auth() });
}

/** FormData upload — deliberately does NOT set Content-Type so the browser
 *  can add the multipart boundary. */
export function uploadProductImages(id: string, files: File[]): Promise<{ images: unknown[] }> {
  const form = new FormData();
  for (const file of files) form.append('images', file);
  return request(`/admin/products/${id}/images`, {
    method: 'POST',
    headers: auth(),
    body: form,
  });
}

export function deleteProductImage(productId: string, imageId: string): Promise<{ ok: boolean }> {
  return request(`/admin/products/${productId}/images/${imageId}`, {
    method: 'DELETE',
    headers: auth(),
  });
}

export interface AdminReviewRow extends Review {
  authorEmail: string;
  product: { slug: string; name: string } | null;
}

export function fetchAdminReviews(status?: string): Promise<{
  items: AdminReviewRow[];
  total: number;
  pendingCount: number;
}> {
  return request(`/admin/reviews${qs({ status, pageSize: 100 })}`, { headers: auth() });
}

export function setReviewStatus(id: string, status: 'APPROVED' | 'REJECTED'): Promise<Review> {
  return request(`/admin/reviews/${id}`, {
    method: 'PATCH',
    headers: auth(),
    body: JSON.stringify({ status }),
  });
}

export function fetchAdminInquiries(status?: string): Promise<{
  items: Inquiry[];
  total: number;
  newCount: number;
}> {
  return request(`/admin/inquiries${qs({ status, pageSize: 100 })}`, { headers: auth() });
}

export function setInquiryStatus(id: string, status: InquiryStatus): Promise<Inquiry> {
  return request(`/admin/inquiries/${id}`, {
    method: 'PATCH',
    headers: auth(),
    body: JSON.stringify({ status }),
  });
}
