import { useEffect, useState } from 'react';
import { cleanParams } from '../services/api.js';
import { useApiQuery } from './useApiQuery.js';

function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

/**
 * State for a searchable, filterable, paginated API list. Changing the search
 * or a filter goes back to page 1; typing is debounced.
 */
export function useListQuery(fetchList, { filters: initialFilters = {}, pageSize = 20 } = {}) {
  const [page, setPage] = useState(1);
  const [search, setSearchValue] = useState('');
  const [filters, setFilters] = useState(initialFilters);
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const query = useApiQuery(
    () => fetchList(cleanParams({ page, limit: pageSize, search: debouncedSearch, ...filters })),
    [page, pageSize, debouncedSearch, JSON.stringify(filters)],
  );

  return {
    query,
    page,
    setPage,
    search,
    setSearch: (value) => {
      setSearchValue(value);
      setPage(1);
    },
    filters,
    setFilter: (key, value) => {
      setFilters((current) => ({ ...current, [key]: value }));
      setPage(1);
    },
    hasFilters: Boolean(search.trim()) || Object.entries(filters).some(([key, value]) => value && value !== initialFilters[key]),
  };
}
