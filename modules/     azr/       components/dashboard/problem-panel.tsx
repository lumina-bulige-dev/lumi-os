
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Code, Play, Loader2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProblemPanelProps {
  currentStep: number
  isLearning: boolean
}

interface Problem {
  title: string
  difficulty: "easy" | "medium" | "hard"
  description: string
  template: string
}

export function ProblemPanel({ currentStep, isLearning }: ProblemPanelProps) {
  const [problem, setProblem] = useState<Problem | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [code, setCode] = useState("")
  const [output, setOutput] = useState("")
  const [isEvaluating, setIsEvaluating] = useState(false)

  const generateProblem = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/generate-problem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ difficulty: "medium" }),
      })

      if (!response.ok) throw new Error("Failed to generate")

      const data = await response.json()
      setProblem(data.problem)
      setCode(data.problem.template)
      setOutput("")
    } catch (error) {
      setProblem({
        title: "配列の合計",
        difficulty: "easy",
        description: "整数の配列を受け取り、その合計を返す関数を実装してください。",
        template: "def sum_array(arr):\n    # ここにコードを書いてください\n    pass",
      })
      setCode("def sum_array(arr):\n    # ここにコードを書いてください\n    pass")
    } finally {
      setIsGenerating(false)
    }
  }

  const evaluateCode = async () => {
    setIsEvaluating(true)
    setOutput("")
    try {
      const response = await fetch("/api/evaluate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, problem }),
      })

      if (!response.ok) throw new Error("Failed to evaluate")

      const data = await response.json()
      setOutput(data.result)
    } catch (error) {
      setOutput("評価エラー: APIに接続できませんでした")
    } finally {
      setIsEvaluating(false)
    }
  }

  const difficultyColors = {
    easy: "bg-green-500/20 text-green-400 border-green-500/30",
    medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    hard: "bg-red-500/20 text-red-400 border-red-500/30",
  }

  return (
    <Card className="h-full flex flex-col bg-card/80 backdrop-blur border-border/50">
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Code className="w-4 h-4 text-cyan-500" />
            問題パネル
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={generateProblem}
            disabled={isGenerating}
            className="h-7 text-xs border-cyan-500/30 hover:bg-cyan-500/10 bg-transparent"
          >
            {isGenerating ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
            生成
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <Tabs defaultValue="problem" className="flex-1 flex flex-col">
          <TabsList className="mx-4 mt-3 bg-muted/50">
            <TabsTrigger value="problem" className="text-xs">
              問題
            </TabsTrigger>
            <TabsTrigger value="code" className="text-xs">
              コード
            </TabsTrigger>
            <TabsTrigger value="output" className="text-xs">
              結果
            </TabsTrigger>
          </TabsList>

          <TabsContent value="problem" className="flex-1 p-4 overflow-auto">
            {problem ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-foreground">{problem.title}</h3>
                  <Badge variant="outline" className={cn("text-xs", difficultyColors[problem.difficulty])}>
                    {problem.difficulty}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{problem.description}</p>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                「生成」をクリックして問題を作成
              </div>
            )}
          </TabsContent>

          <TabsContent value="code" className="flex-1 flex flex-col p-4 overflow-hidden">
            <div className="flex-1 rounded-lg bg-muted/30 border border-border/50 overflow-hidden">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-full p-3 bg-transparent text-sm font-mono text-foreground resize-none focus:outline-none"
                placeholder="# コードを入力..."
                spellCheck={false}
              />
            </div>
            <Button
              className="mt-3 bg-cyan-500 hover:bg-cyan-600 text-white"
              onClick={evaluateCode}
              disabled={!code.trim() || isEvaluating}
            >
              {isEvaluating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              実行・評価
            </Button>
          </TabsContent>

          <TabsContent value="output" className="flex-1 p-4 overflow-auto">
            <div className="h-full rounded-lg bg-muted/30 border border-border/50 p-3">
              {output ? (
                <pre className="text-sm font-mono text-foreground whitespace-pre-wrap">{output}</pre>
              ) : (
                <p className="text-sm text-muted-foreground">コードを実行すると結果がここに表示されます</p>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Learning indicator */}
        <div className="p-4 border-t border-border/50">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>現在のステップ</span>
            <span className="font-mono">{["問題生成", "問題解決", "検証", "自己改良"][currentStep]}</span>
          </div>
          <div className="flex gap-1">
            {[0, 1, 2, 3].map((step) => (
              <div
                key={step}
                className={cn(
                  "flex-1 h-1 rounded-full transition-colors duration-300",
                  currentStep >= step ? "bg-cyan-500" : "bg-muted",
                )}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
