import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CATEGORY_ALIASES } from '@/lib/slugAliases';
import {
  FABRIC_CATEGORIES,
  PRODUCT_SORTS,
  type FabricCategory,
  type ProductQuery,
  type ProductSort,
} from '@aura/types';

/**
 * Catalogue filter state, with the URL as the single source of truth.
 *
 * Keeping state in the query string rather than React state is what makes the
 * results shareable and makes browser back/forward work for free — there is no
 * second copy of the state to fall out of sync.
 *
 * Param names deliberately match the API's own query contract, so a URL a
 * customer pastes into chat is also a URL you can curl.
 */

const ARRAY_KEYS = ['categories', 'fabricCategories', 'fabrics'] as const;

export interface FilterState {
  categories: string[];
  fabricCategories: FabricCategory[];
  fabrics: string[];
  priceMin?: number;
  priceMax?: number;
  customSize: boolean;
  sort: ProductSort;
  page: number;
}

function readList(params: URLSearchParams, key: string): string[] {
  const raw = params.get(key);
  if (!raw) return [];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function readInt(params: URLSearchParams, key: string): number | undefined {
  const raw = params.get(key);
  if (raw === null) return undefined;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : undefined;
}

export function parseFilters(params: URLSearchParams): FilterState {
  const sortRaw = params.get('sort');
  const sort = (PRODUCT_SORTS as readonly string[]).includes(sortRaw ?? '')
    ? (sortRaw as ProductSort)
    : 'featured';

  const fabricCategories = readList(params, 'fabricCategories').filter((v): v is FabricCategory =>
    (FABRIC_CATEGORIES as readonly string[]).includes(v),
  );

  return {
    // Old category slugs in a shared URL resolve to the current one.
    categories: readList(params, 'categories').map((c) => CATEGORY_ALIASES[c] ?? c),
    fabricCategories,
    fabrics: readList(params, 'fabrics'),
    priceMin: readInt(params, 'priceMin'),
    priceMax: readInt(params, 'priceMax'),
    customSize: params.get('customSize') === 'true',
    sort,
    page: readInt(params, 'page') ?? 1,
  };
}

function writeFilters(next: FilterState): URLSearchParams {
  const params = new URLSearchParams();
  for (const key of ARRAY_KEYS) {
    const list = next[key];
    if (list.length > 0) params.set(key, list.join(','));
  }
  if (next.priceMin !== undefined) params.set('priceMin', String(next.priceMin));
  if (next.priceMax !== undefined) params.set('priceMax', String(next.priceMax));
  if (next.customSize) params.set('customSize', 'true');
  if (next.sort !== 'featured') params.set('sort', next.sort);
  if (next.page > 1) params.set('page', String(next.page));
  return params;
}

/** The subset of state the API actually needs. */
export function toQuery(filters: FilterState, pageSize: number): ProductQuery {
  const q: ProductQuery = { sort: filters.sort, page: filters.page, pageSize };
  if (filters.categories.length) q.categories = filters.categories;
  if (filters.fabricCategories.length) q.fabricCategories = filters.fabricCategories;
  if (filters.fabrics.length) q.fabrics = filters.fabrics;
  if (filters.priceMin !== undefined) q.priceMin = filters.priceMin;
  if (filters.priceMax !== undefined) q.priceMax = filters.priceMax;
  if (filters.customSize) q.customSize = true;
  return q;
}

export function countActive(f: FilterState): number {
  return (
    f.categories.length +
    f.fabricCategories.length +
    f.fabrics.length +
    (f.priceMin !== undefined || f.priceMax !== undefined ? 1 : 0) +
    (f.customSize ? 1 : 0)
  );
}

export interface UseProductFilters {
  filters: FilterState;
  activeCount: number;
  /** Replace the whole state. Any filter change resets to page 1. */
  set: (next: Partial<FilterState>, opts?: { replace?: boolean }) => void;
  /** Add or remove one value from a multi-select dimension. */
  toggle: (key: (typeof ARRAY_KEYS)[number], value: string) => void;
  clearAll: () => void;
}

export function useProductFilters(): UseProductFilters {
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => parseFilters(params), [params]);

  const set = useCallback<UseProductFilters['set']>(
    (next, opts) => {
      const merged: FilterState = { ...parseFilters(params), ...next };
      // Any change to a filter invalidates the current page.
      if (!('page' in next)) merged.page = 1;
      setParams(writeFilters(merged), { replace: opts?.replace ?? false });
    },
    [params, setParams],
  );

  const toggle = useCallback<UseProductFilters['toggle']>(
    (key, value) => {
      const current = parseFilters(params)[key] as string[];
      const nextList = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      set({ [key]: nextList } as Partial<FilterState>);
    },
    [params, set],
  );

  const clearAll = useCallback(() => {
    // Sort is a view preference, not a filter — clearing filters keeps it.
    const sort = parseFilters(params).sort;
    setParams(writeFilters({ ...EMPTY, sort }), { replace: false });
  }, [params, setParams]);

  return {
    filters,
    activeCount: countActive(filters),
    set,
    toggle,
    clearAll,
  };
}

const EMPTY: FilterState = {
  categories: [],
  fabricCategories: [],
  fabrics: [],
  customSize: false,
  sort: 'featured',
  page: 1,
};
