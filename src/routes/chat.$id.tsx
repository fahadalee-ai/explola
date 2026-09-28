import { createFileRoute } from "@tanstack/react-router";
import { ChatScreen } from "@/screens/Inbox";

export const Route = createFileRoute("/chat/$id")({
  component: ChatRoute,
});

function ChatRoute() {
  const { id } = Route.useParams();
  return <ChatScreen id={id} />;
}
