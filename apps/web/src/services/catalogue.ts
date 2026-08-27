import type {
  Category,
  Fabric,
  Product,
  ProductListResponse,
  ProductQuery,
  Project,
} from '@aura/types';
import { qs, request } from './client.js';

export const catalogueKeys = {
  products: (query: ProductQuery = {}) => ['products', query] as const,
  product: (slug: string) => ['product', slug] as const,
  categories: () => ['categories'] as const,
  fabrics: () => ['fabrics'] as const,
  projects: () => ['projects'] as const,
};

export function fetchProducts(query: ProductQuery = {}): Promise<ProductListResponse> {
  return request<ProductListResponse>(`/products${qs({ ...query })}`);
}

export function fetchProduct(slug: string): Promise<Product> {
  return request<Product>(`/products/${encodeURIComponent(slug)}`);
}

export function fetchCategories(): Promise<Category[]> {
  return request<Category[]>('/categories');
}

export function fetchFabrics(): Promise<Fabric[]> {
  return request<Fabric[]>('/fabrics');
}

export function fetchProjects(): Promise<Project[]> {
  return request<Project[]>('/projects');
}
