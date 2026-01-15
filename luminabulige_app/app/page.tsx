'use client';  // ← 必ず先頭に

export const metadata = {
  title: 'LUMINA',
  description: 'LUMINA / LUMINA CIA / oKYC beta landing page.',
};

// 以下はそのまま…
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
// …



import { LuminaHeader } from "@/components/lumina/header"
import { WorldAView } from "@/components/lumina/world-a-view"
import { PortalView } from "@/components/lumina/portal-view"
import { WorldBView } from "@/components/lumina/world-b-view"
import { CIAView } from "@/components/lumina/cia-view"
import { BottomNavLumina } from "@/components/lumina/bottom-nav"
import { ActionLogModal } from "@/components/lumina/action-log-modal"
import { DisclosureModal } from "@/components/lumina/disclosure-modal"

// 行動ログの型定義
export type ActionLog = {
  id: string
  type: "income" | "expense" | "behavior"
  amount?: number
  category: string
  description: string
  date: Date
  behaviorTag?: string
  emotionTag?: string
  memo?: string
  trustScore?: number
  verified?: boolean // VeritasChain検証済み
  hash?: string // ブロックチェーンハッシュ
}

// BULIG Rankの型定義
export type BuligRank = {
  level: number
  previousLevel: number
  trend: "up" | "down" | "stable"
  lastUpdated: Date
}

// CIA (Credit Identity Archive) の型定義
export type CIAProfile = {
  totalLogs: number
  verifiedLogs: number
  improvementRate: number
  consistencyScore: number
  behaviorPatterns: string[]
  achievements: Achievement[]
  oKYCStatus: "verified" | "pending" | "none"
  archiveId: string
  lastVerified: Date
}

export type Achievement = {
  id: string
  title: string
  description: string
  earnedAt: Date
  icon: string
}

export type DisclosureSettings = {
  id: string
  recipientName: string
  recipientType: "landlord" | "employer" | "bank" | "other"
  allowedData: {
    buligRank: boolean
    improvementRate: boolean
    consistencyScore: boolean
    behaviorPatterns: boolean
    verifiedLogs: boolean
    achievements: boolean
  }
  expiresAt: Date
  createdAt: Date
  accessCode: string
  accessCount: number
  isActive: boolean
  /**
   * Array of timestamps when the disclosure was accessed. This can be used
   * for audit logging and to implement rate limiting. Each entry
   * represents one successful access of the disclosure code. Once the
   * number of accesses exceeds a predefined limit the disclosure will be
   * automatically revoked by setting `isActive` to false.
   */
  accessLogs: { timestamp: Date }[]
}

// 初期データ
const INITIAL_LOGS: ActionLog[] = [
  {
    id: "1",
    type: "expense",
    amount: 1200,
    category: "food",
    description: "コンビニ",
    date: new Date(Date.now() - 86400000 * 0),
    behaviorTag: "衝動",
    emotionTag: "ストレス",
    trustScore: -1,
    verified: true,
    hash: "0x7a8b...3c4d",
  },
  {
    id: "2",
    type: "expense",
    amount: 3500,
    category: "food",
    description: "同僚とランチ",
    date: new Date(Date.now() - 86400000 * 1),
    behaviorTag: "計画的",
    emotionTag: "喜び",
    trustScore: 0,
    verified: true,
    hash: "0x5e6f...1a2b",
  },
  {
    id: "3",
    type: "behavior",
    category: "saving",
    description: "衝動買いを我慢した",
    date: new Date(Date.now() - 86400000 * 1),
    behaviorTag: "自制",
    trustScore: 3,
    verified: true,
    hash: "0x9c0d...7e8f",
  },
  {
    id: "4",
    type: "income",
    amount: 280000,
    category: "salary",
    description: "1月給与",
    date: new Date(Date.now() - 86400000 * 5),
    behaviorTag: "定期",
    trustScore: 2,
    verified: true,
    hash: "0x2b3c...4d5e",
  },
  {
    id: "5",
    type: "expense",
    amount: 8900,
    category: "shopping",
    description: "ユニクロ（計画購入）",
    date: new Date(Date.now() - 86400000 * 3),
    behaviorTag: "計画的",
    emotionTag: "満足",
    trustScore: 1,
    verified: true,
    hash: "0x6f7g...8h9i",
  },
  {
    id: "6",
    type: "behavior",
    category: "learning",
    description: "家計簿を7日連続で記録",
    date: new Date(Date.now() - 86400000 * 2),
    behaviorTag: "継続",
    trustScore: 5,
    verified: true,
    hash: "0x1j2k...3l4m",
  },
  {
    id: "7",
    type: "expense",
    amount: 12000,
    category: "utilities",
    description: "電気代（前月比-15%）",
    date: new Date(Date.now() - 86400000 * 10),
    behaviorTag: "節約",
    trustScore: 3,
    verified: true,
    hash: "0x5n6o...7p8q",
  },
  {
    id: "8",
    type: "behavior",
    category: "goal",
    description: "月間予算を達成",
    date: new Date(Date.now() - 86400000 * 0),
    behaviorTag: "達成",
    trustScore: 10,
    verified: false,
  },
]

