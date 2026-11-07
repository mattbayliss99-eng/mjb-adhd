/**
 * One list for public links. Add a row here when a URL is ready.
 * Pending rows have no href and are not turned into buttons.
 * Do not invent an address, and do not point these at private folders.
 */
export type LinkStatus = "recorded" | "pending";
export type LinkPlace = "main" | "about" | "evidence" | "later";

export type SiteLink = {
  id: string;
  label: string;
  handle: string;
  href?: string;
  status: LinkStatus;
  place: LinkPlace;
  note?: string;
};

export const LINKS: readonly SiteLink[] = [
  {
    id: "website",
    label: "Website",
    handle: "mjb-adhd.org.uk",
    href: "https://mjb-adhd.org.uk/",
    status: "recorded",
    place: "main",
  },
  {
    id: "x-brand",
    label: "X",
    handle: "@MJB_ADHD",
    href: "https://x.com/MJB_ADHD",
    status: "recorded",
    place: "main",
    note: "On the public contact page.",
  },
  {
    id: "instagram",
    label: "Instagram",
    handle: "@mjb.adhd.advocacy",
    href: "https://www.instagram.com/mjb.adhd.advocacy",
    status: "recorded",
    place: "main",
    note: "On the public contact page.",
  },
  {
    id: "threads",
    label: "Threads",
    handle: "@mjb.adhd.advocacy",
    href: "https://www.threads.com/@mjb.adhd.advocacy",
    status: "recorded",
    place: "main",
    note: "On the public contact page.",
  },
  {
    id: "facebook",
    label: "Facebook",
    handle: "public page",
    href: "https://www.facebook.com/profile.php?id=61594521742233",
    status: "recorded",
    place: "main",
    note: "On the public contact page. A shorter permanent URL can replace this later.",
  },
  {
    id: "email-gmail",
    label: "Email",
    handle: "mjb.adhd.advocacy@gmail.com",
    href: "mailto:mjb.adhd.advocacy@gmail.com?subject=Message%20via%20the%20MJB%20preview",
    status: "recorded",
    place: "main",
    note: "General inbox on the public contact page.",
  },
  {
    id: "email-proton",
    label: "Email",
    handle: "mjb.adhd.advocacy@proton.me",
    href: "mailto:mjb.adhd.advocacy@proton.me",
    status: "recorded",
    place: "main",
    note: "Professional inbox on the public contact page.",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    handle: "mjb-adhd",
    href: "https://www.linkedin.com/in/mjb-adhd",
    status: "recorded",
    place: "main",
    note: "Owner-supplied public profile.",
  },
  {
    id: "youtube-channel",
    label: "YouTube",
    handle: "@N1TRO",
    href: "https://www.youtube.com/@N1TRO",
    status: "recorded",
    place: "main",
    note: "Owner-supplied public channel. Separate from the evidence playlist.",
  },
  {
    id: "youtube-playlist",
    label: "YouTube",
    handle: "Evidence playlist",
    href: "https://youtube.com/playlist?list=PLUn0dkqrcx6Sg1GK3qd8loMae8Unw5BJk",
    status: "recorded",
    place: "evidence",
    note: "A playlist, not a channel homepage.",
  },
  { id: "bluesky", label: "Bluesky", handle: "Not added yet", status: "pending", place: "later" },
  { id: "tiktok", label: "TikTok", handle: "Not added yet", status: "pending", place: "later" },
  { id: "reddit", label: "Reddit", handle: "Not added yet", status: "pending", place: "later" },
  { id: "substack", label: "Newsletter", handle: "Not added yet", status: "pending", place: "later" },
  { id: "mastodon", label: "Mastodon", handle: "Not added yet", status: "pending", place: "later" },
  { id: "discord", label: "Discord", handle: "Not added yet", status: "pending", place: "later" },
  { id: "podcast", label: "Podcast", handle: "Not added yet", status: "pending", place: "later" },
  { id: "spotify", label: "Spotify", handle: "Not added yet", status: "pending", place: "later" },
  { id: "youtube-music", label: "YouTube Music", handle: "Not added yet", status: "pending", place: "later" },
];

export function linksFor(place: LinkPlace): SiteLink[] {
  return LINKS.filter((item) => item.place === place && item.status === "recorded" && item.href);
}

export const LATER_LINKS = LINKS.filter((item) => item.status === "pending");
