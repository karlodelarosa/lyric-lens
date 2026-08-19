import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { ChevronLeft, ChevronRight, Eraser, Radio } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  isValidRemotePin,
  joinRemoteChannel,
  normalizeRemotePin,
  REMOTE_COMMAND_EVENT,
  REMOTE_STATUS_EVENT,
  type RemoteCommand,
  type RemoteStatusPayload,
} from "../../lib/remoteControl";

type ConnectionState = "idle" | "connecting" | "connected" | "error";

export function RemoteControl() {
  const { code } = useParams<{ code?: string }>();
  const [pinInput, setPinInput] = useState(code ? code.toUpperCase() : "");
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("idle");
  const [status, setStatus] = useState<RemoteStatusPayload | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const connectedPinRef = useRef<string | null>(null);

  const disconnect = () => {
    channelRef.current?.unsubscribe();
    channelRef.current = null;
    connectedPinRef.current = null;
    setStatus(null);
  };

  const connect = (pin: string) => {
    if (!isValidRemotePin(pin)) {
      setConnectionState("error");
      return;
    }

    disconnect();
    setConnectionState("connecting");

    const channel = joinRemoteChannel(pin);
    channel
      .on(
        "broadcast",
        { event: REMOTE_STATUS_EVENT },
        ({ payload }: { payload: RemoteStatusPayload }) => {
          setStatus(payload);
        },
      )
      .subscribe((subscribeStatus) => {
        if (subscribeStatus === "SUBSCRIBED") {
          setConnectionState("connected");
        } else if (
          subscribeStatus === "CHANNEL_ERROR" ||
          subscribeStatus === "TIMED_OUT"
        ) {
          setConnectionState("error");
        }
      });

    channelRef.current = channel;
    connectedPinRef.current = normalizeRemotePin(pin);
  };

  useEffect(() => {
    if (code && isValidRemotePin(code)) {
      connect(code);
    }
    return () => disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const sendCommand = (command: RemoteCommand) => {
    channelRef.current?.send({
      type: "broadcast",
      event: REMOTE_COMMAND_EVENT,
      payload: { command },
    });
  };

  const handleConnectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    connect(pinInput);
  };

  if (connectionState !== "connected") {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black text-white p-6">
        <form
          onSubmit={handleConnectSubmit}
          className="w-full max-w-xs space-y-4 text-center"
        >
          <Radio className="w-10 h-10 mx-auto opacity-70" />
          <h1 className="text-xl font-semibold">Lyric Lens Remote</h1>
          <p className="text-sm text-white/60">
            Enter the 6-character code shown on the operator's screen.
          </p>
          <Input
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value.toUpperCase())}
            placeholder="ABC123"
            maxLength={6}
            className="text-center text-2xl tracking-[0.3em] uppercase bg-white/10 border-white/20 text-white placeholder:text-white/30"
            autoFocus
          />
          {connectionState === "error" && (
            <p className="text-sm text-red-400">
              Couldn't connect — check the code and try again.
            </p>
          )}
          <Button
            type="submit"
            className="w-full"
            disabled={connectionState === "connecting"}
          >
            {connectionState === "connecting" ? "Connecting..." : "Connect"}
          </Button>
        </form>
      </div>
    );
  }

  const isSessionActive = status?.active ?? false;

  return (
    <div className="w-screen h-screen flex flex-col bg-black text-white">
      <div className="p-4 border-b border-white/10 text-center">
        {isSessionActive ? (
          <>
            <p className="text-lg font-semibold truncate">
              {status?.title ?? "Live"}
            </p>
            {status?.subtitle && (
              <p className="text-sm text-white/60 truncate">
                {status.subtitle}
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-white/50">
            Connected — waiting for the operator...
          </p>
        )}
      </div>

      <div className="flex-1 flex flex-col gap-3 p-4 min-h-0">
        <div className="flex-1 grid grid-rows-2 gap-3 min-h-0">
          <Button
            className="h-full text-lg"
            variant="outline"
            onClick={() => sendCommand("previous")}
          >
            <ChevronLeft className="w-8 h-8" />
          </Button>
          <Button
            className="h-full text-lg"
            variant="outline"
            onClick={() => sendCommand("next")}
          >
            <ChevronRight className="w-8 h-8" />
          </Button>
        </div>

        <Button
          className="h-12 py-4 text-lg flex-none"
          variant="outline"
          onClick={() => sendCommand("clear")}
        >
          <Eraser className="w-6 h-6 mr-2" />
          Clear screen
        </Button>
      </div>
    </div>
  );
}
