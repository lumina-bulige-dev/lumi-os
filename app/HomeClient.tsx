if (!state) return <p>Loading...</p>;
return (
  <div>
    <pre>{JSON.stringify(state, null, 2)}</pre>
  </div>
);
