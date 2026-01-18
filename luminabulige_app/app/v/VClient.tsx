"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { LuminaHeader } from "@/components/lumina/header";
import { WorldAView } from "@/components/lumina/world-a-view";
import { PortalView } from "@/components/lumina/portal-view";
import { WorldBView } from "@/components/lumina/world-b-view";
import { CIAView } from "@/components/lumina/cia-view";
import { BottomNavLumina } from "@/components/lumina/bottom-nav";
import { ActionLogModal } from "@/components/lumina/action-log-modal";
import { DisclosureModal } from "@/components/lumina/disclosure-modal";

// （以下、型定義とINITIAL_*はそのまま貼る）
// export type ActionLog = {...} etc...
// const INITIAL_LOGS = [...]
//
// 最後だけ関数名を変える↓

export default function VClient() {
  // ここからあなたの Home() の中身をそのまま
  // ...
}
