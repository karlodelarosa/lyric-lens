"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";

type Song = {
  id: string;
  title: string;
  artist: string;
};

export default function SupabaseClientExamplePage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      const supabase = createClient();
      const { data, error: queryError } = await supabase
        .from("songs")
        .select("id, title, artist")
        .limit(10);

      if (queryError) {
        setError(queryError.message);
        return;
      }

      setSongs(data ?? []);
    };

    void run();
  }, []);

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Supabase Browser Query Example</h1>
      {error ? (
        <p>Query failed: {error}</p>
      ) : (
        <pre>{JSON.stringify(songs, null, 2)}</pre>
      )}
    </main>
  );
}
