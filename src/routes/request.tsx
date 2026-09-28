import { createFileRoute } from "@tanstack/react-router";
import { RequestScreen } from "@/screens/Request";

export const Route = createFileRoute("/request")({
  validateSearch: (search: Record<string, unknown>): { tour?: string; destination?: string; operator?: string } => ({
    tour: typeof search.tour === "string" ? search.tour : undefined,
    destination: typeof search.destination === "string" ? search.destination : undefined,
    operator: typeof search.operator === "string" ? search.operator : undefined,
  }),
  component: RequestRoute,
});

function RequestRoute() {
  const search = Route.useSearch();
  return <RequestScreen tourId={search.tour} destinationId={search.destination} operatorId={search.operator} />;
}
