import { useMemo, useState } from "react";
import { usePagination } from "../../lib/usePagination";
import { ListPagination } from "../ListPagination";
import { useOrganization } from "@frontend/contexts/OrganizationContext";
import {
  useApp,
  type SetlistFlowSectionInput,
  type WelcomeSlide,
} from "../../contexts/AppContext";
import {
  uploadWelcomeSlide,
  WELCOME_SLIDE_ACCEPT,
  WELCOME_SLIDE_MAX_BYTES,
} from "@frontend/lib/api/welcomeSlides";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  ArrowLeft,
  Check,
  Download,
  Edit,
  GripVertical,
  ListMusic,
  Plus,
  Trash2,
  Save,
  Search,
  Upload,
} from "lucide-react";
import { OfflineSetlistBadge } from "../OfflineSetlistBadge";
import { useOnlineStatus } from "../../lib/useOnlineStatus";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../ui/tooltip";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Label } from "../ui/label";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { cn } from "../../lib/utils";

interface DraggableSongProps {
  songId: string;
  index: number;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  onRemove: (index: number) => void;
}

function DraggableSong({
  songId,
  index,
  onMove,
  onRemove,
}: DraggableSongProps) {
  const { songs } = useApp();
  const song = songs.find((s) => s.id === songId);

  const [{ isDragging }, drag] = useDrag({
    type: "SONG",
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: "SONG",
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        onMove(item.index, index);
        item.index = index;
      }
    },
  });

  if (!song) return null;

  return (
    <div
      ref={(node) => {
        drag(drop(node));
      }}
      className={`flex items-center gap-2 px-3 py-2 hover:bg-accent transition-colors cursor-move text-sm ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
      <span className="font-medium truncate flex-1">{song.title}</span>
      <span className="text-muted-foreground truncate max-w-[40%]">
        {song.artist}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0"
        onClick={() => onRemove(index)}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}

export function SetlistBuilder() {
  const {
    activeOrganizationId,
    isLoading: isOrgLoading,
    loadError: orgLoadError,
  } = useOrganization();
  const {
    songs,
    setlists,
    setlistsLoading,
    setlistsError,
    offlineSetlistIds,
    addSetlist,
    updateSetlist,
    deleteSetlist,
    downloadSetlistForOffline,
  } = useApp();
  const isOnline = useOnlineStatus();
  const [editingSetlistId, setEditingSetlistId] = useState<string | null>(null);
  const [newSetlistName, setNewSetlistName] = useState("");
  const [songOrder, setSongOrder] = useState<string[]>([]);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [librarySearch, setLibrarySearch] = useState("");
  const [setlistSearch, setSetlistSearch] = useState("");
  const [savedSetlistsSearch, setSavedSetlistsSearch] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [flowSections, setFlowSections] = useState<SetlistFlowSectionInput[]>(
    [],
  );
  const [welcomeSlide, setWelcomeSlide] = useState<WelcomeSlide | null>(null);
  const [isUploadingWelcomeSlide, setIsUploadingWelcomeSlide] = useState(false);

  const FLOW_PRESETS = ["Opening", "Worship", "Response", "Closing"];

  const filteredLibrarySongs = useMemo(
    () =>
      songs.filter((song) => {
        const keyword = librarySearch.trim().toLowerCase();
        if (!keyword) return true;
        return (
          song.title.toLowerCase().includes(keyword) ||
          song.artist.toLowerCase().includes(keyword) ||
          song.tags.some((tag) => tag.toLowerCase().includes(keyword))
        );
      }),
    [songs, librarySearch],
  );

  const libraryPagination = usePagination(filteredLibrarySongs, [
    librarySearch,
  ]);

  const filteredSetlistEntries = useMemo(() => {
    const keyword = setlistSearch.trim().toLowerCase();
    return songOrder
      .map((songId, index) => ({ songId, index }))
      .filter(({ songId }) => {
        const song = songs.find((entry) => entry.id === songId);
        if (!song) return false;
        if (!keyword) return true;
        return (
          song.title.toLowerCase().includes(keyword) ||
          song.artist.toLowerCase().includes(keyword) ||
          song.tags.some((tag) => tag.toLowerCase().includes(keyword))
        );
      });
  }, [songOrder, songs, setlistSearch]);

  const filteredSavedSetlists = useMemo(() => {
    const keyword = savedSetlistsSearch.trim().toLowerCase();
    if (!keyword) return setlists;
    return setlists.filter((setlist) =>
      setlist.name.toLowerCase().includes(keyword),
    );
  }, [setlists, savedSetlistsSearch]);

  const setlistsPagination = usePagination(filteredSavedSetlists, [
    filteredSavedSetlists.length,
    savedSetlistsSearch,
  ]);

  const handleMoveSong = (dragIndex: number, hoverIndex: number) => {
    const newOrder = [...songOrder];
    const [removed] = newOrder.splice(dragIndex, 1);
    newOrder.splice(hoverIndex, 0, removed);
    setSongOrder(newOrder);
  };

  const handleRemoveSong = (index: number) => {
    setSongOrder(songOrder.filter((_, i) => i !== index));
  };

  const handleAddSongToSetlist = (songId: string) => {
    if (!songOrder.includes(songId)) {
      setSongOrder([...songOrder, songId]);
    }
  };

  const isBuilderActive = isCreatingNew || editingSetlistId !== null;

  const resetBuilder = () => {
    setEditingSetlistId(null);
    setNewSetlistName("");
    setSongOrder([]);
    setFlowSections([]);
    setWelcomeSlide(null);
    setSetlistSearch("");
    setIsCreatingNew(false);
  };

  const startNewSetlist = () => {
    setEditingSetlistId(null);
    setNewSetlistName("");
    setSongOrder([]);
    setFlowSections([]);
    setWelcomeSlide(null);
    setIsCreatingNew(true);
  };

  const handleWelcomeSlideUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!activeOrganizationId) {
      toast.error("Select an organization before uploading");
      return;
    }

    if (file.size > WELCOME_SLIDE_MAX_BYTES) {
      toast.error("File exceeds the 20 MB limit");
      return;
    }

    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      toast.error("Only image and video files are allowed");
      return;
    }

    setIsUploadingWelcomeSlide(true);
    try {
      const { welcomeSlide: uploaded } = await uploadWelcomeSlide(
        activeOrganizationId,
        file,
      );
      setWelcomeSlide(uploaded);
      toast.success("Welcome slide uploaded");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to upload welcome slide",
      );
    } finally {
      setIsUploadingWelcomeSlide(false);
    }
  };

  const toggleFlowSectionSong = (
    sectionName: string,
    songId: string,
    checked: boolean,
  ) => {
    setFlowSections((prev) => {
      const existing = prev.find((s) => s.name === sectionName);
      if (!existing) {
        return checked
          ? [...prev, { name: sectionName, songIds: [songId] }]
          : prev;
      }

      return prev.map((section) => {
        if (section.name !== sectionName) return section;
        const songIds = checked
          ? [...new Set([...section.songIds, songId])]
          : section.songIds.filter((id) => id !== songId);
        return { ...section, songIds };
      });
    });
  };

  const handleSaveSetlist = async () => {
    if (!newSetlistName.trim()) return;

    if (!activeOrganizationId) {
      toast.error("Select an organization before saving setlists");
      return;
    }

    setIsSaving(true);
    try {
      if (editingSetlistId) {
        await updateSetlist(editingSetlistId, {
          name: newSetlistName.trim(),
          songs: songOrder,
          flowSections,
          welcomeSlide,
        });
        toast.success("Setlist updated");
      } else {
        await addSetlist({
          name: newSetlistName.trim(),
          songs: songOrder,
          flowSections,
          welcomeSlide,
        });
        toast.success("Setlist created");
      }
      resetBuilder();
    } catch {
      toast.error(
        editingSetlistId
          ? "Failed to update setlist"
          : "Failed to create setlist",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditSetlist = (setlistId: string) => {
    const setlist = setlists.find((entry) => entry.id === setlistId);
    if (!setlist) return;

    setEditingSetlistId(setlist.id);
    setNewSetlistName(setlist.name);
    setSongOrder([...setlist.songs]);
    setFlowSections([...setlist.flowSections]);
    setWelcomeSlide(setlist.welcomeSlide ?? null);
    setIsCreatingNew(false);
  };

  const handleDeleteSetlist = async (setlistId: string) => {
    if (!confirm("Delete this setlist?")) return;

    try {
      await deleteSetlist(setlistId);
      if (editingSetlistId === setlistId) resetBuilder();
    } catch {
      toast.error("Failed to delete setlist");
    }
  };

  const handleDownloadSetlistForOffline = async (setlistId: string) => {
    const isOfflineCached = offlineSetlistIds.includes(setlistId);
    if (!isOnline && !isOfflineCached) {
      toast.error("Go online to download this setlist for offline use");
      return;
    }

    try {
      await downloadSetlistForOffline(setlistId);
      toast.success(
        isOfflineCached
          ? "Offline cache refreshed"
          : "Setlist downloaded for offline use",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to download setlist for offline use",
      );
    }
  };

  const renderDownloadButton = (setlistId: string, size: "icon" | "sm" = "icon") => {
    const isOfflineCached = offlineSetlistIds.includes(setlistId);
    const isDisabled = !isOnline && !isOfflineCached;
    const tooltip = isOfflineCached
      ? "Downloaded for offline"
      : "Download for offline";

    const button = (
      <Button
        variant={isOfflineCached ? "default" : "ghost"}
        size={size}
        className={
          isOfflineCached
            ? size === "icon"
              ? "h-9 w-9 bg-emerald-600 hover:bg-emerald-700 text-white"
              : "bg-emerald-600 hover:bg-emerald-700 text-white"
            : size === "icon"
              ? "h-9 w-9"
              : undefined
        }
        disabled={isDisabled}
        onClick={(event) => {
          event.stopPropagation();
          void handleDownloadSetlistForOffline(setlistId);
        }}
      >
        {isOfflineCached ? (
          <Check className="w-4 h-4" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        {size === "sm" ? (
          <span className="ml-2">
            {isOfflineCached ? "Downloaded" : "Download for offline"}
          </span>
        ) : null}
      </Button>
    );

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={isDisabled ? "inline-flex" : undefined}>
            {button}
          </span>
        </TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    );
  };

  const songLibraryPanel = (
    <Card className="xl:sticky xl:top-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Song Library</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9 h-9"
            placeholder="Search songs..."
            value={librarySearch}
            onChange={(e) => setLibrarySearch(e.target.value)}
          />
        </div>
        {filteredLibrarySongs.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No songs in your library yet. Add songs first.
          </p>
        ) : (
          <>
            <div className="divide-y rounded-lg border max-h-[min(70vh,520px)] overflow-y-auto">
              {libraryPagination.paginatedItems.map((song) => (
                <div
                  key={song.id}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-accent transition-colors cursor-pointer text-sm"
                  onClick={() => handleAddSongToSetlist(song.id)}
                >
                  <span className="font-medium truncate flex-1">
                    {song.title}
                  </span>
                  <span className="text-muted-foreground truncate max-w-[40%]">
                    {song.artist}
                  </span>
                </div>
              ))}
            </div>
            <ListPagination
              page={libraryPagination.page}
              totalPages={libraryPagination.totalPages}
              totalItems={libraryPagination.totalItems}
              rangeStart={libraryPagination.rangeStart}
              rangeEnd={libraryPagination.rangeEnd}
              pageSize={libraryPagination.pageSize}
              onPageChange={libraryPagination.setPage}
              onPageSizeChange={libraryPagination.setPageSize}
            />
          </>
        )}
      </CardContent>
    </Card>
  );

  const setlistEditorPanel = (
    <div className="space-y-4 xl:sticky xl:top-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {editingSetlistId &&
          offlineSetlistIds.includes(editingSetlistId) ? (
            <OfflineSetlistBadge />
          ) : null}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {editingSetlistId
            ? renderDownloadButton(editingSetlistId, "sm")
            : null}
          <Button
            size="sm"
            onClick={() => void handleSaveSetlist()}
            disabled={!newSetlistName.trim() || isSaving}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : editingSetlistId ? "Update" : "Save"}
          </Button>
        </div>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="setlist-name">Setlist Name</Label>
          <Input
            id="setlist-name"
            value={newSetlistName}
            onChange={(e) => setNewSetlistName(e.target.value)}
            placeholder="Sunday Morning Worship - May 3"
          />
        </div>

        <div className="space-y-2 rounded-lg border p-3">
          <Label>Welcome slide</Label>
          <p className="text-xs text-muted-foreground">
            Upload an image or video (max 20 MB) shown when you press Welcome in
            Live Mode.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={
                !activeOrganizationId || isUploadingWelcomeSlide || isSaving
              }
              asChild
            >
              <label className="cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                {isUploadingWelcomeSlide
                  ? "Uploading..."
                  : welcomeSlide
                    ? "Replace file"
                    : "Upload file"}
                <input
                  type="file"
                  className="sr-only"
                  accept={WELCOME_SLIDE_ACCEPT}
                  onChange={(event) => void handleWelcomeSlideUpload(event)}
                />
              </label>
            </Button>
            {welcomeSlide ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setWelcomeSlide(null)}
              >
                Remove
              </Button>
            ) : null}
          </div>
          {welcomeSlide?.type === "image" ? (
            <img
              src={welcomeSlide.url}
              alt="Welcome slide preview"
              className="w-full max-h-40 object-contain rounded border bg-muted/30"
            />
          ) : null}
          {welcomeSlide?.type === "video" ? (
            <video
              src={welcomeSlide.url}
              muted
              playsInline
              controls
              className="w-full max-h-40 object-contain rounded border bg-muted/30"
            />
          ) : null}
        </div>

        <div className="space-y-2">
          <Label>Setlist ({songOrder.length})</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9 h-9"
              placeholder="Search setlist..."
              value={setlistSearch}
              onChange={(e) => setSetlistSearch(e.target.value)}
            />
          </div>
          {songOrder.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center rounded-lg border border-dashed">
              Add songs from the library, then drag to reorder
            </p>
          ) : filteredSetlistEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center rounded-lg border">
              No songs match your search
            </p>
          ) : (
            <div className="divide-y rounded-lg border max-h-[min(70vh,520px)] overflow-y-auto">
              {filteredSetlistEntries.map(({ songId, index }) => (
                <DraggableSong
                  key={`${songId}-${index}`}
                  songId={songId}
                  index={index}
                  onMove={handleMoveSong}
                  onRemove={handleRemoveSong}
                />
              ))}
            </div>
          )}
        </div>

        {songOrder.length > 0 && (
          <div className="space-y-3 pt-2 border-t">
            <Label>Flow sections</Label>
            <p className="text-xs text-muted-foreground">
              Assign songs to service flow blocks (Opening, Worship, etc.)
            </p>
            {FLOW_PRESETS.map((preset) => {
              const section = flowSections.find((s) => s.name === preset);
              return (
                <div key={preset} className="rounded-lg border p-3 space-y-2">
                  <p className="text-sm font-medium">{preset}</p>
                  <div className="flex flex-wrap gap-2">
                    {songOrder.map((songId) => {
                      const song = songs.find((s) => s.id === songId);
                      if (!song) return null;
                      const checked =
                        section?.songIds.includes(songId) ?? false;
                      return (
                        <label
                          key={`${preset}-${songId}`}
                          className="flex items-center gap-1 text-xs border rounded px-2 py-1 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) =>
                              toggleFlowSectionSong(
                                preset,
                                songId,
                                e.target.checked,
                              )
                            }
                          />
                          {song.title}
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              {isBuilderActive
                ? editingSetlistId
                  ? "Edit Setlist"
                  : "Create Setlist"
                : "Setlists"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {setlistsLoading
                ? "Loading setlists..."
                : isBuilderActive
                  ? editingSetlistId
                    ? "Update songs, flow sections, and welcome slide"
                    : "Name your setlist and add songs from the library"
                  : "Create and manage song sequences for services"}
            </p>
          </div>
          {!isBuilderActive && (
            <Button
              disabled={!activeOrganizationId || isOrgLoading}
              onClick={startNewSetlist}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Setlist
            </Button>
          )}
        </div>

        {orgLoadError && (
          <p className="text-sm text-destructive">{orgLoadError}</p>
        )}

        {!isOrgLoading && !orgLoadError && !activeOrganizationId && (
          <p className="text-sm text-muted-foreground">
            Select an organization to manage setlists.
          </p>
        )}

        {setlistsError && (
          <p className="text-sm text-destructive">{setlistsError}</p>
        )}

        {isBuilderActive ? (
          <div className="space-y-4">
            <Button variant="ghost" size="sm" onClick={resetBuilder}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to setlists
            </Button>
            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-6 items-start">
              {songLibraryPanel}
              {setlistEditorPanel}
            </div>
          </div>
        ) : (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search setlists by name..."
                value={savedSetlistsSearch}
                onChange={(e) => setSavedSetlistsSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {setlists.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No saved setlists yet.</p>
                <Button
                  className="mt-4"
                  variant="outline"
                  disabled={!activeOrganizationId || isOrgLoading}
                  onClick={startNewSetlist}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create your first setlist
                </Button>
              </div>
            ) : filteredSavedSetlists.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No setlists match your search.
              </p>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {setlistsPagination.paginatedItems.map((setlist) => {
                    const isOfflineCached = offlineSetlistIds.includes(
                      setlist.id,
                    );

                    return (
                      <Card
                        key={setlist.id}
                        className={cn(
                          "hover:shadow-lg transition-shadow cursor-pointer",
                          isOfflineCached && "border-l-4 border-l-emerald-500",
                        )}
                        onClick={() => handleEditSetlist(setlist.id)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4 flex-1">
                              <div
                                className={cn(
                                  "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0",
                                  isOfflineCached
                                    ? "bg-emerald-600"
                                    : "bg-primary",
                                )}
                              >
                                <ListMusic
                                  className={cn(
                                    "w-6 h-6",
                                    isOfflineCached
                                      ? "text-white"
                                      : "text-primary-foreground",
                                  )}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-lg truncate">
                                  {setlist.name}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {setlist.updatedAt
                                    ? `Updated ${format(parseISO(setlist.updatedAt), "MMM d, yyyy")}`
                                    : "—"}
                                </p>
                                {setlist.welcomeSlide || isOfflineCached ? (
                                  <div className="flex gap-2 mt-2 flex-wrap">
                                    {isOfflineCached ? (
                                      <OfflineSetlistBadge />
                                    ) : null}
                                    {setlist.welcomeSlide ? (
                                      <Badge variant="secondary">
                                        Welcome slide
                                      </Badge>
                                    ) : null}
                                  </div>
                                ) : null}
                              </div>
                            </div>
                            <div className="flex items-center gap-4 shrink-0">
                              <div className="text-right">
                                <p className="text-sm text-muted-foreground">
                                  Songs
                                </p>
                                <p className="text-2xl font-bold">
                                  {setlist.songs.length}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                {renderDownloadButton(setlist.id)}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditSetlist(setlist.id);
                                  }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    void handleDeleteSetlist(setlist.id);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
                <ListPagination
                  page={setlistsPagination.page}
                  totalPages={setlistsPagination.totalPages}
                  totalItems={setlistsPagination.totalItems}
                  rangeStart={setlistsPagination.rangeStart}
                  rangeEnd={setlistsPagination.rangeEnd}
                  pageSize={setlistsPagination.pageSize}
                  onPageChange={setlistsPagination.setPage}
                  onPageSizeChange={setlistsPagination.setPageSize}
                />
              </div>
            )}
          </>
        )}
      </div>
    </DndProvider>
  );
}
