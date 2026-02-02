
"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Play, Pause, RotateCcw, TrendingUp, TrendingDown, Activity } from "lucide-react"
import { cn } from "@/lib/utils"

interface TrainingMetrics {
  iteration: number
  loss: number
  accuracy: number
  learningRate: number
}

interface FineTuningPanelProps {
  isLearning: boolean
  onLearningStateChange: (isLearning: boolean) => void
}

export function FineTuningPanel({ isLearning, onLearningStateChange }: FineTuningPanelProps) {
  const [metrics, setMetrics] = useState<TrainingMetrics[]>([
    { iteration: 0, loss: 2.5, accuracy: 45, learningRate: 0.001 },
  ])
  const [isTraining, setIsTraining] = useState(false)
  const [currentIteration, setCurrentIteration] = useState(0)
  const maxIterations = 50

  const simulateTraining = useCallback(() => {
    setMetrics((prev) => {
      const lastMetric = prev[prev.length - 1]
      const newIteration = lastMetric.iteration + 1

      // Simulate decreasing loss with some noise
      const lossDecay = 0.92 + Math.random() * 0.05
      const newLoss = Math.max(0.1, lastMetric.loss * lossDecay + (Math.random() - 0.5) * 0.1)

      // Simulate increasing accuracy
      const accGain = 1 + Math.random() * 2
      const newAccuracy = Math.min(98, lastMetric.accuracy + accGain)

      // Learning rate decay
      const newLR = lastMetric.learningRate * 0.995

      const newMetric = {
        iteration: newIteration,
        loss: newLoss,
        accuracy: newAccuracy,
        learningRate: newLR,
      }

      return [...prev.slice(-49), newMetric]
    })

    setCurrentIteration((prev) => prev + 1)
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isTraining && currentIteration < maxIterations) {
      interval = setInterval(simulateTraining, 500)
      onLearningStateChange(true)
    } else if (currentIteration >= maxIterations) {
      setIsTraining(false)
      onLearningStateChange(false)
    }

    return () => clearInterval(interval)
  }, [isTraining, currentIteration, simulateTraining, onLearningStateChange, maxIterations])

  const toggleTraining = () => {
    setIsTraining(!isTraining)
  }

  const resetTraining = () => {
    setIsTraining(false)
    setCurrentIteration(0)
    setMetrics([{ iteration: 0, loss: 2.5, accuracy: 45, learningRate: 0.001 }])
    onLearningStateChange(false)
  }

  const currentMetric = metrics[metrics.length - 1]
  const previousMetric = metrics.length > 1 ? metrics[metrics.length - 2] : currentMetric

  const lossTrend = currentMetric.loss < previousMetric.loss
  const accTrend = currentMetric.accuracy > previousMetric.accuracy

  return (
    <Card className="bg-card/80 backdrop-blur border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-500" />
            ファインチューニング シミュレーション
          </CardTitle>
          <Badge
            variant="outline"
            className={cn("text-xs", isTraining ? "border-green-500/50 text-green-400" : "border-muted-foreground/50")}
          >
            {isTraining ? "学習中" : "停止"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Control buttons */}
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={toggleTraining}
            disabled={currentIteration >= maxIterations}
            className={cn("flex-1", isTraining ? "bg-orange-500 hover:bg-orange-600" : "bg-cyan-500 hover:bg-cyan-600")}
          >
            {isTraining ? (
              <>
                <Pause className="w-4 h-4 mr-2" /> 一時停止
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" /> 開始
              </>
            )}
          </Button>
          <Button size="sm" variant="outline" onClick={resetTraining} className="border-border/50 bg-transparent">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>学習進捗</span>
            <span>
              {currentIteration} / {maxIterations} iterations
            </span>
          </div>
          <Progress value={(currentIteration / maxIterations) * 100} className="h-2" />
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Loss */}
          <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Loss</span>
              {lossTrend ? (
                <TrendingDown className="w-3 h-3 text-green-500" />
              ) : (
                <TrendingUp className="w-3 h-3 text-red-500" />
              )}
            </div>
            <p className="text-lg font-mono font-semibold text-foreground">{currentMetric.loss.toFixed(4)}</p>
          </div>

          {/* Accuracy */}
          <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Accuracy</span>
              {accTrend ? (
                <TrendingUp className="w-3 h-3 text-green-500" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-500" />
              )}
            </div>
            <p className="text-lg font-mono font-semibold text-foreground">{currentMetric.accuracy.toFixed(1)}%</p>
          </div>

          {/* Learning Rate */}
          <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Learning Rate</span>
            </div>
            <p className="text-lg font-mono font-semibold text-foreground">{currentMetric.learningRate.toFixed(6)}</p>
          </div>

          {/* Iteration */}
          <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Iteration</span>
            </div>
            <p className="text-lg font-mono font-semibold text-foreground">{currentIteration}</p>
          </div>
        </div>

        {/* Loss Chart (Simple visualization) */}
        <div className="space-y-2">
          <span className="text-xs text-muted-foreground">Loss 推移</span>
          <div className="h-16 flex items-end gap-0.5 bg-muted/20 rounded-lg p-2">
            {metrics.slice(-30).map((m, i) => {
              const height = Math.max(5, 100 - (m.loss / 2.5) * 100)
              return (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-cyan-500 to-cyan-400 rounded-sm transition-all duration-200"
                  style={{ height: `${height}%` }}
                />
              )
            })}
          </div>
        </div>

        {/* Neural Network Visualization */}
        <div className="space-y-2">
          <span className="text-xs text-muted-foreground">ネットワーク状態</span>
          <div className="flex justify-center items-center gap-4 py-3">
            {[3, 5, 4, 2].map((nodes, layerIndex) => (
              <div key={layerIndex} className="flex flex-col gap-1.5">
                {Array.from({ length: nodes }).map((_, nodeIndex) => (
                  <div
                    key={nodeIndex}
                    className={cn(
                      "w-3 h-3 rounded-full transition-all duration-300",
                      isTraining ? "animate-pulse" : "",
                    )}
                    style={{
                      backgroundColor: isTraining
                        ? `hsl(${180 + Math.random() * 40}, 70%, ${50 + Math.random() * 20}%)`
                        : "hsl(var(--muted))",
                      animationDelay: `${(layerIndex * nodes + nodeIndex) * 100}ms`,
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
