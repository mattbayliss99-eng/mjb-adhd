import { useEffect, useState } from "react";

/** Hide site bars after a deliberate downward scroll. Does not touch the desktop rail. */
export function useChromeHidden(paused: boolean, always: boolean): { hidden: boolean; show: () => void } {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (always || paused) setHidden(false);
  }, [always, paused]);

  useEffect(() => {
    let last = window.scrollY;
    let down = 0;
    let up = 0;
    const onScroll = () => {
      if (always || paused) return;
      const y = window.scrollY;
      const dy = y - last;
      last = y;
      if (Math.abs(dy) < 3) return;
      if (y <= 8) {
        down = 0;
        up = 0;
        setHidden(false);
        return;
      }
      if (dy > 0) {
        up = 0;
        down += dy;
        if (down < 48) return;
        const active = document.activeElement;
        if (active instanceof Element && active.closest(".topbar, .bottom, .rail")) return;
        if (active instanceof HTMLElement && active.matches("input, textarea, select")) return;
        setHidden(true);
        down = 0;
        return;
      }
      down = 0;
      up += -dy;
      if (up >= 16) {
        setHidden(false);
        up = 0;
      }
    };
    const onFocus = (event: FocusEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest(".topbar, .bottom")) setHidden(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("focusin", onFocus);
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("focusin", onFocus);
    };
  }, [always, paused]);

  return { hidden: always || paused ? false : hidden, show: () => setHidden(false) };
}
