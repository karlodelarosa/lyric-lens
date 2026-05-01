import type { Metadata } from "next";
import "../src/styles/index.css";

export const metadata: Metadata = {
  title: "Lyric Lens",
  description: "Lyric Lens powered by Next.js App Router",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