const INITIAL_BULIG_RANK: BuligRank = {
  level: 42,
  previousLevel: 38,
  trend: "up",
  lastUpdated: new Date(),
}

const INITIAL_CIA: CIAProfile = {
  totalLogs: 156,
  verifiedLogs: 148,
  improvementRate: 23,
  consistencyScore: 78,
  behaviorPatterns: ["計画的な支出", "週末の衝動買い傾向", "定期的な記録習慣"],
  achievements: [
    {
      id: "1",
      title: "First Step",
      description: "初めての記録を完了",
      earnedAt: new Date(Date.now() - 86400000 * 30),
      icon: "🌱",
    },
    {
      id: "2",
      title: "週間チャンピオン",
      description: "7日連続で記録を継続",
      earnedAt: new Date(Date.now() - 86400000 * 7),
      icon: "🏆",
    },
    {
      id: "3",
      title: "節約マスター",
      description: "前月比20%以上の節約を達成",
      earnedAt: new Date(Date.now() - 86400000 * 3),
      icon: "💎",
    },
  ],
  oKYCStatus: "verified",
  archiveId: "LB-CIA-2025-0142",
  lastVerified: new Date(),
}

const INITIAL_DISCLOSURES: DisclosureSettings[] = [
  {
    id: "1",
    recipientName: "〇〇不動産",
    recipientType: "landlord",
    allowedData: {
      buligRank: true,
      improvementRate: true,
      consistencyScore: true,
      behaviorPatterns: false,
      verifiedLogs: false,
      achievements: true,
    },
    expiresAt: new Date(Date.now() + 86400000 * 30),
    createdAt: new Date(Date.now() - 86400000 * 2),
    accessCode: "LB-DSC-7X9K2M",
    accessCount: 3,
    isActive: true,
    accessLogs: [],
  },
]

