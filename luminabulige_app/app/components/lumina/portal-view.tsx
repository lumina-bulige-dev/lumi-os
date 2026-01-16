"use client"

import { ArrowRight, Sparkles, Shield, TrendingUp } from "lucide-react"
import type { ActionLog, BuligRank } from "@/app/page"
import { useEffect, useState } from "react"

type PortalViewProps = {
  logs: ActionLog[]
  buligRank: BuligRank
}

export function PortalView({ logs, buligRank }: PortalViewProps) {
  // When logs or rank change we simulate an asynchronous conversion process.
  // Initially the portal is "converting"; after a short delay we mark it as
  // complete. This makes the "変換中..." state meaningful rather than static.
  const [isConverting, setIsConverting] = useState(true)
  useEffect(() => {
    setIsConverting(true)
    // Simulate a computation delay. In a real application this would be
    // replaced with an async call to a backend or worker that performs the
    // conversion and returns updated metrics.
    const timer = setTimeout(() => setIsConverting(false), 1500)
    return () => clearTimeout(timer)
  }, [logs, buligRank])
  // 行動パターン分析
  const behaviorStats = logs.reduce(
    (acc, log) => {
      if (log.behaviorTag) {
        acc[log.behaviorTag] = (acc[log.behaviorTag] || 0) + 1
      }
      return acc
    },
    {} as Record<string, number>,
  )

  const totalTrustScore = logs.reduce((sum, log) => sum + (log.trustScore || 0), 0)

  const improvementLogs = logs.filter((l) => (l.trustScore || 0) > 0).length
  const totalLogs = logs.length
  const improvementRate = totalLogs > 0 ? Math.round((improvementLogs / totalLogs) * 100) : 0

  // Do not reveal the improvement rate until conversion completes
  const displayImprovementRate = isConverting ? null : improvementRate

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Portal Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30">
          <span className="text-cyan-400 text-lg">🌀</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 text-sm font-medium">
            Portal: LUMINA Layer
          </span>
        </div>
        <p className="text-white/60 text-sm">行動ログ × 支出を接続し、信用の素材へ</p>
      </div>

      {/* Portal Animation */}
      <div className="relative flex justify-center py-8">
        {/* Outer pulses show only while conversion is running */}
        {isConverting && (
          <>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-40 h-40 rounded-full bg-gradient-to-r from-cyan-500/10 to-purple-500/10 animate-pulse" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-32 h-32 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 animate-pulse"
                style={{ animationDelay: "0.5s" }}
              />
            </div>
          </>
        )}
        <div className="relative flex flex-col items-center gap-2">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500/30 to-purple-500/30 border border-cyan-500/50 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-cyan-400" />
          </div>
          <p className="text-cyan-400 text-sm font-medium">
            {isConverting ? "変換中..." : "変換完了"}
          </p>
        </div>
      </div>

      {/* Conversion Flow */}
      <div className="space-y-4">
        <div className="bg-[#0f2847]/50 rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
              <span className="text-amber-400">🌍</span>
            </div>
            <span className="text-white/60 text-sm">World A からの入力</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-white/50 text-xs">行動ログ数</p>
              <p className="text-white text-lg font-bold">{logs.length}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-white/50 text-xs">累計Trust</p>
              <p className={`text-lg font-bold ${totalTrustScore >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {totalTrustScore >= 0 ? "+" : ""}
                {totalTrustScore}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <ArrowRight className="w-6 h-6 text-cyan-400 animate-pulse" />
        </div>

        <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl p-4 border border-cyan-500/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
              <Shield className="w-4 h-4 text-cyan-400" />
            </div>
            <span className="text-cyan-400 text-sm font-medium">Trust保存 & 変換</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-sm">改善行動率</span>
            <span className="text-emerald-400 font-medium">
              {displayImprovementRate !== null ? `${displayImprovementRate}%` : "--"}
            </span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-500"
                style={{ width: `${isConverting ? 0 : improvementRate}%` }}
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {Object.entries(behaviorStats)
                .slice(0, 5)
                .map(([tag, count]) => (
                  <span key={tag} className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/70">
                    {tag}: {count}
                  </span>
                ))}
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <ArrowRight className="w-6 h-6 text-purple-400 animate-pulse" />
        </div>

        <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl p-4 border border-purple-500/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-purple-400" />
            </div>
            <span className="text-purple-400 text-sm font-medium">BULIG Rank 算出</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/50 text-xs">現在のランク</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">{buligRank.level}</span>
                <span className="text-white/40 text-sm">/ 100</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/50 text-xs">前回比</p>
              <p
                className={`text-lg font-medium ${buligRank.level > buligRank.previousLevel ? "text-emerald-400" : buligRank.level < buligRank.previousLevel ? "text-red-400" : "text-white/60"}`}
              >
                {buligRank.level > buligRank.previousLevel
                  ? `+${buligRank.level - buligRank.previousLevel}`
                  : buligRank.level - buligRank.previousLevel}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
