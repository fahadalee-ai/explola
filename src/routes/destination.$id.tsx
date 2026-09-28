import { createFileRoute } from "@tanstack/react-router";
import { DestinationScreen } from "@/screens/Place";

export const Route = createFileRoute("/destination/$id")({
  component: DestinationRoute,
});

function DestinationRoute() {
  const { id } = Route.useParams();
  return <DestinationScreen id={id} />;
}
