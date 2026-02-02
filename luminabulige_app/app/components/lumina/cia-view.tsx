"use client"

import { Shield, Lock, CheckCircle, Clock, FileText, ExternalLink, AlertTriangle, Hash } from "lucide-react"
import type { CIAProfile, ActionLog } from "@/app/types/lumina"


type CIAViewProps = {
  ciaProfile: CIAProfile
  logs: ActionLog[]
}

export function CIAView({ ciaProfile, logs }: CIAViewProps) {
  const verifiedLogs = logs.filter((l) => l.verified)
  const unverifiedLogs = logs.filter((l) => !l.verified)

  return (
    <div className="px-4 py-6 space-y-6">
      {/* CIA Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30">
          <Shield className="w-4 h-4 text-blue-400" />
          <span className="text-blue-400 text-sm font-medium">CIA: Credit Identity Archive</span>
        </div>
        <p className="text-white/60 text-sm">改ざん検知付きの信用アーカイブ</p>
      </div>

      {/* oKYC Status */}
      <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl p-5 border border-blue-500/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-400" />
            <span className="text-white font-medium">oKYC ステータス</span>
          </div>
          <span
            className={`text-sm flex items-center gap-1 ${
              ciaProfile.oKYCStatus === "verified"
                ? "text-emerald-400"
                : ciaProfile.oKYCStatus === "pending"
                  ? "text-amber-400"
                  : "text-white/40"
            }`}
          >
            {ciaProfile.oKYCStatus === "verified" && <CheckCircle className="w-4 h-4" />}
            {ciaProfile.oKYCStatus === "pending" && <Clock className="w-4 h-4" />}
            {ciaProfile.oKYCStatus === "verified" ? "有効" : ciaProfile.oKYCStatus === "pending" ? "検証中" : "未検証"}
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-white/10">
            <span className="text-white/60 text-sm">アーカイブID</span>
            <span className="text-white text-sm font-mono">{ciaProfile.archiveId}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-white/10">
            <span className="text-white/60 text-sm">最終検証</span>
            <span className="text-white text-sm flex items-center gap-1">
              <Clock className="w-3 h-3 text-white/40" />
              {new Date(ciaProfile.lastVerified).toLocaleDateString("ja-JP")}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-white/60 text-sm">改ざん検知</span>
            <span className="text-emerald-400 text-sm">異常なし</span>
          </div>
        </div>
      </div>

      <div className="bg-cyan-500/10 rounded-xl p-4 border border-cyan-500/20">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-5 h-5 text-cyan-400" />
          <h3 className="text-cyan-400 font-medium text-sm">個人開示型とは？</h3>
        </div>
        <p className="text-white/70 text-sm leading-relaxed">
          従来の信用情報は本人が見ることすら難しく、第三者が勝手に参照できました。 LUMINA CIAは
          <span className="text-cyan-400 font-medium">あなたがデータの主権を持ちます</span>。
          誰に、何を、いつまで開示するか、すべてあなたが決められます。
        </p>
      </div>

      {/* Behavior Patterns */}
      <div className="bg-[#0f2847]/50 rounded-xl p-4 border border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-cyan-400" />
          <h3 className="text-white font-medium">行動パターン分析</h3>
        </div>

        <div className="space-y-3">
          {ciaProfile.behaviorPatterns.map((pattern, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
              <div
                className={`w-2 h-2 rounded-full ${
                  index === 0 ? "bg-emerald-400" : index === 1 ? "bg-amber-400" : "bg-blue-400"
                }`}
              />
              <span className="text-white/80 text-sm">{pattern}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#0f2847]/50 rounded-xl p-4 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <h3 className="text-white font-medium">検証済みログ</h3>
          </div>
          <span className="text-white/60 text-sm">{verifiedLogs.length}件</span>
        </div>

        <div className="space-y-2">
          {verifiedLogs.slice(0, 5).map((log) => (
            <div key={log.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-emerald-400" />
                <span className="text-white/70 text-sm truncate max-w-[140px]">{log.description}</span>
              </div>
              <div className="flex items-center gap-2">
                {log.hash && (
                  <span className="text-white/30 text-[10px] font-mono flex items-center gap-1">
                    <Hash className="w-3 h-3" />
                    {log.hash}
                  </span>
                )}
                <span className="text-white/40 text-xs">
                {new Date(log.date).toLocaleDateString("ja-JP", { month: "short", day: "numeric" })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Unverified Logs */}
      {unverifiedLogs.length > 0 && (
        <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h3 className="text-amber-400 font-medium">検証待ちログ</h3>
            </div>
            <span className="text-amber-400/60 text-sm">{unverifiedLogs.length}件</span>
          </div>

          <div className="space-y-2">
            {unverifiedLogs.slice(0, 3).map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between py-2 border-b border-amber-500/10 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span className="text-white/70 text-sm truncate max-w-[180px]">{log.description}</span>
                </div>
                <span className="text-white/40 text-xs">
                  {new Date(log.date).toLocaleDateString("ja-JP", { month: "short", day: "numeric" })}
                </span>
              </div>
            ))}
          </div>
          <p className="text-amber-400/60 text-xs mt-3">通常24時間以内にVeritasChainで検証されます</p>
        </div>
      )}

      {/* VeritasChain Link */}
      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl p-4 border border-purple-500/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-medium text-sm">VeritasChain で検証</p>
            <p className="text-white/50 text-xs mt-1">改ざん不可能なブロックチェーン証明</p>
          </div>
          <button className="flex items-center gap-1 px-3 py-2 rounded-lg bg-white/10 text-white/80 text-sm hover:bg-white/20 transition-colors">
            Explorer
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Trust Statement */}
      <div className="text-center space-y-2 py-4">
        <p className="text-white/60 text-sm">「ちゃんとしてるのに、信用で詰む人」を減らすために</p>
        <p className="text-cyan-400 text-sm font-medium">LUMINA は改善の軌跡を信用に変えます</p>
      </div>
    </div>
  )
}
