/**
 * Arrow keys move between posts or cards only while focus is inside the
 * reader. They do nothing from the rest of the page, and they do nothing
 * when the page itself can scroll sideways.
 */
import { useEffect, useRef } from "react";

const SKIP = "input,select,textarea,summary,[contenteditable=true],[role=slider],[role=tab],[role=listbox],[role=menu]";

function pageScrollsSideways(): boolean {
  return document.documentElement.scrollWidth > window.innerWidth + 1;
}

export function useReaderKeys<T extends HTMLElement>(
  handlers: { onNext?: () => void; onPrev?: () => void; onExit?: () => void },
  opts: { autoFocus?: boolean; focusKey?: unknown } = {},
) {
  const ref = useRef<T>(null);
  const latest = useRef(handlers);
  latest.current = handlers;

  useEffect(() => {
    if (!opts.autoFocus) return;
    const el = ref.current;
    if (!el) return;
    if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
    el.focus({ preventScroll: true });
  }, [opts.autoFocus, opts.focusKey]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      const surface = ref.current;
      const active = document.activeElement;
      if (!surface || !active || !surface.contains(active)) return;
      if (active !== surface && active.closest(SKIP)) return;
      const { onNext, onPrev, onExit } = latest.current;
      if (event.key === "Escape" && onExit) {
        onExit();
        return;
      }
      if (pageScrollsSideways()) return;
      if (event.key === "ArrowRight" && onNext) {
        event.preventDefault();
        onNext();
      } else if (event.key === "ArrowLeft" && onPrev) {
        event.preventDefault();
        onPrev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return ref;
}
