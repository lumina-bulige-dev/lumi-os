"use client"

import { useState } from "react"
import { X, Shield, Building2, Briefcase, Landmark, Users, Calendar, ChevronDown, Info } from "lucide-react"
import type { DisclosureSettings } from "@/app/page"

type DisclosureModalProps = {
  onAdd: (
    disclosure: Omit<
      DisclosureSettings,
      "id" | "accessCode" | "accessCount" | "createdAt" | "accessLogs"
    >,
  ) => void
  onClose: () => void
}

const RECIPIENT_TYPES = [
  { id: "landlord", name: "不動産・大家", icon: Building2, description: "賃貸契約時の信用証明に" },
  { id: "employer", name: "雇用主", icon: Briefcase, description: "就職・転職時の人物証明に" },
  { id: "bank", name: "金融機関", icon: Landmark, description: "ローン・口座開設の補助資料に" },
  { id: "other", name: "その他", icon: Users, description: "その他の信用証明に" },
] as const

const EXPIRY_OPTIONS = [
  { days: 7, label: "7日間" },
  { days: 14, label: "14日間" },
  { days: 30, label: "30日間" },
  { days: 90, label: "90日間" },
]

export function DisclosureModal({ onAdd, onClose }: DisclosureModalProps) {
  const [recipientName, setRecipientName] = useState("")
  const [recipientType, setRecipientType] = useState<"landlord" | "employer" | "bank" | "other">("landlord")
  const [expiryDays, setExpiryDays] = useState(30)
  const [showTypeSelect, setShowTypeSelect] = useState(false)
  const [allowedData, setAllowedData] = useState({
    buligRank: true,
    improvementRate: true,
    consistencyScore: true,
    behaviorPatterns: false,
    verifiedLogs: false,
    achievements: true,
  })

  const selectedType = RECIPIENT_TYPES.find((t) => t.id === recipientType)

  const handleSubmit = () => {
    if (!recipientName) return

    onAdd({
      recipientName,
      recipientType,
      allowedData,
      expiresAt: new Date(Date.now() + expiryDays * 86400000),
      isActive: true,
    })
  }

  const dataItems = [
    { key: "buligRank", name: "BULIG Rank", description: "改善の総合スコア", recommended: true },
    { key: "improvementRate", name: "改善率", description: "前月比の改善度", recommended: true },
    { key: "consistencyScore", name: "一貫性スコア", description: "記録の継続性", recommended: true },
    { key: "behaviorPatterns", name: "行動パターン", description: "傾向の分析結果", recommended: false },
    { key: "verifiedLogs", name: "検証済みログ詳細", description: "個別の行動記録", recommended: false },
    { key: "achievements", name: "獲得バッジ", description: "達成した実績", recommended: true },
  ] as const

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-end justify-center">
      <div className="w-full max-w-lg bg-[#0a1628] rounded-t-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#0a1628] px-4 py-4 border-b border-white/10 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            <h2 className="text-white font-medium">信用情報を開示</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Explanation */}
          <div className="bg-cyan-500/10 rounded-xl p-4 border border-cyan-500/20">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-cyan-400 text-sm font-medium">個人開示型の信用情報</p>
                <p className="text-white/60 text-xs mt-1">
                  あなたが選んだ相手に、選んだデータだけを、期限付きで開示できます。 開示後もいつでも取り消し可能です。
                </p>
              </div>
            </div>
          </div>

          {/* Recipient Name */}
          <div>
            <label className="text-white/60 text-sm mb-2 block">開示先の名前</label>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="例: 〇〇不動産、株式会社〇〇"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          {/* Recipient Type */}
          <div>
            <label className="text-white/60 text-sm mb-2 block">開示先の種類</label>
            <button
              onClick={() => setShowTypeSelect(!showTypeSelect)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 flex items-center justify-between text-white"
            >
              {selectedType && (
                <span className="flex items-center gap-3">
                  <selectedType.icon className="w-5 h-5 text-cyan-400" />
                  <div className="text-left">
                    <p className="text-white text-sm">{selectedType.name}</p>
                    <p className="text-white/40 text-xs">{selectedType.description}</p>
                  </div>
                </span>
              )}
              <ChevronDown
                className={`w-5 h-5 text-white/40 transition-transform ${showTypeSelect ? "rotate-180" : ""}`}
              />
            </button>

            {showTypeSelect && (
              <div className="mt-2 space-y-2">
                {RECIPIENT_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => {
                      setRecipientType(type.id)
                      setShowTypeSelect(false)
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                      recipientType === type.id
                        ? "bg-cyan-500/20 border border-cyan-500/50"
                        : "bg-white/5 border border-white/10"
                    }`}
                  >
                    <type.icon className={`w-5 h-5 ${recipientType === type.id ? "text-cyan-400" : "text-white/60"}`} />
                    <div className="text-left">
                      <p className={`text-sm ${recipientType === type.id ? "text-white" : "text-white/80"}`}>
                        {type.name}
                      </p>
                      <p className="text-white/40 text-xs">{type.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Allowed Data */}
          <div>
            <label className="text-white/60 text-sm mb-2 block">開示するデータを選択</label>
            <div className="space-y-2">
              {dataItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() =>
                    setAllowedData((prev) => ({
                      ...prev,
                      [item.key]: !prev[item.key as keyof typeof prev],
                    }))
                  }
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
                    allowedData[item.key as keyof typeof allowedData]
                      ? "bg-cyan-500/20 border border-cyan-500/50"
                      : "bg-white/5 border border-white/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        allowedData[item.key as keyof typeof allowedData]
                          ? "bg-cyan-500 border-cyan-500"
                          : "border-white/30"
                      }`}
                    >
                      {allowedData[item.key as keyof typeof allowedData] && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className="text-left">
                      <p className="text-white text-sm">{item.name}</p>
                      <p className="text-white/40 text-xs">{item.description}</p>
                    </div>
                  </div>
                  {item.recommended && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                      推奨
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Expiry */}
          <div>
            <label className="text-white/60 text-sm mb-2 block flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              有効期限
            </label>
            <div className="flex gap-2">
              {EXPIRY_OPTIONS.map((option) => (
                <button
                  key={option.days}
                  onClick={() => setExpiryDays(option.days)}
                  className={`flex-1 py-3 rounded-xl text-sm transition-colors ${
                    expiryDays === option.days
                      ? "bg-cyan-500/20 border border-cyan-500/50 text-cyan-400"
                      : "bg-white/5 border border-white/10 text-white/60"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Warning */}
          <div className="bg-amber-500/10 rounded-xl p-3 border border-amber-500/20">
            <p className="text-amber-400 text-xs">
              開示コードを受け取った相手のみがデータを閲覧できます。 期限が切れると自動的にアクセスできなくなります。
            </p>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!recipientName}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            開示コードを発行
          </button>
        </div>
      </div>
    </div>
  )
}
