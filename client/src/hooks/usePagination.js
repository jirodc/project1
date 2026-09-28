import { useMemo, useState } from 'react';

/** Client-side pagination; the page is clamped when the list shrinks (e.g. after filtering). */
export function usePagination(items, pageSize) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const pageItems = useMemo(
    () => items.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [items, currentPage, pageSize],
  );

  return {
    pageItems,
    setPage,
    pagination: { page: currentPage, limit: pageSize, total: items.length, totalPages },
  };
}
