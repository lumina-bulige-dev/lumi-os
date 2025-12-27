import MoneyStabilizer from "@/app/components/MoneyStabilizer";
type LogKind = "INCOME" | "EXPENSE";

type LogItem = {
  id: string;
  occurredAt: number;
  createdAt: number;
  kind: LogKind;      // ★追加
  parent: ParentKey;
  child: string;
  amount: number;     // 常に正数でOK（kindで符号を決める）
  memo?: string;
  placeTag?: "home" | "work" | "move" | "other";
};
const STORAGE_KEY = "lumi_compare_v2";

const [openingBalance, setOpeningBalance] = useState<number>(0);
const [kind, setKind] = useState<LogKind>("EXPENSE");

useEffect(() => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      if (typeof parsed.openingBalance === "number") setOpeningBalance(parsed.openingBalance);
      if (Array.isArray(parsed.logs)) setLogs(parsed.logs);
    }
  } catch {}
}, []);

useEffect(() => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ openingBalance, logs }));
  } catch {}
}, [openingBalance, logs]);

function addLog() {
  const amt = Number(amount);
  if (!Number.isFinite(amt) || amt <= 0) return;
  const now = Date.now();
  const occurredAt = fromDatetimeLocal(occurredAtInput);

  const item: LogItem = {
    id: uuid(),
    createdAt: now,
    occurredAt,
    kind,               // ★追加
    parent,
    child,
    amount: Math.round(amt),
    memo: memo.trim() ? memo.trim() : undefined,
    placeTag,
  };

  setLogs((prev) => [item, ...prev].sort((a, b) => b.occurredAt - a.occurredAt));
  setAmount("");
  setMemo("");
}

const summary = useMemo(() => {
  const incomesTotal = logs.filter(x => x.kind === "INCOME").reduce((s, x) => s + x.amount, 0);
  const expensesTotal = logs.filter(x => x.kind === "EXPENSE").reduce((s, x) => s + x.amount, 0);
  const total = expensesTotal; // “使った合計”を total とするならこう

  const balance = openingBalance + incomesTotal - expensesTotal;

  return { incomesTotal, expensesTotal, total, balance };
}, [logs, openingBalance]);



export default function ComparePage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <MoneyStabilizer />
    </main>
  );
}
