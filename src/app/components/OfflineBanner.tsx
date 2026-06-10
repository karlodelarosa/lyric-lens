"use client";

import { useApp } from "../contexts/AppContext";
import { useOnlineStatus } from "../lib/useOnlineStatus";

export function OfflineBanner() {
  const isOnline = useOnlineStatus();
  const { isUsingOfflineCache } = useApp();

  if (isOnline) return null;

  return (
    <div
      className="shrink-0 w-full bg-red-600 text-white text-sm font-semibold text-center py-1.5 shadow-md"
      role="status"
      aria-live="polite"
    >
      OFFLINE MODE
      {isUsingOfflineCache ? " — using cached setlists" : ""}
    </div>
  );
}
