import type {
  Category,
  Fabric,
  Product,
  ProductListResponse,
  ProductQuery,
  Project,
} from '@aura/types';
import { qs, request } from './client.js';
import {
  staticCategories,
  staticFabrics,
  staticProduct,
  staticProducts,
  staticProjects,
} from './static.js';

/**
 * With no backend (a static Vercel deploy), the catalogue is served from a JSON
 * snapshot instead. Set at build time, so there is no per-request probing and
 * local development keeps talking to the real API.
 */
export const STATIC_MODE = import.meta.env['VITE_STATIC_DATA'] === '1';

export const catalogueKeys = {
  products: (query: ProductQuery = {}) => ['products', query] as const,
  product: (slug: string) => ['product', slug] as const,
  categories: () => ['categories'] as const,
  fabrics: () => ['fabrics'] as const,
  projects: () => ['projects'] as const,
};

export function fetchProducts(query: ProductQuery = {}): Promise<ProductListResponse> {
  if (STATIC_MODE) return staticProducts(query);
  return request<ProductListResponse>(`/products${qs({ ...query })}`);
}

export function fetchProduct(slug: string): Promise<Product> {
  if (STATIC_MODE) return staticProduct(slug);
  return request<Product>(`/products/${encodeURIComponent(slug)}`);
}

export function fetchCategories(): Promise<Category[]> {
  if (STATIC_MODE) return staticCategories();
  return request<Category[]>('/categories');
}

export function fetchFabrics(): Promise<Fabric[]> {
  if (STATIC_MODE) return staticFabrics();
  return request<Fabric[]>('/fabrics');
}

export function fetchProjects(): Promise<Project[]> {
  if (STATIC_MODE) return staticProjects();
  return request<Project[]>('/projects');
}
