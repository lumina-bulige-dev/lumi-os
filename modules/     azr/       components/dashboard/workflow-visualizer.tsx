"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Code, CheckCircle, RefreshCw, ArrowDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface WorkflowVisualizerProps {
  currentStep: number
  isLearning: boolean
  onStepChange: (step: number) => void
}

const steps = [
  {
    id: 0,
    title: "問題生成",
    description: "LLMが難しいが解決可能な問題を生成",
    icon: Brain,
    color: "from-purple-500 to-violet-600",
  },
  {
    id: 1,
    title: "問題解決",
    description: "同じモデルが問題を解く",
    icon: Code,
    color: "from-cyan-500 to-blue-600",
  },
  {
    id: 2,
    title: "検証",
    description: "コードを実行して正誤を確認",
    icon: CheckCircle,
    color: "from-green-500 to-emerald-600",
  },
  {
    id: 3,
    title: "自己改良",
    description: "フィードバックでモデルを強化",
    icon: RefreshCw,
    color: "from-orange-500 to-amber-600",
  },
]

export function WorkflowVisualizer({ currentStep, isLearning, onStepChange }: WorkflowVisualizerProps) {
  const [animatedStep, setAnimatedStep] = useState(currentStep)

  useEffect(() => {
    if (isLearning) {
      const interval = setInterval(() => {
        setAnimatedStep((prev) => (prev + 1) % 4)
        onStepChange((currentStep + 1) % 4)
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [isLearning, currentStep, onStepChange])

  useEffect(() => {
    setAnimatedStep(currentStep)
  }, [currentStep])

  return (
    <Card className="h-full bg-card/80 backdrop-blur border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
          AZR ワークフロー
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {steps.map((step, index) => {
          const Icon = step.icon
          const isActive = animatedStep === index
          const isPast = animatedStep > index

          return (
            <div key={step.id}>
              <button
                onClick={() => onStepChange(index)}
                className={cn(
                  "w-full p-3 rounded-lg border transition-all duration-300 text-left",
                  isActive
                    ? "border-cyan-500/50 bg-cyan-500/10 shadow-lg shadow-cyan-500/20"
                    : isPast
                      ? "border-border/50 bg-muted/30"
                      : "border-border/30 bg-card/50 hover:border-border/50",
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br transition-all duration-300",
                      isActive ? step.color : "from-muted to-muted",
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-4 h-4 transition-all duration-300",
                        isActive ? "text-white" : "text-muted-foreground",
                      )}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm font-medium transition-colors",
                        isActive ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{step.description}</p>
                  </div>
                </div>
              </button>
              {index < steps.length - 1 && (
                <div className="flex justify-center py-1">
                  <ArrowDown
                    className={cn(
                      "w-4 h-4 transition-colors",
                      animatedStep > index ? "text-cyan-500" : "text-muted-foreground/30",
                    )}
                  />
                </div>
              )}
            </div>
          )
        })}

        {/* Cycle indicator */}
        <div className="pt-4 border-t border-border/50">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>学習サイクル</span>
            <span className="font-mono">{isLearning ? "実行中" : "待機中"}</span>
          </div>
          <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-500",
                isLearning && "animate-pulse",
              )}
              style={{ width: `${((animatedStep + 1) / 4) * 100}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

