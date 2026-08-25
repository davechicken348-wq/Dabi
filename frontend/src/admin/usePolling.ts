import { useEffect, useRef } from "react";

/**
 * Calls `callback` on a fixed interval to keep data fresh in the background.
 * Polling pauses automatically whenever the tab is hidden and runs immediately
 * when the tab becomes visible again, so the admin always sees current data
 * without burning requests on an unfocused page.
 */
export function usePolling(
  callback: () => void | Promise<void>,
  intervalMs = 30000,
  enabled = true,
) {
  const cbRef = useRef(callback);
  cbRef.current = callback;

  useEffect(() => {
    if (!enabled) return;

    const run = () => {
      if (document.visibilityState === "visible") cbRef.current();
    };

    const id = window.setInterval(run, intervalMs);
    document.addEventListener("visibilitychange", run);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", run);
    };
  }, [intervalMs, enabled]);
}
