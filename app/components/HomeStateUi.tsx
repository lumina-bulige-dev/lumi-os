type Props = {
  balance: number;
};

export default function HomeStateUi({ balance }: Props) {
  return (
    <section className="space-y-2 text-sm text-slate-100">
      <p className="text-xs text-slate-400">
        ※ この画面はデモ用です。実際のお金・口座情報は一切扱いません。
      </p>
      <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-3">
        <div className="text-xs text-slate-400 mb-1">サンプル残高</div>
        <div className="text-xl font-semibold">
          ¥{balance.toLocaleString()}
        </div>
      </div>
    </section>
  );
}
