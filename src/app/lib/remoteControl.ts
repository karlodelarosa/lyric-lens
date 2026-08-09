import {
  createClient,
  type RealtimeChannel,
  type SupabaseClient,
} from "@supabase/supabase-js";

const REMOTE_CHANNEL_PREFIX = "lyric-lens-remote-";
const PIN_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const PIN_LENGTH = 6;

let cachedClient: SupabaseClient | null = null;

function getRealtimeClient(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Realtime is not configured for this deployment");
  }

  cachedClient = createClient(url, key, {
    auth: { persistSession: false },
  });
  return cachedClient;
}

export function generateRemotePin(): string {
  let pin = "";
  for (let i = 0; i < PIN_LENGTH; i++) {
    pin += PIN_ALPHABET[Math.floor(Math.random() * PIN_ALPHABET.length)];
  }
  return pin;
}

export function normalizeRemotePin(pin: string): string {
  return pin.trim().toUpperCase();
}

export function isValidRemotePin(pin: string): boolean {
  const normalized = normalizeRemotePin(pin);
  return new RegExp(`^[${PIN_ALPHABET}]{${PIN_LENGTH}}$`).test(normalized);
}

export function joinRemoteChannel(pin: string): RealtimeChannel {
  const client = getRealtimeClient();
  return client.channel(`${REMOTE_CHANNEL_PREFIX}${normalizeRemotePin(pin)}`, {
    config: { broadcast: { self: false, ack: false } },
  });
}

export const REMOTE_COMMAND_EVENT = "command";
export const REMOTE_STATUS_EVENT = "status";

export type RemoteCommand = "next" | "previous" | "clear";

export type RemoteCommandPayload = {
  command: RemoteCommand;
};

export type RemoteStatusPayload = {
  active: boolean;
  title: string | null;
  subtitle: string | null;
};