export default function Home() {
  // router and search params for routing based on the `tab` query parameter. This allows
  // each tab to be shareable via URL (e.g. ?tab=worldB) and lets the back/forward
  // buttons reflect the current section. When the query parameter changes the
  // active tab will update accordingly.
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialTabParam = (searchParams?.get("tab") as
    | "worldA"
    | "portal"
    | "worldB"
    | "cia"
    | null) ?? null
  const [activeTab, setActiveTab] = useState<"worldA" | "portal" | "worldB" | "cia">(
    initialTabParam ?? "worldA",
  )

  // Sync active tab with URL search parameter. When the URL changes (e.g. back/forward
  // navigation) this effect will update the state accordingly. Without this effect,
  // the component would not respond to changes in the URL.
  useEffect(() => {
    const param = (searchParams?.get("tab") as
      | "worldA"
      | "portal"
      | "worldB"
      | "cia"
      | null) ?? null
    if (param && param !== activeTab) {
      setActiveTab(param)
    }
  }, [searchParams])
  const [logs, setLogs] = useState<ActionLog[]>(INITIAL_LOGS)
  const [buligRank, setBuligRank] = useState<BuligRank>(INITIAL_BULIG_RANK)
  const [ciaProfile, setCIAProfile] = useState<CIAProfile>(INITIAL_CIA)
  const [disclosures, setDisclosures] = useState<DisclosureSettings[]>(INITIAL_DISCLOSURES)

  // Rate limiting: maximum number of accesses allowed per disclosure before it
  // is automatically revoked. Adjust this value based on your security
  // requirements. When a disclosure exceeds this number of accesses it will
  // be marked inactive and no longer be considered valid.
  const MAX_ACCESS_PER_DISCLOSURE = 5
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDisclosureModal, setShowDisclosureModal] = useState(false)

  const handleAddLog = (log: Omit<ActionLog, "id">) => {
    const newLog: ActionLog = {
      ...log,
      id: Date.now().toString(),
      verified: false,
    }
    setLogs((prev) => [newLog, ...prev])

    const trustImpact = log.trustScore || 0
    setBuligRank((prev) => ({
      ...prev,
      previousLevel: prev.level,
      level: Math.min(100, Math.max(1, prev.level + Math.floor(trustImpact / 2))),
      trend: trustImpact > 0 ? "up" : trustImpact < 0 ? "down" : "stable",
      lastUpdated: new Date(),
    }))

    setCIAProfile((prev) => ({
      ...prev,
      totalLogs: prev.totalLogs + 1,
    }))

    setShowAddModal(false)
  }

  const handleAddDisclosure = (
    disclosure: Omit<DisclosureSettings, "id" | "accessCode" | "accessCount" | "createdAt">,
  ) => {
    const newDisclosure: DisclosureSettings = {
      ...disclosure,
      id: Date.now().toString(),
      accessCode: `LB-DSC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      accessCount: 0,
      createdAt: new Date(),
      accessLogs: [],
    }
    setDisclosures((prev) => [newDisclosure, ...prev])
    setShowDisclosureModal(false)
  }

  const handleRevokeDisclosure = (id: string) => {
    setDisclosures((prev) => prev.map((d) => (d.id === id ? { ...d, isActive: false } : d)))
  }

  /**
   * Callback invoked whenever a disclosure access code is used. This
   * increments the `accessCount`, appends an entry to `accessLogs`, and
   * automatically revokes the disclosure if the access limit is exceeded.
   */
  const handleAccessDisclosure = (id: string) => {
    setDisclosures((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d
        // increment access count and append an audit log entry
        const newCount = d.accessCount + 1
        const newLogs = [...(d.accessLogs ?? []), { timestamp: new Date() }]
        const isActive = d.isActive && newCount < MAX_ACCESS_PER_DISCLOSURE
        return { ...d, accessCount: newCount, accessLogs: newLogs, isActive }
      }),
    )
  }

  /**
   * Change the active tab and update the URL query string accordingly. This
   * keeps the UI state in sync with the router so that the tab selection
   * persists across page reloads and can be shared via URL.
   */
  const handleTabChange = (tab: "worldA" | "portal" | "worldB" | "cia") => {
    setActiveTab(tab)
    // Build a new URLSearchParams object from the existing parameters. We
    // preserve any other parameters that might be present and overwrite
    // `tab`.
    const params = new URLSearchParams(searchParams ? Array.from(searchParams.entries()) : [])
    params.set("tab", tab)
    // Use router.push to update the URL without a full page reload. The
    // `scroll: false` option prevents scrolling to the top when switching
    // tabs.
    router.push(`?${params.toString()}`, { scroll: false })
  }

  return (
    <main className="min-h-screen bg-[#0a1628] text-white pb-24">
      <LuminaHeader buligRank={buligRank} />

      {activeTab === "worldA" && <WorldAView logs={logs} onAddLog={() => setShowAddModal(true)} />}
      {activeTab === "portal" && <PortalView logs={logs} buligRank={buligRank} />}
      {activeTab === "worldB" && (
        <WorldBView
          buligRank={buligRank}
          ciaProfile={ciaProfile}
          disclosures={disclosures}
          onCreateDisclosure={() => setShowDisclosureModal(true)}
          onRevokeDisclosure={handleRevokeDisclosure}
          onAccessDisclosure={handleAccessDisclosure}
        />
      )}
      {activeTab === "cia" && <CIAView ciaProfile={ciaProfile} logs={logs} />}

      <BottomNavLumina activeTab={activeTab} onTabChange={handleTabChange} />

      {showAddModal && <ActionLogModal onAdd={handleAddLog} onClose={() => setShowAddModal(false)} />}

      {showDisclosureModal && (
        <DisclosureModal onAdd={handleAddDisclosure} onClose={() => setShowDisclosureModal(false)} />
      )}
    </main>
  )
}
