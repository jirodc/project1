import { useEffect, useState } from 'react';

/**
 * Tracks an element's rendered width so SVG charts can draw at real pixel
 * size. Returns a callback ref, so it keeps working if the element remounts.
 */
export function useElementWidth() {
  const [element, setElement] = useState(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!element) return undefined;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);

  return [setElement, width];
}
