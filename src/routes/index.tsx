import { createFileRoute } from "@tanstack/react-router";
import { HomeFeed, type HomeTab } from "@/components/reader";

const TABS: HomeTab[] = ["latest", "science", "help"];

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): { tab?: HomeTab } =>
    TABS.includes(search.tab as HomeTab) && search.tab !== "latest" ? { tab: search.tab as HomeTab } : {},
  component: Home,
});

function Home() {
  const { tab } = Route.useSearch();
  return <HomeFeed tab={tab ?? "latest"} />;
}
