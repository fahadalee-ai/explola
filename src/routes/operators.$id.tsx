import { createFileRoute } from "@tanstack/react-router";
import { OperatorProfileScreen } from "@/screens/Place";

export const Route = createFileRoute("/operators/$id")({
  component: OperatorRoute,
});

function OperatorRoute() {
  const { id } = Route.useParams();
  return <OperatorProfileScreen id={id} />;
}
