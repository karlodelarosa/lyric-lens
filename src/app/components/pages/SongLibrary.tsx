import { useId, useMemo, useRef, useState } from "react";
import { useOrganization } from "@frontend/contexts/OrganizationContext";
import { useApp, type SongSectionType } from "../../contexts/AppContext";
import { Search, Plus, Edit, Trash2, Music, Filter } from "lucide-react";
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
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { toast } from "sonner";

const SECTION_TYPES: { value: SongSectionType; label: string }[] = [
  { value: "verse", label: "Verse" },
  { value: "chorus", label: "Chorus" },
  { value: "bridge", label: "Bridge" },
  { value: "pre_chorus", label: "Pre-chorus" },
  { value: "intro", label: "Intro" },
  { value: "outro", label: "Outro" },
  { value: "tag", label: "Tag" },
  { value: "custom", label: "Custom" },
];

function createEmptySection(
  id: string,
  number = "1",
): {
  id: string;
  type: SongSectionType;
  number: string;
  lyrics: string;
} {
  return { id, type: "verse", number, lyrics: "" };
}

export function SongLibrary() {
  const sectionIdPrefix = useId();
  const nextSectionId = useRef(1);
  const {
    organizations,
    activeOrganization,
    activeOrganizationId,
    setActiveOrganizationId,
    isLoading: isOrgLoading,
    loadError: orgLoadError,
  } = useOrganization();
  const { songs, songsLoading, songsError, addSong, deleteSong } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSong, setSelectedSong] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [tagFilter, setTagFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"title" | "usage">("title");
  const [isSaving, setIsSaving] = useState(false);
  const [sections, setSections] = useState(() => [
    createEmptySection(`${sectionIdPrefix}-0`),
  ]);

  const availableTags = useMemo(
    () =>
      Array.from(new Set(songs.flatMap((song) => song.tags))).sort((a, b) =>
        a.localeCompare(b),
      ),
    [songs],
  );

  const filteredSongs = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const result = songs.filter((song) => {
      const matchesSearch =
        !normalizedSearch ||
        song.title.toLowerCase().includes(normalizedSearch) ||
        song.artist.toLowerCase().includes(normalizedSearch) ||
        song.tags.some((tag) => tag.toLowerCase().includes(normalizedSearch));
      const matchesTag = tagFilter === "all" || song.tags.includes(tagFilter);
      return matchesSearch && matchesTag;
    });

    return result.sort((a, b) => {
      if (sortBy === "usage") return b.usageCount - a.usageCount;
      return a.title.localeCompare(b.title);
    });
  }, [songs, searchTerm, tagFilter, sortBy]);

  const handleAddSong = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!activeOrganizationId) {
      toast.error("Select an organization before adding songs");
      return;
    }

    const formData = new FormData(e.currentTarget);

    const validSections = sections
      .map((section) => ({
        type: section.type,
        number: section.number ? Number(section.number) : undefined,
        lyrics: section.lyrics.trim(),
      }))
      .filter((section) => section.lyrics.length > 0);

    if (validSections.length === 0) return;

    setIsSaving(true);
    try {
      await addSong({
        title: formData.get("title") as string,
        artist: formData.get("artist") as string,
        tags: (formData.get("tags") as string)
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        sections: validSections,
      });

      setIsAddingNew(false);
      nextSectionId.current = 1;
      setSections([createEmptySection(`${sectionIdPrefix}-0`)]);
      toast.success("Song added");
    } catch {
      toast.error("Failed to add song");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSong = async (songId: string) => {
    if (!confirm("Delete this song?")) return;

    try {
      await deleteSong(songId);
      if (selectedSong === songId) setSelectedSong(null);
      toast.success("Song deleted");
    } catch {
      toast.error("Failed to delete song");
    }
  };

  const song = songs.find((s) => s.id === selectedSong);

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Song Library</h1>
          <p className="text-muted-foreground mt-1">
            {songsLoading
              ? "Loading songs..."
              : `${songs.length} songs in your collection`}
            {activeOrganization ? ` · ${activeOrganization.name}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {organizations.length > 1 && (
            <Select
              value={activeOrganizationId ?? undefined}
              onValueChange={setActiveOrganizationId}
            >
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Select organization" />
              </SelectTrigger>
              <SelectContent>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Dialog open={isAddingNew} onOpenChange={setIsAddingNew}>
            <DialogTrigger asChild>
              <Button disabled={!activeOrganizationId || isOrgLoading}>
                <Plus className="w-4 h-4 mr-2" />
                Add Song
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Song</DialogTitle>
                <DialogDescription>
                  Add song metadata and section-based lyrics (verse, chorus,
                  bridge, etc.)
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddSong} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Song Title</Label>
                    <Input
                      id="title"
                      name="title"
                      required
                      placeholder="Amazing Grace"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="artist">Artist</Label>
                    <Input
                      id="artist"
                      name="artist"
                      required
                      placeholder="John Newton"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    name="tags"
                    placeholder="worship, slow, classic"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Song Sections</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setSections((prev) => [
                          ...prev,
                          createEmptySection(
                            `${sectionIdPrefix}-${nextSectionId.current++}`,
                            String(prev.length + 1),
                          ),
                        ])
                      }
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Section
                    </Button>
                  </div>
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {sections.map((section, index) => (
                      <Card key={section.id}>
                        <CardContent className="p-4 space-y-3">
                          <div className="grid grid-cols-3 gap-2">
                            <div className="space-y-1">
                              <Label className="text-xs">Type</Label>
                              <Select
                                value={section.type}
                                onValueChange={(value) =>
                                  setSections((prev) =>
                                    prev.map((s) =>
                                      s.id === section.id
                                        ? {
                                            ...s,
                                            type: value as SongSectionType,
                                          }
                                        : s,
                                    ),
                                  )
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {SECTION_TYPES.map((option) => (
                                    <SelectItem
                                      key={option.value}
                                      value={option.value}
                                    >
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Number</Label>
                              <Input
                                value={section.number}
                                onChange={(e) =>
                                  setSections((prev) =>
                                    prev.map((s) =>
                                      s.id === section.id
                                        ? { ...s, number: e.target.value }
                                        : s,
                                    ),
                                  )
                                }
                                placeholder="1"
                              />
                            </div>
                            <div className="flex items-end">
                              <Button
                                type="button"
                                variant="ghost"
                                className="w-full"
                                disabled={sections.length === 1}
                                onClick={() =>
                                  setSections((prev) =>
                                    prev.filter((s) => s.id !== section.id),
                                  )
                                }
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                          <Textarea
                            value={section.lyrics}
                            onChange={(e) =>
                              setSections((prev) =>
                                prev.map((s) =>
                                  s.id === section.id
                                    ? { ...s, lyrics: e.target.value }
                                    : s,
                                ),
                              )
                            }
                            rows={5}
                            required={index === 0}
                            placeholder="Enter section lyrics..."
                            className="font-mono"
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddingNew(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? "Saving..." : "Add Song"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {orgLoadError && (
        <p className="text-sm text-destructive">{orgLoadError}</p>
      )}

      {!isOrgLoading && !orgLoadError && !activeOrganizationId && (
        <p className="text-sm text-muted-foreground">
          {organizations.length === 0
            ? "No organization is linked to your account yet. Your user must appear in organization_members with the same id as your Supabase auth user."
            : "Select an organization to manage songs."}
        </p>
      )}

      {songsError && <p className="text-sm text-destructive">{songsError}</p>}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search songs by title, artist, or tags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <Button
          size="sm"
          variant={tagFilter === "all" ? "default" : "outline"}
          onClick={() => setTagFilter("all")}
        >
          All tags
        </Button>
        {availableTags.map((tag) => (
          <Button
            key={tag}
            size="sm"
            variant={tagFilter === tag ? "default" : "outline"}
            onClick={() => setTagFilter(tag)}
          >
            {tag}
          </Button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Sort by</Label>
          <Button
            size="sm"
            variant={sortBy === "title" ? "default" : "outline"}
            onClick={() => setSortBy("title")}
          >
            Title
          </Button>
          <Button
            size="sm"
            variant={sortBy === "usage" ? "default" : "outline"}
            onClick={() => setSortBy("usage")}
          >
            Usage
          </Button>
        </div>
      </div>

      {/* Songs Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredSongs.map((song) => (
          <Card
            key={song.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedSong(song.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                    <Music className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{song.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {song.artist}
                    </p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {song.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      Used in services
                    </p>
                    <p className="text-2xl font-bold">{song.usageCount}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        void handleDeleteSong(song.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Song Detail Dialog */}
      <Dialog
        open={selectedSong !== null}
        onOpenChange={() => setSelectedSong(null)}
      >
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {song && (
            <>
              <DialogHeader>
                <DialogTitle>{song.title}</DialogTitle>
                <DialogDescription>{song.artist}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  {song.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="space-y-4">
                  {song.sections.map((section) => (
                    <Card key={section.id}>
                      <CardHeader>
                        <CardTitle className="text-sm uppercase text-muted-foreground">
                          {section.type} {section.number || ""}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                          {section.lyrics}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
