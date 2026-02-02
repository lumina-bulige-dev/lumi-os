// luminabulige_app/app/finance-chat/page.tsx
'use client';

export default function FinanceChatPage() {
  return (
    <div style={{ height: '100vh' }}>
      <iframe
        src="https://v0-finance-app-wheat-theta.vercel.app/"
        style={{ width: '100%', height: '100%', border: 'none' }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        loading="lazy"
      />
    </div>
  );
}
