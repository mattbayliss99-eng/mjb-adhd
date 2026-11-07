import { createFileRoute } from "@tanstack/react-router";
import { ReadingPackPanel } from "@/components/reading-pack";
import { ToolsPanel } from "@/components/tools-panel";

export const Route = createFileRoute("/tools")({ component: ToolsPage });

function ToolsPage() {
  return (
    <div className="flex flex-col gap-6 px-4 py-4">
      <ReadingPackPanel />
      <div className="no-print">
        <ToolsPanel />
      </div>
    </div>
  );
}
