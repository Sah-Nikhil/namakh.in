"use client";

import { useEffect, useState } from "react";

/**
 * Media query as state. Starts false on the server and on first paint, then
 * settles after mount — so anything that changes layout wholesale should also
 * check `ready` rather than flashing the wrong variant.
 */
export function useMediaQuery(query: string): { matches: boolean; ready: boolean } {
  const [state, setState] = useState({ matches: false, ready: false });

  useEffect(() => {
    const mql = window.matchMedia(query);
    setState({ matches: mql.matches, ready: true });
    const onChange = (e: MediaQueryListEvent) => setState({ matches: e.matches, ready: true });
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return state;
}

/** Tailwind's md breakpoint, the line this site splits desktop from mobile on. */
export function useIsDesktop() {
  return useMediaQuery("(min-width: 768px)");
}
