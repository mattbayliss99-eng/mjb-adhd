/** Session-only reading position. Not a "read" mark, and not synced. */

const SLIDES = "mjb-slide-place";
const RETURN = "mjb-return";
const SAMPLES = "mjb-show-samples";

export type ReturnPlace = {
  path: string;
  search: string;
  y: number;
  focus: string;
};

function readJson(): Record<string, number> {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(SLIDES) || "{}") as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as Record<string, number>;
  } catch {
    return {};
  }
}

export function readSlide(id: string, count: number): number {
  const stored = readStoredSlide(id, count);
  return stored ?? 0;
}

/** Null means this explanation has no stored step. Zero is the first step. */
export function readStoredSlide(id: string, count: number): number | null {
  const value = readJson()[id];
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return Math.min(Math.max(count, 1) - 1, Math.max(0, Math.floor(value)));
}

export function slideSearch(id: string): { slide: number } | Record<string, never> {
  const stored = readStoredSlide(id, 99);
  return stored === null ? {} : { slide: stored + 1 };
}

export function writeSlide(id: string, index: number) {
  try {
    const all = readJson();
    all[id] = index;
    sessionStorage.setItem(SLIDES, JSON.stringify(all));
  } catch {
    /* storage unavailable: the story still works, it just will not resume */
  }
}

export function readSamplesOpen(): boolean {
  try {
    return sessionStorage.getItem(SAMPLES) === "1";
  } catch {
    return false;
  }
}

export function writeSamplesOpen(open: boolean) {
  try {
    sessionStorage.setItem(SAMPLES, open ? "1" : "0");
  } catch {
    /* ignore */
  }
}

/** Remember where a post was opened from, including the control to focus on return. */
export function armReturn(focusId: string) {
  try {
    const place: ReturnPlace = {
      path: window.location.pathname,
      search: window.location.search,
      y: window.scrollY,
      focus: focusId,
    };
    sessionStorage.setItem(RETURN, JSON.stringify(place));
  } catch {
    /* the link still opens */
  }
}

export function takeReturn(pathname: string): ReturnPlace | null {
  try {
    const raw = sessionStorage.getItem(RETURN);
    if (!raw) return null;
    const place = JSON.parse(raw) as ReturnPlace;
    if (!place || place.path !== pathname) return null;
    sessionStorage.removeItem(RETURN);
    return place;
  } catch {
    return null;
  }
}

export function clearReturn() {
  try {
    sessionStorage.removeItem(RETURN);
  } catch {
    /* ignore */
  }
}

/** Older Home helpers. Home now uses armReturn / takeReturn. */
export function armHomeReturn() {
  armReturn("");
}

export function consumeHomeReturn(): boolean {
  return takeReturn("/") !== null;
}

export function clearHomeReturn() {
  clearReturn();
}

export function readFeedY(): number {
  const place = (() => {
    try {
      const raw = sessionStorage.getItem(RETURN);
      return raw ? (JSON.parse(raw) as ReturnPlace) : null;
    } catch {
      return null;
    }
  })();
  return place && place.y > 0 ? place.y : 0;
}

export function writeFeedY(y: number) {
  try {
    const raw = sessionStorage.getItem(RETURN);
    const place = raw ? (JSON.parse(raw) as ReturnPlace) : null;
    if (!place) return;
    place.y = Math.max(0, Math.floor(y));
    sessionStorage.setItem(RETURN, JSON.stringify(place));
  } catch {
    /* ignore */
  }
}
