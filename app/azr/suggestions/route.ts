"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Lightbulb, Check, X, Clock, TrendingUp, AlertTriangle, Sparkles, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Suggestion {
  id: string
  type: "improvement" | "warning" | "opportunity"
  title: string
  description: string
  confidence: number
  status: "pending" | "accepted" | "rejected" | "deferred"
  category: string
  timestamp: Date
}

interface SuggestionPanelProps {
  suggestions: Suggestion[]
  onAccept: (id: string) => void
  onReject: (id: string) => void
  onDefer: (id: string) => void
}

export function SuggestionPanel({ suggestions, onAccept, onReject, onDefer }: SuggestionPanelProps) {
  const pendingSuggestions = suggestions.filter((s) => s.status === "pending")
  const historysuggestions = suggestions.filter((s) => s.status !== "pending")

  const typeConfig = {
    improvement: {
      icon: TrendingUp,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/30",
      label: "改善提案",
    },
    warning: {
      icon: AlertTriangle,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/30",
      label: "注意点",
    },
    opportunity: {
      icon: Sparkles,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/30",
      label: "機会",
    },
  }

  const statusConfig = {
    pending: { label: "検討中", color: "bg-muted text-muted-foreground" },
    accepted: { label: "採用", color: "bg-green-500/20 text-green-400" },
    rejected: { label: "却下", color: "bg-red-500/20 text-red-400" },
    deferred: { label: "保留", color: "bg-yellow-500/20 text-yellow-400" },
  }

  return (
    <Card className="bg-card/80 backdrop-blur border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-cyan-500" />
            Bot 提案
          </div>
          {pendingSuggestions.length > 0 && (
            <Badge variant="outline" className="border-cyan-500/50 text-cyan-400 text-xs">
              {pendingSuggestions.length} 件
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {pendingSuggestions.length > 0 ? (
          <ScrollArea className="h-[300px] pr-2">
            <div className="space-y-3">
              {pendingSuggestions.map((suggestion) => {
                const config = typeConfig[suggestion.type]
                const Icon = config.icon

                return (
                  <div
                    key={suggestion.id}
                    className={cn("p-3 rounded-lg border transition-all", config.bgColor, config.borderColor)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", config.bgColor)}>
                        <Icon className={cn("w-4 h-4", config.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn("text-xs", config.color)}>{config.label}</span>
                          <Badge variant="outline" className="text-xs border-border/50">
                            {suggestion.category}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-foreground mb-1">{suggestion.title}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{suggestion.description}</p>

                        {/* Confidence bar */}
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">信頼度</span>
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                suggestion.confidence >= 70
                                  ? "bg-green-500"
                                  : suggestion.confidence >= 40
                                    ? "bg-yellow-500"
                                    : "bg-red-500",
                              )}
                              style={{ width: `${suggestion.confidence}%` }}
                            />
                          </div>
                          <span className="text-xs font-mono text-muted-foreground">{suggestion.confidence}%</span>
                        </div>

                        {/* Action buttons */}
                        <div className="mt-3 flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => onAccept(suggestion.id)}
                            className="h-7 text-xs bg-green-500/20 hover:bg-green-500/30 text-green-400 border-0"
                          >
                            <Check className="w-3 h-3 mr-1" />
                            採用
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => onReject(suggestion.id)}
                            variant="outline"
                            className="h-7 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 border-0"
                          >
                            <X className="w-3 h-3 mr-1" />
                            却下
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => onDefer(suggestion.id)}
                            variant="outline"
                            className="h-7 text-xs bg-transparent hover:bg-muted/50 border-border/50"
                          >
                            <Clock className="w-3 h-3 mr-1" />
                            後で
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        ) : (
          <div className="py-8 text-center text-muted-foreground text-sm">
            <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>現在、新しい提案はありません</p>
            <p className="text-xs mt-1">対話を続けると、Botが自動的に提案を生成します</p>
          </div>
        )}

        {/* History */}
        {historysuggestions.length > 0 && (
          <div className="pt-3 border-t border-border/50">
            <button className="w-full flex items-center justify-between text-xs text-muted-foreground hover:text-foreground transition-colors">
              <span>過去の提案 ({historysuggestions.length}件)</span>
              <ChevronRight className="w-3 h-3" />
            </button>
            <div className="mt-2 space-y-1">
              {historysuggestions.slice(0, 3).map((s) => (
                <div key={s.id} className="flex items-center gap-2 text-xs">
                  <Badge variant="outline" className={cn("text-xs", statusConfig[s.status].color)}>
                    {statusConfig[s.status].label}
                  </Badge>
                  <span className="truncate text-muted-foreground">{s.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
