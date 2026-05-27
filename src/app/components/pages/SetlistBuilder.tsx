import { useState } from "react";
import { useOrganization } from "@frontend/contexts/OrganizationContext";
import {
  useApp,
  type SetlistFlowSectionInput,
} from "../../contexts/AppContext";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { GripVertical, Plus, Trash2, Save, Search } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { toast } from "sonner";

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
      className={`p-4 rounded-lg border bg-card flex items-center gap-3 cursor-move ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <GripVertical className="w-5 h-5 text-muted-foreground" />
      <div className="flex-1">
        <p className="font-medium">{song.title}</p>
        <p className="text-sm text-muted-foreground">{song.artist}</p>
      </div>
      <div className="flex gap-2">
        {song.tags.slice(0, 2).map((tag) => (
          <Badge key={tag} variant="secondary">
            {tag}
          </Badge>
        ))}
      </div>
      <Button variant="ghost" size="icon" onClick={() => onRemove(index)}>
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
    addSetlist,
    updateSetlist,
    deleteSetlist,
  } = useApp();
  const [editingSetlistId, setEditingSetlistId] = useState<string | null>(null);
  const [newSetlistName, setNewSetlistName] = useState("");
  const [songOrder, setSongOrder] = useState<string[]>([]);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [librarySearch, setLibrarySearch] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [flowSections, setFlowSections] = useState<SetlistFlowSectionInput[]>(
    [],
  );

  const FLOW_PRESETS = ["Opening", "Worship", "Response", "Closing"];

  const filteredLibrarySongs = songs.filter((song) => {
    const keyword = librarySearch.trim().toLowerCase();
    if (!keyword) return true;
    return (
      song.title.toLowerCase().includes(keyword) ||
      song.artist.toLowerCase().includes(keyword) ||
      song.tags.some((tag) => tag.toLowerCase().includes(keyword))
    );
  });

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

  const resetBuilder = () => {
    setEditingSetlistId(null);
    setNewSetlistName("");
    setSongOrder([]);
    setFlowSections([]);
    setIsCreatingNew(false);
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
        });
        toast.success("Setlist updated");
      } else {
        await addSetlist({
          name: newSetlistName.trim(),
          songs: songOrder,
          flowSections,
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
    setIsCreatingNew(false);
  };

  const handleDeleteSetlist = async (setlistId: string) => {
    if (!confirm("Delete this setlist?")) return;

    try {
      await deleteSetlist(setlistId);
      if (editingSetlistId === setlistId) resetBuilder();
      toast.success("Setlist deleted");
    } catch {
      toast.error("Failed to delete setlist");
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Setlist Builder</h1>
            <p className="text-muted-foreground mt-1">
              {setlistsLoading
                ? "Loading setlists..."
                : "Create and manage song sequences"}
            </p>
          </div>
          <Dialog
            open={isCreatingNew}
            onOpenChange={(open) => {
              setIsCreatingNew(open);
              if (!open && !editingSetlistId) {
                setNewSetlistName("");
              }
            }}
          >
            <DialogTrigger asChild>
              <Button
                disabled={!activeOrganizationId || isOrgLoading}
                onClick={() => {
                  setEditingSetlistId(null);
                  setSongOrder([]);
                  setNewSetlistName("");
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Setlist
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Setlist</DialogTitle>
                <DialogDescription>
                  Name your setlist, then add songs in the builder panel.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Setlist Name</Label>
                  <Input
                    id="name"
                    value={newSetlistName}
                    onChange={(e) => setNewSetlistName(e.target.value)}
                    placeholder="Sunday Morning Worship - May 3"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  You can add songs now in the builder, or create the setlist
                  and edit it later.
                </p>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreatingNew(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={() => void handleSaveSetlist()}
                    disabled={!newSetlistName.trim() || isSaving}
                  >
                    {isSaving ? "Saving..." : "Create Setlist"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
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

        <div className="grid grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Song Library</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  className="pl-9"
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
                filteredLibrarySongs.map((song) => (
                  <div
                    key={song.id}
                    className="p-3 rounded-lg border bg-card hover:bg-accent transition-colors cursor-pointer"
                    onClick={() => handleAddSongToSetlist(song.id)}
                  >
                    <p className="font-medium">{song.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {song.artist}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle>
                  {editingSetlistId ? "Editing Setlist" : "Current Setlist"}
                </CardTitle>
                {(songOrder.length > 0 || editingSetlistId) && (
                  <Button
                    size="sm"
                    onClick={handleSaveSetlist}
                    disabled={!newSetlistName.trim() || isSaving}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving
                      ? "Saving..."
                      : editingSetlistId
                        ? "Update"
                        : "Save"}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="setlist-name">Setlist Name</Label>
                <Input
                  id="setlist-name"
                  value={newSetlistName}
                  onChange={(e) => setNewSetlistName(e.target.value)}
                  placeholder="Sunday Morning Worship - May 3"
                />
              </div>
              {songOrder.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Click songs from the library to add them</p>
                  <p className="text-sm mt-1">Then drag to reorder</p>
                </div>
              ) : (
                songOrder.map((songId, index) => (
                  <DraggableSong
                    key={`${songId}-${index}`}
                    songId={songId}
                    index={index}
                    onMove={handleMoveSong}
                    onRemove={handleRemoveSong}
                  />
                ))
              )}

              {songOrder.length > 0 && (
                <div className="space-y-3 pt-4 border-t">
                  <Label>Flow sections</Label>
                  <p className="text-xs text-muted-foreground">
                    Assign songs to service flow blocks (Opening, Worship, etc.)
                  </p>
                  {FLOW_PRESETS.map((preset) => {
                    const section = flowSections.find((s) => s.name === preset);
                    return (
                      <div
                        key={preset}
                        className="rounded-lg border p-3 space-y-2"
                      >
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

              {editingSetlistId && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={resetBuilder}
                >
                  Cancel editing
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Saved Setlists</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {setlists.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No saved setlists yet.
              </p>
            ) : (
              setlists.map((setlist) => (
                <div
                  key={setlist.id}
                  className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{setlist.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {setlist.songs.length} songs
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditSetlist(setlist.id)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => void handleDeleteSetlist(setlist.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </DndProvider>
  );
}
