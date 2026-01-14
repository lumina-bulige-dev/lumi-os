"use client"

import { useState } from "react"
import { Award, FileCheck, Star, Shield, Download, Share2, Copy, Check, Ban, Eye, Clock } from "lucide-react"
import type { BuligRank, CIAProfile, DisclosureSettings } from "@/app/page"

type WorldBViewProps = {
  buligRank: BuligRank
  ciaProfile: CIAProfile
  disclosures: DisclosureSettings[]
  onCreateDisclosure: () => void
  onRevokeDisclosure: (id: string) => void
  /**
   * Called whenever the disclosure access code is used. This is used for
   * auditing and rate limiting. The parent component can increment
   * `accessCount` and append a timestamp to `accessLogs`. When a limit is
   * exceeded the disclosure should be marked as inactive.
   */
  onAccessDisclosure: (id: string) => void
}

const RECIPIENT_TYPE_LABELS: Record<string, string> = {
  landlord: "不動産",
  employer: "雇用主",
  bank: "金融機関",
  other: "その他",
}

export function WorldBView({
  buligRank,
  ciaProfile,
  disclosures,
  onCreateDisclosure,
  onRevokeDisclosure,
  onAccessDisclosure,
}: WorldBViewProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [showDisclosures, setShowDisclosures] = useState(true)

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
    // Notify parent that this disclosure was accessed. This allows
    // incrementing access count, recording an audit log and enforcing
    // rate limits in the parent state. Without this callback the
    // component would not be able to track how many times a disclosure
    // has been viewed. Note that we do not do any state updates here to
    // keep the component purely presentational.
    onAccessDisclosure(id)
  }

  // Determine which disclosures are active based on both the manual
  // `isActive` flag and the expiry date. If the expiry date has passed
  // then the disclosure is considered expired even if `isActive` is
  // still true. Conversely a disclosure can be revoked manually by
  // toggling `isActive` to false.
  const now = new Date()
  const activeDisclosures = disclosures.filter((d) => d.isActive && new Date(d.expiresAt) > now)
  const expiredDisclosures = disclosures.filter((d) => !d.isActive || new Date(d.expiresAt) <= now)

  return (
    <div className="px-4 py-6 space-y-6">
      {/* World B Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30">
          <span className="text-emerald-400 text-lg">🌎</span>
          <span className="text-emerald-400 text-sm font-medium">World B: 信用の並行レイヤー</span>
        </div>
        <p className="text-white/60 text-sm">「変われる人」という信用の前置き資料</p>
      </div>

      {/* BULIG Rank Card */}
      <div className="bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-2xl p-6 border border-emerald-500/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <Award className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-emerald-400 text-sm font-medium">BULIG Rank</p>
            <p className="text-white/60 text-xs">あなたの改善の軌跡</p>
          </div>
        </div>

        <div className="flex items-end gap-4 mb-4">
          <span className="text-5xl font-bold text-white">{buligRank.level}</span>
          <div className="pb-2">
            <span className="text-white/40 text-lg">/ 100</span>
            {buligRank.trend === "up" && (
              <p className="text-emerald-400 text-sm">+{buligRank.level - buligRank.previousLevel} 上昇中</p>
            )}
          </div>
        </div>

        {/* Rank Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-white/50">Rank 進捗</span>
            <span className="text-emerald-400">{buligRank.level}%</span>
          </div>
          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full transition-all duration-500"
              style={{ width: `${buligRank.level}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-white/40">
            <span>新規</span>
            <span>安定</span>
            <span>信頼</span>
            <span>優良</span>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl p-4 border border-cyan-500/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-cyan-400" />
            <h3 className="text-white font-medium">個人開示型 信用情報</h3>
          </div>
          <button
            onClick={onCreateDisclosure}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-cyan-500/20 text-cyan-400 text-sm hover:bg-cyan-500/30 transition-colors"
          >
            <Shield className="w-4 h-4" />
            新規開示
          </button>
        </div>

        <p className="text-white/60 text-sm mb-4">
          あなたが選んだ相手に、選んだデータだけを、期限付きで開示できます。
          いつでも取り消し可能。データの主権はあなたにあります。
        </p>

        {/* Active Disclosures */}
        {activeDisclosures.length > 0 && (
          <div className="space-y-3">
            <p className="text-white/50 text-xs flex items-center gap-1">
              <Eye className="w-3 h-3" />
              有効な開示 ({activeDisclosures.length})
            </p>
            {activeDisclosures.map((disclosure) => (
              <div key={disclosure.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-white font-medium">{disclosure.recipientName}</p>
                    <p className="text-white/40 text-xs">{RECIPIENT_TYPE_LABELS[disclosure.recipientType]}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    有効
                  </span>
                </div>

                {/* Access Code */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 bg-[#0a1628] rounded-lg px-3 py-2 font-mono text-sm text-cyan-400">
                    {disclosure.accessCode}
                  </div>
                  <button
                    onClick={() => handleCopyCode(disclosure.accessCode, disclosure.id)}
                    className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors"
                  >
                    {copiedId === disclosure.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-white/50 mb-3">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {/* Show the number of times the disclosure has been accessed. */}
                    {disclosure.accessCount}回閲覧
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {/*
                     * Calculate days until expiry. Wrap the raw date in
                     * `new Date()` to handle string values returned from
                     * serialization. Ensure the value does not go below
                     * zero to avoid negative day counts once expired.
                     */}
                    {(() => {
                      const diff = new Date(disclosure.expiresAt).getTime() - Date.now()
                      const days = Math.max(0, Math.ceil(diff / 86400000))
                      return days
                    })()}日後に期限切れ
                  </span>
                </div>

                {/* Allowed Data Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {disclosure.allowedData.buligRank && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/60">BULIG Rank</span>
                  )}
                  {disclosure.allowedData.improvementRate && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/60">改善率</span>
                  )}
                  {disclosure.allowedData.consistencyScore && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/60">一貫性</span>
                  )}
                  {disclosure.allowedData.behaviorPatterns && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/60">行動パターン</span>
                  )}
                  {disclosure.allowedData.verifiedLogs && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/60">ログ詳細</span>
                  )}
                  {disclosure.allowedData.achievements && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/60">バッジ</span>
                  )}
                </div>

                {/* Revoke Button */}
                <button
                  onClick={() => onRevokeDisclosure(disclosure.id)}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm hover:bg-red-500/20 transition-colors"
                >
                  <Ban className="w-4 h-4" />
                  開示を取り消す
                </button>
              </div>
            ))}
          </div>
        )}

        {activeDisclosures.length === 0 && (
          <div className="text-center py-6">
            <Shield className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/40 text-sm">有効な開示はありません</p>
            <p className="text-white/30 text-xs mt-1">「新規開示」から信用情報を共有できます</p>
          </div>
        )}
      </div>

      {/* Credit Material */}
      <div className="bg-[#0f2847]/50 rounded-xl p-4 border border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <FileCheck className="w-5 h-5 text-cyan-400" />
          <h3 className="text-white font-medium">信用の素材</h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-white/50 text-xs">検証済みログ</p>
            <p className="text-white text-xl font-bold">{ciaProfile.verifiedLogs}</p>
            <p className="text-emerald-400 text-[10px]">
              {Math.round((ciaProfile.verifiedLogs / ciaProfile.totalLogs) * 100)}% 検証済
            </p>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-white/50 text-xs">改善率</p>
            <p className="text-emerald-400 text-xl font-bold">+{ciaProfile.improvementRate}%</p>
            <p className="text-white/40 text-[10px]">前月比</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-white/50 text-xs">一貫性スコア</p>
            <p className="text-cyan-400 text-xl font-bold">{ciaProfile.consistencyScore}</p>
            <p className="text-white/40 text-[10px]">/ 100</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-white/50 text-xs">達成バッジ</p>
            <p className="text-purple-400 text-xl font-bold">{ciaProfile.achievements.length}</p>
            <p className="text-white/40 text-[10px]">獲得済み</p>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Star className="w-5 h-5 text-amber-400" />
          <h3 className="text-white font-medium">獲得バッジ</h3>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
          {ciaProfile.achievements.map((achievement) => (
            <div
              key={achievement.id}
              className="flex-shrink-0 w-28 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl p-3 border border-amber-500/20 text-center"
            >
              <span className="text-3xl">{achievement.icon}</span>
              <p className="text-white text-xs font-medium mt-2 truncate">{achievement.title}</p>
              <p className="text-white/40 text-[10px] mt-1">
                {new Date(achievement.earnedAt).toLocaleDateString("ja-JP", { month: "short", day: "numeric" })}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Export CIA */}
      <button className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:opacity-90 transition-opacity">
        <Shield className="w-5 h-5" />
        CIA証明書をエクスポート
        <Download className="w-4 h-4" />
      </button>

      <p className="text-center text-white/40 text-xs">家・仕事・契約で提出できる「変われる証明」</p>
    </div>
  )
}
