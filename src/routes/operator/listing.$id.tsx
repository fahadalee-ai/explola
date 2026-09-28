import { createFileRoute } from "@tanstack/react-router";
import { ListingEditor } from "@/screens/OperatorApp";

export const Route = createFileRoute("/operator/listing/$id")({
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  return <ListingEditor id={id} />;
}
