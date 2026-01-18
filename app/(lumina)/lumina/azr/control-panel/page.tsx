"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

type Env = "prod" | "stage";
type Target = "app" | "verify" | "api" | "info";

type GuardrailLevel = "GREEN" | "YELLOW" | "RED";
async function handleApprove(manifestPreview: unknown) {
  // stub gate (human-only)
  const approver = window.prompt("Approver（例: admin@luminabulige.com）") || "";
  if (!approver.trim()) return;

  const otp = window.prompt("OTP（6桁以上。今はstub）") || "";
  if (otp.trim().length < 6) {
    alert("OTPが短すぎます（6桁以上）");
    return;
  }

  try {
    const res = await fetch("/api/decisions/approve", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-lumina-approver": approver.trim(),
        "x-lumina-otp": otp.trim(),
      },
      body: JSON.stringify(manifestPreview),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      alert(`Approve failed: ${res.status}\n${JSON.stringify(data, null, 2)}`);
      return;
    }

    alert(`Approved ✅\n${JSON.stringify(data, null, 2)}`);
  } catch (e: any) {
    alert(`Network error: ${e?.message ?? String(e)}`);
  }
}
function computeGuardrail(input: {
  env: Env;
  targets: Target[];
  maintenanceEnabled: boolean;
  reasonSummary: string;
}): { level: GuardrailLevel; messages: string[] } {
  const messages: string[] = [];

  if (input.targets.length === 0) messages.push("Targets が未選択です。");
  if (!input.reasonSummary.trim()) messages.push("reason.summary が空です。監査上NG。");

  // prodでmaintenanceをONにする時は、理由が薄いと事故りがち → Yellow
  if (input.env === "prod" && input.maintenanceEnabled && input.reasonSummary.trim().length < 10) {
    messages.push("prodでMaintenanceを有効化します。理由をもう少し具体化してください。");
  }

  // Red条件（最低限）
  const isRed = input.targets.length === 0 || !input.reasonSummary.trim();
  if (isRed) return { level: "RED", messages: messages.length ? messages : ["必須項目が不足しています。"] };

  // Yellow条件
  const isYellow = messages.length > 0;
  if (isYellow) return { level: "YELLOW", messages };

  return { level: "GREEN", messages: ["OK（承認可能）"] };
}

