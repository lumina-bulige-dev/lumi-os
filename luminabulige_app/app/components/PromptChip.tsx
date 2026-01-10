// app/components/PromptChip.tsx
type Props = { text?: string };

export default function PromptChip({ text }: Props) {
  if (!text) return null;
  return (
    <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
      <span className="opacity-80">💬</span>
      <span>{text}</span>
    </div>
  );
}
