/**
 * Guarded horizontal swipe. Replaces the inline onPointerDown/onPointerUp
 * handlers in PostDetail and CardStage, which accepted swipes that began on
 * buttons, links, text selections or horizontally scrollable shelves.
 *
 * Usage:
 *   const swipe = useSwipe({ enabled: prefs.swipe, onNext, onPrev });
 *   <article {...swipe}>…</article>
 */
import { useRef, type PointerEvent } from "react";

const INTERACTIVE = "a,button,input,select,textarea,label,summary,[role=button],[role=slider],[contenteditable=true]";

function inHorizontalScroller(el: Element | null, stop: Element): boolean {
  for (let node = el; node && node !== stop; node = node.parentElement) {
    const style = getComputedStyle(node);
    if (/(auto|scroll)/.test(style.overflowX) && node.scrollWidth > node.clientWidth) return true;
  }
  return false;
}

export type SwipeOptions = {
  enabled: boolean;
  onNext: () => void;
  onPrev: () => void;
  /** Minimum horizontal travel in CSS px. */
  threshold?: number;
  /** Horizontal travel must exceed vertical by this ratio. */
  ratio?: number;
};

export function useSwipe({ enabled, onNext, onPrev, threshold = 64, ratio = 1.4 }: SwipeOptions) {
  const start = useRef<{ x: number; y: number; id: number } | null>(null);
  const active = useRef(0);

  const reset = () => {
    start.current = null;
  };

  return {
    onPointerDown(event: PointerEvent<HTMLElement>) {
      if (event.pointerType !== "touch") return;
      active.current += 1;
      if (!enabled || active.current > 1) return reset(); // multi-touch = pinch zoom
      const target = event.target as Element;
      if (target.closest(INTERACTIVE)) return reset();
      if (inHorizontalScroller(target, event.currentTarget)) return reset();
      start.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
    },
    onPointerUp(event: PointerEvent<HTMLElement>) {
      if (event.pointerType === "touch") active.current = Math.max(0, active.current - 1);
      const s = start.current;
      reset();
      if (!s || s.id !== event.pointerId) return;
      if (window.getSelection()?.toString()) return; // user was selecting text
      const dx = event.clientX - s.x;
      const dy = event.clientY - s.y;
      if (Math.abs(dx) < threshold || Math.abs(dx) < Math.abs(dy) * ratio) return;
      // Ignore edge swipes: iOS/Android use them for system Back.
      if (s.x < 24 || s.x > window.innerWidth - 24) return;
      if (dx < 0) onNext();
      else onPrev();
    },
    onPointerCancel() {
      active.current = 0;
      reset();
    },
  };
}
