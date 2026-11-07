import { createFileRoute } from "@tanstack/react-router";
import { SelfProfileRunner } from "@/components/self-profile";

export const Route = createFileRoute("/questionnaires/$id")({
  component: QuestionnaireProfile,
});

function QuestionnaireProfile() {
  const { id } = Route.useParams();
  return <SelfProfileRunner profileId={id} />;
}
