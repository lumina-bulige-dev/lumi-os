
"use client"

import { useState, useCallback } from "react"
import { WorkflowVisualizer } from "./workflow-visualizer"
import { ChatInterface } from "./chat-interface"
import { ProblemPanel } from "./problem-panel"
import { FineTuningPanel } from "./fine-tuning-panel"
import { SuggestionPanel, type Suggestion } from "./suggestion-panel"
import { Bot, Sparkles } from "lucide-react"

export function Dashboard() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isLearning, setIsLearning] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])

  const handleAddSuggestion = useCallback((suggestion: Omit<Suggestion, "id" | "timestamp" | "status">) => {
    setSuggestions((prev) => [
      ...prev,
      {
        ...suggestion,
        id: Date.now().toString(),
        timestamp: new Date(),
        status: "pending",
      },
    ])
  }, [])

  const handleAcceptSuggestion = useCallback((id: string) => {
    setSuggestions((prev) => prev.map((s) => (s.id === id ? { ...s, status: "accepted" as const } : s)))
  }, [])

  const handleRejectSuggestion = useCallback((id: string) => {
    setSuggestions((prev) => prev.map((s) => (s.id === id ? { ...s, status: "rejected" as const } : s)))
  }, [])

  const handleDeferSuggestion = useCallback((id: string) => {
    setSuggestions((prev) => prev.map((s) => (s.id === id ? { ...s, status: "deferred" as const } : s)))
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">LumiBot0</h1>
              <p className="text-xs text-muted-foreground">Absolute Zero Reasoner</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-500" />
            <span className="text-sm text-muted-foreground">{isLearning ? "Learning..." : "Ready"}</span>
          </div>
        </div>
      </header>

      {/* Main Content - Updated grid layout to accommodate suggestion panel */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Workflow Visualizer + Fine-tuning + Suggestions */}
          <div className="lg:col-span-3 space-y-6">
            <WorkflowVisualizer currentStep={currentStep} isLearning={isLearning} onStepChange={setCurrentStep} />
            <SuggestionPanel
              suggestions={suggestions}
              onAccept={handleAcceptSuggestion}
              onReject={handleRejectSuggestion}
              onDefer={handleDeferSuggestion}
            />
          </div>

          {/* Center: Chat Interface */}
          <div className="lg:col-span-5 h-[calc(100vh-120px)]">
            <ChatInterface
              onLearningStateChange={setIsLearning}
              onStepChange={setCurrentStep}
              onAddSuggestion={handleAddSuggestion}
            />
          </div>

          {/* Right: Problem Panel + Fine-tuning */}
          <div className="lg:col-span-4 space-y-6 h-[calc(100vh-120px)]">
            <div className="h-[60%]">
              <ProblemPanel currentStep={currentStep} isLearning={isLearning} />
            </div>
            <div className="h-[38%]">
              <FineTuningPanel isLearning={isLearning} onLearningStateChange={setIsLearning} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
