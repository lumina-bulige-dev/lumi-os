"use client"

import { Plus, TrendingDown, TrendingUp, AlertCircle } from "lucide-react"
import type { ActionLog } from "@/app/page"

type WorldAViewProps = {
  logs: ActionLog[]
  onAddLog: () => void
}

const CATEGORY_ICONS: Record<string, string> = {
  food: "🍽️",
  transport: "🚃",
  entertainment: "🎮",
  shopping: "🛍️",
  utilities: "💡",
  health: "🏥",
  salary: "💰",
  saving: "🎯",
  learning: "📚",
  goal: "🏆",
}

export function WorldAView({ logs, onAddLog }: WorldAViewProps) {
  const totalIncome = logs.filter((l) => l.type === "income").reduce((sum, l) => sum + (l.amount || 0), 0)
  const totalExpense = logs.filter((l) => l.type === "expense").reduce((sum, l) => sum + (l.amount || 0), 0)
  const balance = totalIncome - totalExpense

  const recentLogs = logs.slice(0, 10)

  return (
    <div className="px-4 py-6 space-y-6">
      {/* World A Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30">
          <span className="text-amber-400 text-lg">🌍</span>
          <span className="text-amber-400 text-sm font-medium">World A: 現実のお金レイヤー</span>
        </div>
        <p className="text-white/60 text-sm">給料が入る → 気づけば消えている</p>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-[#0f2847] to-[#0a1628] rounded-2xl p-5 border border-white/10">
        <p className="text-white/60 text-sm mb-1">今月の残高</p>
        <p className="text-3xl font-bold text-white mb-4">¥{balance.toLocaleString()}</p>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] text-white/50">収入</p>
              <p className="text-sm font-medium text-emerald-400">¥{totalIncome.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <p className="text-[10px] text-white/50">支出</p>
              <p className="text-sm font-medium text-red-400">¥{totalExpense.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Insight Alert */}
      <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/20 flex gap-3">
        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-amber-400 text-sm font-medium">気づき</p>
          <p className="text-white/70 text-sm mt-1">
            週末のコンビニ支出が平日の2.3倍です。ストレス由来の可能性があります。
          </p>
        </div>
      </div>

      {/* Action Log List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-medium">最近の行動ログ</h2>
          <button
            onClick={onAddLog}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-cyan-500/20 text-cyan-400 text-sm hover:bg-cyan-500/30 transition-colors"
          >
            <Plus className="w-4 h-4" />
            記録
          </button>
        </div>

        <div className="space-y-2">
          {recentLogs.map((log) => (
            <div key={log.id} className="bg-[#0f2847]/50 rounded-xl p-4 border border-white/5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-lg">
                {CATEGORY_ICONS[log.category] || "📝"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-white text-sm font-medium truncate">{log.description}</p>
                  {log.behaviorTag && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full ${
                        log.behaviorTag === "衝動"
                          ? "bg-red-500/20 text-red-400"
                          : log.behaviorTag === "計画的"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : log.behaviorTag === "自制"
                              ? "bg-cyan-500/20 text-cyan-400"
                              : "bg-white/10 text-white/60"
                      }`}
                    >
                      {log.behaviorTag}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-white/50 text-xs">
                    {/* Wrap raw date values in `new Date()` so that
                     * serialized strings (from JSON or server) do not
                     * throw when calling date methods. Without this
                     * wrapper, `.toLocaleDateString` will be undefined
                     * when `date` is not a Date instance.
                     */}
                    {new Date(log.date).toLocaleDateString("ja-JP", { month: "short", day: "numeric" })}
                  </p>
                  {log.emotionTag && <p className="text-white/40 text-xs">• {log.emotionTag}</p>}
                </div>
              </div>
              <div className="text-right">
                {log.amount ? (
                  <p className={`text-sm font-medium ${log.type === "income" ? "text-emerald-400" : "text-white"}`}>
                    {log.type === "income" ? "+" : "-"}¥{log.amount.toLocaleString()}
                  </p>
                ) : (
                  <span className="text-cyan-400 text-sm">行動</span>
                )}
                {log.trustScore !== undefined && (
                  <p
                    className={`text-[10px] ${log.trustScore > 0 ? "text-emerald-400" : log.trustScore < 0 ? "text-red-400" : "text-white/40"}`}
                  >
                    Trust {log.trustScore > 0 ? "+" : ""}
                    {log.trustScore}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
