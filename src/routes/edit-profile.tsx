import { createFileRoute } from "@tanstack/react-router";
import { EditProfileScreen } from "@/screens/ProfileScreens";

export const Route = createFileRoute("/edit-profile")({
  component: EditProfileScreen,
});
