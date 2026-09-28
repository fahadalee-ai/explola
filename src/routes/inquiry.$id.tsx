import { createFileRoute } from "@tanstack/react-router";
import { InquiryDetailScreen } from "@/screens/Inbox";

export const Route = createFileRoute("/inquiry/$id")({
  component: InquiryRoute,
});

function InquiryRoute() {
  const { id } = Route.useParams();
  return <InquiryDetailScreen id={id} />;
}
