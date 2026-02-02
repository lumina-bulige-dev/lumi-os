
"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Bot, User, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Suggestion } from "./suggestion-panel"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface ChatInterfaceProps {
  onLearningStateChange: (isLearning: boolean) => void
  onStepChange: (step: number) => void
  onAddSuggestion: (suggestion: Omit<Suggestion, "id" | "timestamp" | "status">) => void
}

export function ChatInterface({ onLearningStateChange, onStepChange, onAddSuggestion }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "こんにちは！LumiBot0です。AZR（Absolute Zero Reasoner）の概念に基づいて動作します。対話を通じて、私が改善点や機会を発見した場合は「提案」として左パネルに表示します。採用するかどうかはあなた次第です。何かお手伝いできることはありますか？",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    onLearningStateChange(true)

    // Simulate AZR workflow steps
    for (let i = 0; i < 4; i++) {
      onStepChange(i)
      await new Promise((resolve) => setTimeout(resolve, 800))
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!response.ok) throw new Error("Failed to fetch")

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content || "申し訳ありません、応答を生成できませんでした。",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      if (data.suggestions && Array.isArray(data.suggestions)) {
        data.suggestions.forEach((s: Omit<Suggestion, "id" | "timestamp" | "status">) => {
          onAddSuggestion(s)
        })
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "接続エラーが発生しました。APIキーが設定されているか確認してください。",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      onLearningStateChange(false)
      onStepChange(0)
    }
  }

  return (
    <Card className="h-full flex flex-col bg-card/80 backdrop-blur border-border/50">
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Bot className="w-4 h-4 text-cyan-500" />
          チャット
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-xl px-4 py-2.5 text-sm",
                    message.role === "user" ? "bg-cyan-500 text-white" : "bg-muted/50 text-foreground",
                  )}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <p
                    className={cn("text-xs mt-1", message.role === "user" ? "text-cyan-100" : "text-muted-foreground")}
                  >
                    {message.timestamp.toLocaleTimeString("ja-JP", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-muted/50 rounded-xl px-4 py-2.5">
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-500" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <form onSubmit={handleSubmit} className="p-4 border-t border-border/50">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="メッセージを入力..."
              className="flex-1 bg-muted/50 border-border/50 focus-visible:ring-cyan-500"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              className="bg-cyan-500 hover:bg-cyan-600 text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
