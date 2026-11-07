/**
 * Single source of truth for navigation (X-style).
 * Fixes: Grok build defined NAV once but hard-coded the dock separately in
 * app-shell.tsx, and had no Help / Myths / Contact destinations.
 *
 * - `dock: true` items appear in the mobile bottom bar (max 5, like X).
 * - Everything appears in the desktop left rail and the mobile drawer
 *   (opened by tapping the avatar, top-left — the X pattern).
 */
import {
  Bookmark,
  Compass,
  GalleryHorizontal,
  HeartHandshake,
  Home,
  Mail,
  OctagonX,
  SlidersHorizontal,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { linksFor } from "@/config/links";

export type AppTo =
  | "/"
  | "/explore"
  | "/decks"
  | "/tools"
  | "/saved"
  | "/help"
  | "/myths"
  | "/contact"
  | "/settings";

export type NavItem = {
  to: AppTo;
  label: string;
  icon: LucideIcon;
  dock?: boolean;
  group: "main" | "menu";
};

export const NAV: readonly NavItem[] = [
  { to: "/", label: "Home", icon: Home, dock: true, group: "main" },
  { to: "/explore", label: "Explore", icon: Compass, dock: true, group: "main" },
  { to: "/saved", label: "Saved", icon: Bookmark, dock: true, group: "main" },
  { to: "/tools", label: "Tools", icon: Wrench, dock: true, group: "main" },
  { to: "/decks", label: "Decks", icon: GalleryHorizontal, group: "menu" },
  { to: "/help", label: "Help", icon: HeartHandshake, group: "menu" },
  { to: "/myths", label: "Bad assumptions", icon: OctagonX, group: "menu" },
  { to: "/contact", label: "Follow & contact", icon: Mail, group: "menu" },
  { to: "/settings", label: "Accessibility", icon: SlidersHorizontal, group: "menu" },
] as const;

export const DOCK = NAV.filter((item) => item.dock);
export const NAV_GROUPS = {
  main: NAV.filter((item) => item.group === "main"),
  menu: NAV.filter((item) => item.group === "menu"),
};

/** Official accounts for the side rail. Personal and “add later” rows live on Follow & contact. */
export const FOLLOW = linksFor("main").map((item) => ({
  label: item.label,
  handle: item.handle,
  href: item.href as string,
}));
