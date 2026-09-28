import { createFileRoute } from "@tanstack/react-router";
import { OperatorInquiryDetail } from "@/screens/OperatorApp";

export const Route = createFileRoute("/operator/inquiry/$id")({
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  return <OperatorInquiryDetail id={id} />;
}
