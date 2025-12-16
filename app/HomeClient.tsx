"use client";


export default function HomeClient() {
  const [state, setState] = useState<any>(null);

  useEffect(() => {
    fetchHomeState().then(setState).catch(console.error);
  }, []);

  if (!state) return <p>Loading...</p>;

  // 以下 UI …
}
