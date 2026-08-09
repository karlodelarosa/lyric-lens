import { useEffect, useState } from "react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { useOrganization } from "@frontend/contexts/OrganizationContext";
import { useApp } from "../../contexts/AppContext";
import {
  getTrashedSongs,
  purgeSong,
  restoreSong,
  type TrashedSongDto,
} from "@frontend/lib/api/songs";
import {
  getTrashedSetlists,
  purgeSetlist,
  restoreSetlist,
  type TrashedSetlistDto,
} from "@frontend/lib/api/setlists";
import { Trash2, RotateCcw, Music, List } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { toast } from "sonner";

export function Trash() {
  const { activeOrganizationId, isLoading: isOrgLoading } = useOrganization();
  const { refreshSongs, refreshSetlists } = useApp();
  const [trashedSongs, setTrashedSongs] = useState<TrashedSongDto[]>([]);
  const [trashedSetlists, setTrashedSetlists] = useState<TrashedSetlistDto[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);

  const loadTrash = async () => {
    if (!activeOrganizationId) return;
    setIsLoading(true);
    try {
      const [{ songs }, { setlists }] = await Promise.all([
        getTrashedSongs(activeOrganizationId),
        getTrashedSetlists(activeOrganizationId),
      ]);
      setTrashedSongs(songs);
      setTrashedSetlists(setlists);
    } catch {
      toast.error("Failed to load trash");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadTrash();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeOrganizationId]);

  const handleRestoreSong = async (song: TrashedSongDto) => {
    if (!activeOrganizationId) return;
    try {
      await restoreSong(activeOrganizationId, song.id);
      setTrashedSongs((prev) => prev.filter((s) => s.id !== song.id));
      await refreshSongs();
      toast.success(`"${song.title}" restored`);
    } catch {
      toast.error("Failed to restore song");
    }
  };

  const handlePurgeSong = async (song: TrashedSongDto) => {
    if (!activeOrganizationId) return;
    if (!confirm(`Permanently delete "${song.title}"? This can't be undone.`))
      return;

    try {
      await purgeSong(activeOrganizationId, song.id);
      setTrashedSongs((prev) => prev.filter((s) => s.id !== song.id));
      toast.success("Song permanently deleted");
    } catch {
      toast.error("Failed to permanently delete song");
    }
  };

  const handleRestoreSetlist = async (setlist: TrashedSetlistDto) => {
    if (!activeOrganizationId) return;
    try {
      await restoreSetlist(activeOrganizationId, setlist.id);
      setTrashedSetlists((prev) => prev.filter((s) => s.id !== setlist.id));
      await refreshSetlists();
      toast.success(`"${setlist.title}" restored`);
    } catch {
      toast.error("Failed to restore setlist");
    }
  };

  const handlePurgeSetlist = async (setlist: TrashedSetlistDto) => {
    if (!activeOrganizationId) return;
    if (
      !confirm(`Permanently delete "${setlist.title}"? This can't be undone.`)
    )
      return;

    try {
      await purgeSetlist(activeOrganizationId, setlist.id);
      setTrashedSetlists((prev) => prev.filter((s) => s.id !== setlist.id));
      toast.success("Setlist permanently deleted");
    } catch {
      toast.error("Failed to permanently delete setlist");
    }
  };

  const isEmpty = trashedSongs.length === 0 && trashedSetlists.length === 0;

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Trash2 className="w-8 h-8" />
          Trash
        </h1>
        <p className="text-muted-foreground mt-1">
          Deleted songs and setlists stay here until you restore or
          permanently delete them.
        </p>
      </div>

      {!isOrgLoading && !activeOrganizationId ? (
        <p className="text-sm text-muted-foreground">
          Select an organization to view its trash.
        </p>
      ) : isLoading ? (
        <p className="text-sm text-muted-foreground">Loading trash...</p>
      ) : isEmpty ? (
        <p className="text-sm text-muted-foreground">Trash is empty.</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Music className="w-4 h-4" />
                Songs ({trashedSongs.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {trashedSongs.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No songs in trash.
                </p>
              ) : (
                trashedSongs.map((song) => (
                  <div
                    key={song.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-lg border"
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">{song.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {song.artist || "Unknown artist"} · Deleted{" "}
                        {formatDistanceToNow(parseISO(song.deletedAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        title="Restore"
                        onClick={() => handleRestoreSong(song)}
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        title="Delete forever"
                        onClick={() => handlePurgeSong(song)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <List className="w-4 h-4" />
                Setlists ({trashedSetlists.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {trashedSetlists.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No setlists in trash.
                </p>
              ) : (
                trashedSetlists.map((setlist) => (
                  <div
                    key={setlist.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-lg border"
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">{setlist.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        Deleted{" "}
                        {formatDistanceToNow(parseISO(setlist.deletedAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        title="Restore"
                        onClick={() => handleRestoreSetlist(setlist)}
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        title="Delete forever"
                        onClick={() => handlePurgeSetlist(setlist)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