export default function ControlPanelPage() {
  const [env, setEnv] = React.useState<Env>("stage");
  const [targets, setTargets] = React.useState<Target[]>(["verify"]);
  const [maintenanceEnabled, setMaintenanceEnabled] = React.useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = React.useState("メンテナンス中です。しばらくお待ちください。");

  // Feature flags（最小の例）
  const [flagVerifyViewOnly, setFlagVerifyViewOnly] = React.useState(true);
  const [flagCicOnly, setFlagCicOnly] = React.useState(true);

  // Policy text（最小の例）
  const [policyIntegrityOnly, setPolicyIntegrityOnly] = React.useState(true);
  const [policyTruthfulnessNotAttested, setPolicyTruthfulnessNotAttested] = React.useState(true);
  const [policyVerifyNotDecider, setPolicyVerifyNotDecider] = React.useState(true);

  // Reason / Rollback
  const [reasonCode, setReasonCode] = React.useState("OPS_UPDATE");
  const [reasonSummary, setReasonSummary] = React.useState("安全性・監査性の更新（下書き）");
  const [rollbackStrategy, setRollbackStrategy] = React.useState<"revert_to_previous" | "pinned_previous_id">(
    "revert_to_previous"
  );
  const [safeWindowMinutes, setSafeWindowMinutes] = React.useState(60);

  const guardrail = React.useMemo(
    () =>
      computeGuardrail({
        env,
        targets,
        maintenanceEnabled,
        reasonSummary,
      }),
    [env, targets, maintenanceEnabled, reasonSummary]
  );

  const manifestPreview = React.useMemo(() => {
    const issuedAt = new Date().toISOString();

    return {
      schema: "lumi.decision_manifest.v0.1",
      decision_id: "dec_DRAFT",
      issued_at: issuedAt,
      scope: {
        targets,
        environment: env,
      },
      change: {
        maintenance_mode: {
          enabled: maintenanceEnabled,
          message: maintenanceEnabled ? maintenanceMessage : "",
        },
        feature_flags: {
          verify_view_only: flagVerifyViewOnly,
          cic_only: flagCicOnly,
        },
        policy_text: {
          integrity_only: policyIntegrityOnly,
          truthfulness_not_attested: policyTruthfulnessNotAttested,
          verify_not_a_decider: policyVerifyNotDecider,
        },
      },
      reason: {
        code: reasonCode,
        summary: reasonSummary,
      },
      rollback: {
        strategy: rollbackStrategy,
        safe_window_minutes: safeWindowMinutes,
      },
      audit: {
        // ここは approve 後に revocation_ref 等が入る想定
        notes: "non-PII",
      },
    };
  }, [
    env,
    targets,
    maintenanceEnabled,
    maintenanceMessage,
    flagVerifyViewOnly,
    flagCicOnly,
    policyIntegrityOnly,
    policyTruthfulnessNotAttested,
    policyVerifyNotDecider,
    reasonCode,
    reasonSummary,
    rollbackStrategy,
    safeWindowMinutes,
  ]);

  const canApprove = guardrail.level !== "RED";

  const guardrailVariant =
    guardrail.level === "GREEN" ? "default" : guardrail.level === "YELLOW" ? "default" : "destructive";

  return (
    <div className="mx-auto w-full max-w-6xl p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">AZR Control Panel</h1>
          <p className="text-sm text-muted-foreground">
            決定（Decision Manifest）を下書き → ガードレール → 人間がApprove（※まだ未接続）
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">env: {env}</Badge>
          <Badge variant="outline">targets: {targets.length}</Badge>
        </div>
      </div>

      <Separator />

      {/* Target & Env */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <div className="text-sm font-medium">Environment</div>
          <Select value={env} onValueChange={(v) => setEnv(v as Env)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select env" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="stage">stage</SelectItem>
              <SelectItem value="prod">prod</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">Targets</div>
          <ToggleGroup
            type="multiple"
            value={targets}
            onValueChange={(vals) => setTargets(vals as Target[])}
            className="justify-start flex-wrap"
          >
            <ToggleGroupItem value="app" aria-label="app">
              app
            </ToggleGroupItem>
            <ToggleGroupItem value="verify" aria-label="verify">
              verify
            </ToggleGroupItem>
            <ToggleGroupItem value="api" aria-label="api">
              api
            </ToggleGroupItem>
            <ToggleGroupItem value="info" aria-label="info">
              info
            </ToggleGroupItem>
          </ToggleGroup>
          <p className="text-xs text-muted-foreground">
            ※ Verify は「第三者検証UI」であり判断主体ではない。Proofは改ざん検知で真実性ではない。
          </p>
        </div>
      </div>

      <Separator />

      {/* Changes */}
      <Tabs defaultValue="maintenance" className="w-full">
        <TabsList>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="flags">Feature Flags</TabsTrigger>
          <TabsTrigger value="policy">Policy Text</TabsTrigger>
          <TabsTrigger value="reason">Reason / Rollback</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="maintenance" className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium">Maintenance Mode</div>
              <div className="text-xs text-muted-foreground">対象サービスを一時停止（表示は各サービス側で適用）</div>
            </div>
            <Switch checked={maintenanceEnabled} onCheckedChange={setMaintenanceEnabled} />
          </div>
          <Textarea
            value={maintenanceMessage}
            onChange={(e) => setMaintenanceMessage(e.target.value)}
            placeholder="メンテメッセージ"
            disabled={!maintenanceEnabled}
          />
        </TabsContent>

        <TabsContent value="flags" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">verify_view_only</div>
              <div className="text-xs text-muted-foreground">Verifyを閲覧専用に固定</div>
            </div>
            <Switch checked={flagVerifyViewOnly} onCheckedChange={setFlagVerifyViewOnly} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">cic_only</div>
              <div className="text-xs text-muted-foreground">CICのみ（v0.1）</div>
            </div>
            <Switch checked={flagCicOnly} onCheckedChange={setFlagCicOnly} />
          </div>
        </TabsContent>

        <TabsContent value="policy" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">integrity_only</div>
              <div className="text-xs text-muted-foreground">署名は改ざん検知（真実性ではない）</div>
            </div>
            <Switch checked={policyIntegrityOnly} onCheckedChange={setPolicyIntegrityOnly} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">truthfulness_not_attested</div>
              <div className="text-xs text-muted-foreground">内容の真偽保証をしない</div>
            </div>
            <Switch checked={policyTruthfulnessNotAttested} onCheckedChange={setPolicyTruthfulnessNotAttested} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">verify_not_a_decider</div>
              <div className="text-xs text-muted-foreground">Verifyは判断主体ではない</div>
            </div>
            <Switch checked={policyVerifyNotDecider} onCheckedChange={setPolicyVerifyNotDecider} />
          </div>
        </TabsContent>

        <TabsContent value="reason" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="text-sm font-medium">reason.code</div>
              <Select value={reasonCode} onValueChange={setReasonCode}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select reason code" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPS_UPDATE">OPS_UPDATE</SelectItem>
                  <SelectItem value="SECURITY_UPDATE">SECURITY_UPDATE</SelectItem>
                  <SelectItem value="INCIDENT_RESPONSE">INCIDENT_RESPONSE</SelectItem>
                  <SelectItem value="COPY_CHANGE">COPY_CHANGE</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">rollback.strategy</div>
              <Select value={rollbackStrategy} onValueChange={(v) => setRollbackStrategy(v as any)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select rollback" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revert_to_previous">revert_to_previous</SelectItem>
                  <SelectItem value="pinned_previous_id">pinned_previous_id</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Rollbackが無い決定は承認不可（事故防止）</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">reason.summary</div>
            <Textarea value={reasonSummary} onChange={(e) => setReasonSummary(e.target.value)} />
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">safe_window_minutes</div>
            <Textarea
              value={String(safeWindowMinutes)}
              onChange={(e) => setSafeWindowMinutes(Number(e.target.value || "0"))}
              placeholder="60"
            />
            <p className="text-xs text-muted-foreground">後で number input にしてOK。いまは雛形優先。</p>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Alert variant={guardrailVariant as any}>
            <AlertTitle>Guardrail: {guardrail.level}</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-5 space-y-1">
                {guardrail.messages.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <div className="text-sm font-medium">Decision Manifest (Draft)</div>
            <pre className="rounded-md border bg-muted p-3 text-xs overflow-auto max-h-[420px]">
              {JSON.stringify(manifestPreview, null, 2)}
            </pre>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => navigator.clipboard.writeText(JSON.stringify(manifestPreview, null, 2))}
              >
                Copy JSON
              <Button
  variant="default"
  disabled={!canApprove}
  onClick={() => handleApprove(manifestPreview)}
>
  Approve (stub)
</Button>
            </div>
            {!canApprove && (
              <p className="text-xs text-muted-foreground">
                Redの場合は承認不可。必須項目を埋めて Guardrail を Green/Yellow にしてください。
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
