import { createClient } from "../../lib/supabase/server";

export default async function SupabaseExamplePage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("songs")
    .select("id, title, artist")
    .limit(10);

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Supabase Server Query Example</h1>
      {error ? (
        <p>Query failed: {error.message}</p>
      ) : (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      )}
    </main>
  );
}
