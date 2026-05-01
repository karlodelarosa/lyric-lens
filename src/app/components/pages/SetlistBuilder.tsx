import { useState } from "react";
import { useApp } from "../../contexts/AppContext";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface DraggableSongProps {
  songId: string;
  index: number;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  onRemove: (index: number) => void;
}

function DraggableSong({ songId, index, onMove, onRemove }: DraggableSongProps) {
  const { songs } = useApp();
  const song = songs.find((s) => s.id === songId);

  const [{ isDragging }, drag] = useDrag({
    type: 'SONG',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'SONG',
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
      ref={(node) => drag(drop(node))}
      className={`p-4 rounded-lg border bg-card flex items-center gap-3 cursor-move ${
        isDragging ? 'opacity-50' : ''
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
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemove(index)}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}

export function SetlistBuilder() {
  const { songs, setlists, addSetlist } = useApp();
  const [selectedSetlist, setSelectedSetlist] = useState<string | null>(null);
  const [newSetlistName, setNewSetlistName] = useState("");
  const [songOrder, setSongOrder] = useState<string[]>([]);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [librarySearch, setLibrarySearch] = useState("");

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

  const handleSaveSetlist = () => {
    if (!newSetlistName) return;

    addSetlist({
      name: newSetlistName,
      songs: songOrder,
      flowSections: [
        { name: 'Opening', songIds: songOrder.slice(0, 1) },
        { name: 'Worship', songIds: songOrder.slice(1) },
      ],
    });

    setNewSetlistName("");
    setSongOrder([]);
    setIsCreatingNew(false);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Setlist Builder</h1>
            <p className="text-muted-foreground mt-1">Create and manage song sequences</p>
          </div>
          <Dialog open={isCreatingNew} onOpenChange={setIsCreatingNew}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Setlist
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Setlist</DialogTitle>
                <DialogDescription>Give your setlist a name</DialogDescription>
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
                <Button onClick={handleSaveSetlist} className="w-full">
                  Create Setlist
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Song Pool */}
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
              {filteredLibrarySongs.map((song) => (
                <div
                  key={song.id}
                  className="p-3 rounded-lg border bg-card hover:bg-accent transition-colors cursor-pointer"
                  onClick={() => handleAddSongToSetlist(song.id)}
                >
                  <p className="font-medium">{song.title}</p>
                  <p className="text-sm text-muted-foreground">{song.artist}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Setlist Builder */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Current Setlist</CardTitle>
                {songOrder.length > 0 && (
                  <Button size="sm" onClick={handleSaveSetlist}>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
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
            </CardContent>
          </Card>
        </div>

        {/* Saved Setlists */}
        <Card>
          <CardHeader>
            <CardTitle>Saved Setlists</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {setlists.map((setlist) => (
              <div
                key={setlist.id}
                className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{setlist.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {setlist.songs.length} songs
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DndProvider>
  );
}
