import { WorkflowVisualizer } from "./workflow-visualizer";
import { ChatInterface } from "./chat-interface";
import { SuggestionPanel } from "./suggestion-panel";
import { ProblemPanel } from "./problem-panel";
import { FineTuningPanel } from "./fine-tuning-panel";

export function AzrDashboard() {
  return (
    <section className="grid gap-4">
      <WorkflowVisualizer />
      <div className="grid gap-4 lg:grid-cols-2">
        <ChatInterface />
        <SuggestionPanel />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <ProblemPanel />
        <FineTuningPanel />
      </div>
    </section>
  );
}
