/**
 * Clamps long post text after the page has mounted.
 * The server sends the full text, so it is still there without JavaScript.
 */
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function ShowMore({ children, lines = 4, id }: { children: ReactNode; lines?: number; id: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [overflows, setOverflows] = useState(false);

  useIsoLayoutEffect(() => {
    setMounted(true);
  }, []);

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el || !mounted) return;
    const check = () => {
      if (open) return;
      setOverflows(el.scrollHeight - el.clientHeight > 2);
    };
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [children, mounted, open]);

  const clamp = mounted && !open;

  return (
    <div>
      <div
        id={id}
        ref={ref}
        style={clamp ? { display: "-webkit-box", WebkitLineClamp: lines, WebkitBoxOrient: "vertical", overflow: "hidden" } : undefined}
      >
        {children}
      </div>
      {mounted && (overflows || open) ? (
        <button
          type="button"
          className="mt-1 min-h-11 border-0 bg-transparent p-0 font-semibold text-gold-2 hover:underline"
          aria-expanded={open}
          aria-controls={id}
          onClick={(event) => {
            event.stopPropagation();
            setOpen(!open);
          }}
        >
          {open ? "Show less" : "Show more"}
        </button>
      ) : null}
    </div>
  );
}
