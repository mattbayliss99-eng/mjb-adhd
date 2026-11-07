import { Link, useRouterState } from "@tanstack/react-router";
import * as Dialog from "@radix-ui/react-dialog";
import { Bookmark, BookOpen, Compass, Home, Menu, PanelLeft, Search, Wrench, X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AlarmWatch } from "@/components/alarm-watch";
import { FOLLOW, NAV_GROUPS, type AppTo } from "@/config/nav";
import { DONE_PRAISE } from "@/data/roasts";
import { DIRECTORY, GROUP_LABELS, GROUP_ORDER } from "@/data/reader-bank";
import { isCataloguePage } from "@/data/imported";
import { articleByPath } from "@/data/imported";
import { useChromeHidden } from "@/hooks/use-chrome";
import { unlockAudio } from "@/lib/audio";
import { snooze } from "@/lib/alarm-engine";
import { clearHomeReturn } from "@/lib/place";
import { SessionProvider, usePrefs, usePrivate } from "@/lib/session";

function DueBanner() {
  const alarms = usePrivate((state) => state.alarms);
  const patchAlarm = usePrivate((state) => state.patchAlarm);
  const [praise, setPraise] = useState<string | null>(null);
  const due = alarms.filter((alarm) => alarm.status === "due");
  useEffect(() => {
    if (!praise) return;
    const timer = window.setTimeout(() => setPraise(null), 4000);
    return () => window.clearTimeout(timer);
  }, [praise]);
  if (due.length === 0 && !praise) return null;
  return (
    <div className="border-b border-line bg-surface-2 px-4 py-3" role={due.length ? "alert" : "status"}>
      {praise ? <p className="m-0 font-serif text-2xl text-ink">{praise}</p> : null}
      {due.map((alarm) => (
        <div key={alarm.id} className="mb-3 last:mb-0">
          <p className="kicker m-0">{alarm.late ? "Late — this tab was asleep" : "Reminder"}</p>
          <p className="m-0 font-serif text-2xl text-ink">{alarm.roast || alarm.label}</p>
          <p className="mt-1 text-sm text-muted">{alarm.label}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              className="btn"
              onClick={() =>
                patchAlarm(alarm.id, {
                  ...snooze(alarm, Date.now()),
                  status: "snoozed",
                  snoozes: alarm.snoozes + 1,
                  roast: undefined,
                })
              }
            >
              Snooze 5 minutes
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                const line = DONE_PRAISE[alarm.snoozes % DONE_PRAISE.length];
                setPraise(line);
                patchAlarm(alarm.id, {
                  status: "scheduled",
                  roast: undefined,
                  late: false,
                  snoozeUntil: null,
                  snoozes: 0,
                });
              }}
            >
              Done it
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function RailLink({ to, label, icon: Icon }: { to: AppTo; label: string; icon: typeof Search }) {
  return (
    <Link
      to={to}
      className="nav-link"
      activeOptions={{ exact: to === "/" }}
      activeProps={{ "aria-current": "page" }}
      aria-label={label}
      onClick={() => {
        if (to === "/") clearHomeReturn();
      }}
    >
      <Icon aria-hidden="true" size={22} />
      <span>{label}</span>
    </Link>
  );
}

function Chrome({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const navAlways = usePrefs((state) => state.navAlways);
  const rail = usePrefs((state) => state.rail);
  const setRail = usePrefs((state) => state.setRail);
  const [drawer, setDrawer] = useState(false);
  const [field, setField] = useState(false);
  const menuRef = useRef<HTMLButtonElement>(null);
  const chrome = useChromeHidden(drawer || field, navAlways);
  const shellTitle: Record<string, string> = {
    "/": "Home",
    "/explore": "Explore",
    "/saved": "Saved",
    "/tools": "Tools",
    "/help": "Help with care",
    "/myths": "Bad assumptions",
    "/contact": "Follow & contact",
    "/settings": "Accessibility",
    "/decks": "Decks",
    "/article": "Article",
    "/questionnaire-demo": "Questionnaire",
    "/questionnaires": "Self-profiles",
    "/proposals": "Proposed explanations",
  };
  const article = shellTitle[path] ? undefined : articleByPath(path);
  const title = path.startsWith("/post/")
    ? "Reading"
    : path.startsWith("/deck/")
      ? "Deck"
      : path.startsWith("/questionnaires/")
        ? "Self-profile"
        : shellTitle[path] || article?.title || "MJB ADHD";
  const reading = path.startsWith("/post/") || Boolean(article);

  useEffect(() => {
    const onFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (target instanceof HTMLElement && target.matches("input, textarea, select")) setField(true);
    };
    const onFocusOut = () => {
      window.setTimeout(() => {
        const target = document.activeElement;
        setField(target instanceof HTMLElement && target.matches("input, textarea, select"));
      }, 0);
    };
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  const groups = (
    <>
      <p className="group-label">Main</p>
      {NAV_GROUPS.main.map((item) => (
        <RailLink key={item.to} to={item.to} label={item.label} icon={item.icon} />
      ))}
      <p className="group-label">Menu</p>
      {NAV_GROUPS.menu.map((item) => (
        <RailLink key={item.to} to={item.to} label={item.label} icon={item.icon} />
      ))}
      <a className="nav-link" href="/sources/method/" aria-label="Sources">
        <BookOpen aria-hidden="true" size={22} />
        <span>Sources</span>
      </a>
    </>
  );

  return (
    <div className="app" data-chrome={chrome.hidden ? "hidden" : "shown"} data-rail={rail} data-reading={reading ? "1" : "0"} onPointerDown={() => unlockAudio()}>
      <a className="btn btn-primary absolute left-3 top-3 z-50 -translate-y-[200%] focus:translate-y-0" href="#main">
        Skip to content
      </a>
      {chrome.hidden ? (
        <button type="button" className="chrome-reveal" onClick={() => chrome.show()}>
          Show navigation
        </button>
      ) : null}
      <aside className="rail" aria-label="Sidebar">
        <Link to="/" className="rail-brand mb-2 flex items-center gap-2 px-3 py-2 text-inherit no-underline" aria-label="MJB, home" onClick={() => clearHomeReturn()}>
          <img src="/media/mjb-emblem.jpg" alt="" width={36} height={36} className="h-9 w-9 rounded-full object-cover" />
          <span className="brand-name font-serif text-xl text-ink">MJB</span>
        </Link>
        <nav className="rail-scroll flex flex-col gap-1" aria-label="Primary">
          {groups}
        </nav>
        <div className="rail-modes">
          <p className="group-label">Sidebar</p>
          <button type="button" className="btn" aria-pressed={rail === "expanded"} onClick={() => setRail("expanded")}>
            <PanelLeft aria-hidden="true" size={16} /> Expanded
          </button>
          <button type="button" className="btn" aria-pressed={rail === "compact"} onClick={() => setRail("compact")}>
            Compact
          </button>
          <button type="button" className="btn" aria-pressed={rail === "closed"} onClick={() => setRail("closed")}>
            Hide
          </button>
        </div>
      </aside>
      <div className="column">
        <header className="topbar" inert={chrome.hidden ? true : undefined}>
          <Dialog.Root open={drawer} onOpenChange={setDrawer}>
            <Dialog.Trigger ref={menuRef} className="menu-open" aria-label="Menu">
              <Menu aria-hidden="true" size={18} />
              <span>Menu</span>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-40 bg-canvas/70" />
              <Dialog.Content className="fixed inset-y-0 left-0 z-50 w-[min(100%,20rem)] overflow-y-auto border-r border-line bg-canvas p-3">
                <Dialog.Title className="mb-3 font-serif text-xl text-ink">MJB ADHD</Dialog.Title>
                <nav
                  className="flex flex-col gap-1"
                  aria-label="Menu"
                  onClick={(event) => {
                    const target = event.target;
                    if (target instanceof Element && target.closest("a")) {
                      setDrawer(false);
                      menuRef.current?.focus();
                    }
                  }}
                >
                  {groups}
                </nav>
                <Dialog.Close className="btn mt-4">
                  <X aria-hidden="true" size={16} /> Close
                </Dialog.Close>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
          {rail === "closed" ? (
            <button type="button" className="btn rail-reveal" onClick={() => setRail("expanded")}>
              Show sidebar
            </button>
          ) : null}
          <p className="m-0 min-w-0 truncate font-serif text-xl text-ink">{title}</p>
          <Link to="/explore" search={{ topic: "", q: "" }} className="btn btn-quiet ml-auto" aria-label="Search">
            <Search aria-hidden="true" size={18} />
          </Link>
        </header>
        <DueBanner />
        <main id="main">{children}</main>
      </div>
      <aside className="side" aria-label="Discover">
        <form action="/explore" className="mb-4">
          <label className="field">
            <span className="sr-only">Search</span>
            <input className="input" name="q" placeholder="Search MJB" />
          </label>
        </form>
        <section className="card mb-4">
          <h2 className="m-0 text-xl">Explore</h2>
          <ul className="m-0 mt-2 list-none p-0">
            {GROUP_ORDER.map((id) => {
              const count = DIRECTORY.filter((page) => page.group === id && isCataloguePage(page.path)).length;
              return (
                <li key={id}>
                  <Link to="/explore" search={{ topic: id, q: "" }} className="flex items-baseline justify-between gap-3 py-2 text-ink no-underline">
                    <span>{GROUP_LABELS[id]}</span>
                    <span className="text-sm text-muted">{count}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
        <section className="card mb-4">
          <h2 className="m-0 text-xl">Follow MJB</h2>
          <ul className="m-0 mt-2 list-none p-0">
            {FOLLOW.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="block py-1">
                  {item.label} · {item.handle}
                </a>
              </li>
            ))}
          </ul>
        </section>
        <section className="card">
          <h2 className="m-0 text-lg">Need help now?</h2>
          <p className="mb-0 text-sm">
            Danger: <a href="tel:999">999</a>. Urgent: <a href="tel:111">NHS 111</a>. Samaritans:{" "}
            <a href="tel:116123">116 123</a>. MJB does not monitor urgent messages.
          </p>
        </section>
      </aside>
      <nav className="bottom" aria-label="Primary" inert={chrome.hidden ? true : undefined}>
        <button type="button" onClick={() => setDrawer(true)}>
          <Menu aria-hidden="true" size={18} />
          Menu
        </button>
        <Link to="/explore" search={{ topic: "", q: "" }} activeOptions={{ exact: false }} activeProps={{ "aria-current": "page" }}>
          <Compass aria-hidden="true" size={18} />
          Explore
        </Link>
        <Link to="/" activeOptions={{ exact: true }} activeProps={{ "aria-current": "page" }} onClick={() => clearHomeReturn()}>
          <Home aria-hidden="true" size={18} />
          Home
        </Link>
        <Link to="/saved" activeProps={{ "aria-current": "page" }}>
          <Bookmark aria-hidden="true" size={18} />
          Saved
        </Link>
        <Link to="/tools" activeProps={{ "aria-current": "page" }}>
          <Wrench aria-hidden="true" size={18} />
          Tools
        </Link>
      </nav>
      <AlarmWatch />
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <Chrome>{children}</Chrome>
    </SessionProvider>
  );
}
