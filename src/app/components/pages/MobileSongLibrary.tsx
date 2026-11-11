import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "@frontend/contexts/AuthContext";
import { useOrganization } from "@frontend/contexts/OrganizationContext";
import {
  AlertCircle,
  ChevronRight,
  Library,
  LogOut,
  Monitor,
  Music2,
  Plus,
  RefreshCw,
  Search,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { useApp, type NewSongInput } from "../../contexts/AppContext";
import { filterMobileSongs } from "../../lib/mobileSongUtils";
import { OfflineBanner } from "../OfflineBanner";
import { MobileSongDetail } from "../mobile-songs/MobileSongDetail";
import { MobileSongForm } from "../mobile-songs/MobileSongForm";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export function MobileSongLibrary() {
  const { user, isLoading: isAuthLoading, logout } = useAuth();
  const {
    organizations,
    activeOrganization,
    activeOrganizationId,
    setActiveOrganizationId,
    isLoading: isOrgLoading,
    loadError: orgLoadError,
    refresh: refreshOrganizations,
  } = useOrganization();
  const {
    songs,
    songsLoading,
    songsError,
    refreshSongs,
    addSong,
    updateSong,
    deleteSong,
  } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
  const [formSongId, setFormSongId] = useState<"new" | string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const previousOrganizationId = useRef(activeOrganizationId);

  useEffect(() => {
    if (previousOrganizationId.current === activeOrganizationId) return;
    previousOrganizationId.current = activeOrganizationId;
    setSelectedSongId(null);
    setFormSongId(null);
    setSearchQuery("");
  }, [activeOrganizationId]);

  const filteredSongs = useMemo(
    () => filterMobileSongs(songs, searchQuery),
    [songs, searchQuery],
  );
  const selectedSong = songs.find((song) => song.id === selectedSongId);
  const formSong =
    formSongId && formSongId !== "new"
      ? songs.find((song) => song.id === formSongId)
      : undefined;

  const saveSong = async (input: NewSongInput) => {
    if (formSongId === "new") {
      await addSong(input);
      toast.success("Song added");
      setFormSongId(null);
      return;
    }

    if (!formSongId) throw new Error("Choose a song to edit");
    await updateSong(formSongId, input);
    toast.success("Song updated");
    setFormSongId(null);
  };

  const removeSelectedSong = async () => {
    if (!selectedSong) return;
    if (!window.confirm(`Delete “${selectedSong.title}”? You can undo this.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteSong(selectedSong.id);
      setSelectedSongId(null);
    } catch {
      toast.error("Failed to delete song");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isAuthLoading)
    return <MobileLoadingScreen label="Checking your account…" />;

  if (!user) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-muted/30 p-6">
        <div className="w-full max-w-sm space-y-5 rounded-xl border bg-card p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Music2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Sign in to manage songs</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Use your Lyric Lens account to access your organization’s library.
            </p>
          </div>
          <Button asChild className="h-12 w-full">
            <a href="/login">Go to sign in</a>
          </Button>
        </div>
      </main>
    );
  }

  if (formSongId && (formSongId === "new" || formSong)) {
    return (
      <MobileSongForm
        key={formSongId}
        song={formSong}
        onCancel={() => setFormSongId(null)}
        onSave={saveSong}
      />
    );
  }

  if (selectedSong) {
    return (
      <MobileSongDetail
        song={selectedSong}
        isDeleting={isDeleting}
        onBack={() => setSelectedSongId(null)}
        onEdit={() => setFormSongId(selectedSong.id)}
        onDelete={() => void removeSelectedSong()}
      />
    );
  }

  return (
    <div className="min-h-[100dvh] bg-muted/30">
      <OfflineBanner />
      <div className="mx-auto flex min-h-[100dvh] max-w-xl flex-col border-x bg-background shadow-sm">
        <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
          <div className="flex h-16 items-center gap-3 px-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary text-primary-foreground">
              {activeOrganization?.logoUrl ? (
                <img
                  src={activeOrganization.logoUrl}
                  alt=""
                  className="h-full w-full object-contain"
                />
              ) : (
                <Library className="h-5 w-5" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Lyric Lens mobile
              </p>
              <h1 className="truncate text-lg font-semibold">Songs</h1>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-11 w-11"
                  aria-label="Open account menu"
                >
                  <UserRound className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <span className="block truncate">{user.displayName}</span>
                  <span className="block truncate text-xs font-normal text-muted-foreground">
                    {user.email}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/songs">
                    <Monitor className="h-4 w-4" />
                    Open desktop library
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => void logout()}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 space-y-5 px-4 py-5 pb-28">
          {organizations.length > 1 && (
            <div className="space-y-2">
              <label
                htmlFor="mobile-organization"
                className="text-sm font-medium"
              >
                Organization
              </label>
              <Select
                value={activeOrganizationId ?? undefined}
                onValueChange={setActiveOrganizationId}
              >
                <SelectTrigger id="mobile-organization" className="h-12 w-full">
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((organization) => (
                    <SelectItem key={organization.id} value={organization.id}>
                      {organization.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {activeOrganization?.name || "Your organization"}
            </p>
            <p className="text-2xl font-bold">
              {songsLoading ? "Loading songs…" : `${songs.length} songs`}
            </p>
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search title, artist, or tag"
              aria-label="Search songs"
              className="h-12 pl-11 text-base"
            />
          </div>

          {orgLoadError && (
            <MobileErrorState
              message={orgLoadError}
              onRetry={refreshOrganizations}
            />
          )}

          {!isOrgLoading && !orgLoadError && !activeOrganizationId && (
            <div className="rounded-xl border border-dashed p-6 text-center">
              <AlertCircle className="mx-auto h-7 w-7 text-muted-foreground" />
              <h2 className="mt-3 font-semibold">No organization available</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Join or create an organization from your desktop profile first.
              </p>
            </div>
          )}

          {songsError && activeOrganizationId && (
            <MobileErrorState message={songsError} onRetry={refreshSongs} />
          )}

          {songsLoading ? (
            <SongListSkeleton />
          ) : activeOrganizationId &&
            !songsError &&
            filteredSongs.length > 0 ? (
            <ul className="divide-y overflow-hidden rounded-xl border bg-card">
              {filteredSongs.map((song) => (
                <li key={song.id}>
                  <button
                    type="button"
                    className="flex min-h-20 w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                    onClick={() => setSelectedSongId(song.id)}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Music2 className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="break-words font-semibold leading-snug">
                        {song.title}
                      </p>
                      <p className="mt-0.5 truncate text-sm text-muted-foreground">
                        {song.artist || "No artist listed"}
                      </p>
                      {song.tags.length > 0 && (
                        <div className="mt-2 flex gap-1 overflow-hidden">
                          {song.tags.slice(0, 2).map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="max-w-28 truncate"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                  </button>
                </li>
              ))}
            </ul>
          ) : activeOrganizationId && !songsError ? (
            <div className="rounded-xl border border-dashed p-8 text-center">
              <Music2 className="mx-auto h-8 w-8 text-muted-foreground" />
              <h2 className="mt-3 font-semibold">
                {searchQuery ? "No matching songs" : "No songs yet"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchQuery
                  ? "Try another title, artist, or tag."
                  : "Add the first song to this organization’s library."}
              </p>
            </div>
          ) : null}
        </main>

        <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur">
          <div className="mx-auto max-w-xl">
            <Button
              className="h-12 w-full text-base"
              disabled={!activeOrganizationId || isOrgLoading}
              onClick={() => setFormSongId("new")}
            >
              <Plus className="mr-2 h-5 w-5" />
              Add song
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileLoadingScreen({ label }: { label: string }) {
  return (
    <main
      className="flex min-h-[100dvh] items-center justify-center bg-background p-6"
      role="status"
      aria-live="polite"
    >
      <div className="text-center">
        <RefreshCw className="mx-auto h-7 w-7 animate-spin text-primary" />
        <p className="mt-3 text-sm text-muted-foreground">{label}</p>
      </div>
    </main>
  );
}

function MobileErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => Promise<void>;
}) {
  return (
    <div role="alert" className="rounded-xl border border-destructive/30 p-4">
      <div className="flex gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
        <div className="min-w-0 flex-1">
          <p className="font-medium">Could not load songs</p>
          <p className="mt-1 break-words text-sm text-muted-foreground">
            {message}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => void onRetry()}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
}

function SongListSkeleton() {
  return (
    <div
      className="divide-y overflow-hidden rounded-xl border"
      role="status"
      aria-label="Loading songs"
    >
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex h-20 items-center gap-3 px-4">
          <div className="h-10 w-10 animate-pulse rounded-lg bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
