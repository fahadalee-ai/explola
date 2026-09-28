import { createFileRoute } from "@tanstack/react-router";
import { SearchScreen } from "@/screens/SearchScreen";

const searchTabs = ["tours", "operators", "destinations"] as const;
export type SearchTab = (typeof searchTabs)[number];

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>): { q?: string; tab?: SearchTab } => ({
    q: typeof search.q === "string" ? search.q : undefined,
    tab: searchTabs.includes(search.tab as SearchTab) ? (search.tab as SearchTab) : undefined,
  }),
  component: SearchRoute,
});

function SearchRoute() {
  const { q, tab } = Route.useSearch();
  return <SearchScreen initialQuery={q ?? ""} initialTab={tab} />;
}
