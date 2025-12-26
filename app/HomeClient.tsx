"use client";

type Props = {
  balance: number;
};

function HomeStateUi({ balance }: Props) {
  return <div>残高: ¥{balance.toLocaleString()}</div>;
}

export default function HomeClient() {
  const balance = 123456;

  return (
    <main className="p-4">
      <HomeStateUi balance={balance} />
    </main>
  );
}
