import { createFileRoute } from "@tanstack/react-router";
import { TourDetailScreen } from "@/screens/TourDetail";

export const Route = createFileRoute("/tour/$id")({
  component: TourRoute,
});

function TourRoute() {
  const { id } = Route.useParams();
  return <TourDetailScreen id={id} />;
}
