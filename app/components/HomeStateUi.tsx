// app/components/HomeStateUi.tsx
type Props = {
  balance: number;
};

export default function HomeStateUi({ balance }: Props) {
  return <div>残高: ¥{balance.toLocaleString()}</div>;
}
