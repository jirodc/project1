import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '../utils/errors.js';

/**
 * Loads data from the API and returns `{ status, data, error, reload }`.
 * On refetch the previous data stays on screen (no loading flash); `error`
 * carries a user-friendly message and the HTTP `status`.
 */
export function useApiQuery(fetcher, deps = []) {
  const [state, setState] = useState({ status: 'loading', data: undefined, error: null });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState((current) => ({ ...current, status: 'loading' }));

    fetcher().then(
      (data) => {
        if (!cancelled) setState({ status: 'ready', data, error: null });
      },
      (error) => {
        if (cancelled) return;
        const friendly = Object.assign(new Error(getErrorMessage(error)), { status: error.response?.status });
        setState({ status: 'error', data: undefined, error: friendly });
      },
    );

    return () => {
      cancelled = true;
    };
    // `deps` decides when the fetcher changes meaningfully.
  }, [reloadKey, ...deps]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  return { ...state, reload };
}
