import { useCallback, useEffect, useState } from 'react';
import { studentStore } from '../mocks/student/store.js';

// Mock reads resolve after a short delay so loading states behave like a real API.
const MOCK_LATENCY_MS = 300;

/**
 * Runs a synchronous student-data selector and returns
 * `{ status, data, error, reload }`. Recomputes silently whenever the student
 * store changes (e.g. a notification is marked as read).
 */
export function useStudentData(selector, deps = []) {
  const [state, setState] = useState({ status: 'loading', data: undefined, error: null });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const compute = () => {
      if (cancelled) return;
      try {
        setState({ status: 'ready', data: selector(), error: null });
      } catch (error) {
        setState({ status: 'error', data: undefined, error });
      }
    };

    setState((current) => ({ ...current, status: 'loading', data: undefined }));
    const timer = setTimeout(compute, MOCK_LATENCY_MS);
    const unsubscribe = studentStore.subscribe(compute);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      unsubscribe();
    };
    // The selector is recreated every render; `deps` decides when it changes meaningfully.
  }, [reloadKey, ...deps]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  return { ...state, reload };
}
