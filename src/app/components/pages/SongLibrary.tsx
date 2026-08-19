import { useId, useMemo, useRef, useState } from "react";
import { useOrganization } from "@frontend/contexts/OrganizationContext";
import { useApp, type SongSectionType } from "../../contexts/AppContext";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Music,
  Filter,
  LayoutGrid,
  List,
  Table2,
  Video,
  X,
} from "lucide-react";
import { usePagination } from "../../lib/usePagination";
import { ListPagination } from "../ListPagination";
import {
  SONG_BACKGROUND_VIDEO_ACCEPT,
  SONG_BACKGROUND_VIDEO_MAX_BYTES,
  uploadSongBackgroundVideo,
} from "@frontend/lib/api/songs";
import {
  DEFAULT_SECTION_INTENSITY,
  getSectionIntensity,
} from "../../lib/sectionIntensity";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
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

const INTENSITY_PRESETS = [
  { value: "auto", label: "Auto" },
  { value: "25", label: "Dim" },
  { value: "50", label: "Medium" },
  { value: "80", label: "Bright" },
  { value: "100", label: "Peak" },
] as const;

type SectionFormState = {
  id: string;
  type: SongSectionType;
  number: string;
  lyrics: string;
  intensity: number | null;
  backgroundVideoUrl: string;
};

function createEmptySection(id: string, number = "1"): SectionFormState {
  return {
    id,
    type: "verse",
    number,
    lyrics: "",
    intensity: null,
    backgroundVideoUrl: "",
  };
}

function BackgroundVideoField({
  value,
  onChange,
  isUploading,
  fileInputRef,
  onFileSelected,
}: {
  value: string;
  onChange: (value: string) => void;
  isUploading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileSelected: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Video className="w-4 h-4 text-muted-foreground" />
        <Label>Background Video</Label>
      </div>
      {value ? (
        <div className="relative w-full max-w-xs aspect-video overflow-hidden rounded-md border bg-black">
          <video
            key={value}
            src={value}
            muted
            loop
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="absolute top-1 right-1 h-6 w-6"
            onClick={() => onChange("")}
            title="Remove background video"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      ) : null}
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://your-cdn.com/loop.mp4"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? "Uploading..." : "Upload"}
        </Button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept={SONG_BACKGROUND_VIDEO_ACCEPT}
        className="hidden"
        onChange={onFileSelected}
      />
      <p className="text-xs text-muted-foreground">
        This video plays behind the song by default. Give a section its own
        background below to override it for just that section — control how
        brightly it shines with intensity.
      </p>
    </div>
  );
}

function SongSectionsEditor({
  sections,
  setSections,
  onAddSection,
  requireFirstLyrics,
  uploadingSectionId,
  onUploadSectionVideo,
}: {
  sections: SectionFormState[];
  setSections: React.Dispatch<React.SetStateAction<SectionFormState[]>>;
  onAddSection: () => void;
  requireFirstLyrics: boolean;
  uploadingSectionId: string | null;
  onUploadSectionVideo: (sectionId: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Song Sections</Label>
        <Button type="button" variant="outline" size="sm" onClick={onAddSection}>
          <Plus className="w-4 h-4 mr-2" />
          Add Section
        </Button>
      </div>
      <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
        {sections.map((section, index) => (
          <Card key={section.id}>
            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-4 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Type</Label>
                  <Select
                    value={section.type}
                    onValueChange={(value) =>
                      setSections((prev) =>
                        prev.map((s) =>
                          s.id === section.id
                            ? { ...s, type: value as SongSectionType }
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
                        <SelectItem key={option.value} value={option.value}>
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
                <div className="space-y-1">
                  <Label className="text-xs">Video intensity</Label>
                  <Select
                    value={
                      section.intensity === null
                        ? "auto"
                        : String(section.intensity)
                    }
                    onValueChange={(value) =>
                      setSections((prev) =>
                        prev.map((s) =>
                          s.id === section.id
                            ? {
                                ...s,
                                intensity:
                                  value === "auto" ? null : Number(value),
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
                      {INTENSITY_PRESETS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                          {option.value === "auto"
                            ? ` (${DEFAULT_SECTION_INTENSITY[section.type]}%)`
                            : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1.5">
                  <Video className="w-3 h-3 text-muted-foreground" />
                  Section background (optional)
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={section.backgroundVideoUrl}
                    onChange={(e) =>
                      setSections((prev) =>
                        prev.map((s) =>
                          s.id === section.id
                            ? { ...s, backgroundVideoUrl: e.target.value }
                            : s,
                        ),
                      )
                    }
                    placeholder="Falls back to the song background video"
                    className="text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onUploadSectionVideo(section.id)}
                    disabled={uploadingSectionId === section.id}
                  >
                    {uploadingSectionId === section.id
                      ? "Uploading..."
                      : "Upload"}
                  </Button>
                  {section.backgroundVideoUrl ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      title="Clear section background"
                      onClick={() =>
                        setSections((prev) =>
                          prev.map((s) =>
                            s.id === section.id
                              ? { ...s, backgroundVideoUrl: "" }
                              : s,
                          ),
                        )
                      }
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  ) : null}
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
                required={requireFirstLyrics && index === 0}
                placeholder="Enter section lyrics..."
                className="font-mono"
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SongFormBody({
  idPrefix,
  titleDefaultValue,
  artistDefaultValue,
  tagsDefaultValue,
  backgroundVideoUrl,
  setBackgroundVideoUrl,
  isUploadingVideo,
  fileInputRef,
  onFileSelected,
  sections,
  setSections,
  onAddSection,
  uploadingSectionId,
  onUploadSectionVideo,
}: {
  idPrefix: string;
  titleDefaultValue?: string;
  artistDefaultValue?: string;
  tagsDefaultValue?: string;
  backgroundVideoUrl: string;
  setBackgroundVideoUrl: (value: string) => void;
  isUploadingVideo: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileSelected: (e: React.ChangeEvent<HTMLInputElement>) => void;
  sections: SectionFormState[];
  setSections: React.Dispatch<React.SetStateAction<SectionFormState[]>>;
  onAddSection: () => void;
  uploadingSectionId: string | null;
  onUploadSectionVideo: (sectionId: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}-title`}>Song Title</Label>
            <Input
              id={`${idPrefix}-title`}
              name="title"
              required
              placeholder="Amazing Grace"
              defaultValue={titleDefaultValue}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}-artist`}>Artist</Label>
            <Input
              id={`${idPrefix}-artist`}
              name="artist"
              required
              placeholder="John Newton"
              defaultValue={artistDefaultValue}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-tags`}>Tags (comma separated)</Label>
          <Input
            id={`${idPrefix}-tags`}
            name="tags"
            placeholder="worship, slow, classic"
            defaultValue={tagsDefaultValue}
          />
        </div>
        <BackgroundVideoField
          value={backgroundVideoUrl}
          onChange={setBackgroundVideoUrl}
          isUploading={isUploadingVideo}
          fileInputRef={fileInputRef}
          onFileSelected={onFileSelected}
        />
      </div>
      <div className="lg:border-l lg:pl-6 lg:col-span-2">
        <SongSectionsEditor
          sections={sections}
          setSections={setSections}
          requireFirstLyrics
          onAddSection={onAddSection}
          uploadingSectionId={uploadingSectionId}
          onUploadSectionVideo={onUploadSectionVideo}
        />
      </div>
    </div>
  );
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
  const { songs, songsLoading, songsError, addSong, updateSong, deleteSong } =
    useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSong, setSelectedSong] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingSongId, setEditingSongId] = useState<string | null>(null);
  const [tagFilter, setTagFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"title" | "usage">("title");
  const [viewMode, setViewMode] = useState<"card" | "compact" | "table">(
    "card",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [sections, setSections] = useState(() => [
    createEmptySection(`${sectionIdPrefix}-0`),
  ]);
  const [backgroundVideoUrl, setBackgroundVideoUrl] = useState("");
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingSectionId, setUploadingSectionId] = useState<string | null>(
    null,
  );
  const sectionVideoFileInputRef = useRef<HTMLInputElement>(null);
  const sectionUploadTargetId = useRef<string | null>(null);

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

  const {
    page,
    setPage,
    pageSize,
    setPageSize,
    totalItems,
    totalPages,
    paginatedItems,
    rangeStart,
    rangeEnd,
  } = usePagination(filteredSongs, [searchTerm, tagFilter, sortBy]);

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
        intensity: section.intensity,
        backgroundVideoUrl: section.backgroundVideoUrl.trim() || null,
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
        backgroundVideoUrl: backgroundVideoUrl.trim() || null,
      });

      setIsAddingNew(false);
      nextSectionId.current = 1;
      setSections([createEmptySection(`${sectionIdPrefix}-0`)]);
      setBackgroundVideoUrl("");
      toast.success("Song added");
    } catch {
      toast.error("Failed to add song");
    } finally {
      setIsSaving(false);
    }
  };

  const openEditSong = (songId: string) => {
    const target = songs.find((s) => s.id === songId);
    if (!target) return;

    setEditingSongId(songId);
    setSections(
      target.sections.map((section, index) => ({
        id: `${sectionIdPrefix}-edit-${section.id}`,
        type: section.type,
        number: section.number ? String(section.number) : String(index + 1),
        lyrics: section.lyrics,
        intensity: section.intensity ?? null,
        backgroundVideoUrl: section.backgroundVideoUrl ?? "",
      })),
    );
    setBackgroundVideoUrl(target.backgroundVideoUrl ?? "");
  };

  const handleUpdateSong = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingSongId || !activeOrganizationId) return;

    const formData = new FormData(e.currentTarget);
    const validSections = sections
      .map((section) => ({
        type: section.type,
        number: section.number ? Number(section.number) : undefined,
        lyrics: section.lyrics.trim(),
        intensity: section.intensity,
        backgroundVideoUrl: section.backgroundVideoUrl.trim() || null,
      }))
      .filter((section) => section.lyrics.length > 0);

    if (validSections.length === 0) return;

    setIsSaving(true);
    try {
      await updateSong(editingSongId, {
        title: formData.get("title") as string,
        artist: formData.get("artist") as string,
        tags: (formData.get("tags") as string)
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        sections: validSections,
        backgroundVideoUrl: backgroundVideoUrl.trim() || null,
      });
      setEditingSongId(null);
      toast.success("Song updated");
    } catch {
      toast.error("Failed to update song");
    } finally {
      setIsSaving(false);
    }
  };

  const handleVideoFileSelected = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !activeOrganizationId) return;

    if (file.size > SONG_BACKGROUND_VIDEO_MAX_BYTES) {
      toast.error("Video exceeds the 20 MB limit");
      return;
    }

    setIsUploadingVideo(true);
    try {
      const { slide } = await uploadSongBackgroundVideo(
        activeOrganizationId,
        file,
      );
      setBackgroundVideoUrl(slide.url);
      toast.success("Background video uploaded");
    } catch {
      toast.error("Failed to upload background video");
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const handleUploadSectionVideo = (sectionId: string) => {
    sectionUploadTargetId.current = sectionId;
    sectionVideoFileInputRef.current?.click();
  };

  const handleSectionVideoFileSelected = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    const sectionId = sectionUploadTargetId.current;
    if (!file || !activeOrganizationId || !sectionId) return;

    if (file.size > SONG_BACKGROUND_VIDEO_MAX_BYTES) {
      toast.error("Video exceeds the 20 MB limit");
      return;
    }

    setUploadingSectionId(sectionId);
    try {
      const { slide } = await uploadSongBackgroundVideo(
        activeOrganizationId,
        file,
      );
      setSections((prev) =>
        prev.map((s) =>
          s.id === sectionId ? { ...s, backgroundVideoUrl: slide.url } : s,
        ),
      );
      toast.success("Section background uploaded");
    } catch {
      toast.error("Failed to upload section background");
    } finally {
      setUploadingSectionId(null);
      sectionUploadTargetId.current = null;
    }
  };

  const handleDeleteSong = async (songId: string) => {
    if (!confirm("Delete this song?")) return;

    try {
      await deleteSong(songId);
      if (selectedSong === songId) setSelectedSong(null);
    } catch {
      toast.error("Failed to delete song");
    }
  };

  const song = songs.find((s) => s.id === selectedSong);

  return (
    <div className="p-8 space-y-6">
      <input
        ref={sectionVideoFileInputRef}
        type="file"
        accept={SONG_BACKGROUND_VIDEO_ACCEPT}
        className="hidden"
        onChange={handleSectionVideoFileSelected}
      />
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
            <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Song</DialogTitle>
                <DialogDescription>
                  Add song metadata and section-based lyrics (verse, chorus,
                  bridge, etc.)
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddSong} className="space-y-4">
                <SongFormBody
                  idPrefix="new"
                  backgroundVideoUrl={backgroundVideoUrl}
                  setBackgroundVideoUrl={setBackgroundVideoUrl}
                  isUploadingVideo={isUploadingVideo}
                  fileInputRef={videoFileInputRef}
                  onFileSelected={handleVideoFileSelected}
                  uploadingSectionId={uploadingSectionId}
                  onUploadSectionVideo={handleUploadSectionVideo}
                  sections={sections}
                  setSections={setSections}
                  onAddSection={() =>
                    setSections((prev) => [
                      ...prev,
                      createEmptySection(
                        `${sectionIdPrefix}-${nextSectionId.current++}`,
                        String(prev.length + 1),
                      ),
                    ])
                  }
                />
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
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Label className="text-xs text-muted-foreground">View</Label>
          <Button
            size="sm"
            variant={viewMode === "card" ? "default" : "outline"}
            onClick={() => setViewMode("card")}
            aria-label="Card view"
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant={viewMode === "compact" ? "default" : "outline"}
            onClick={() => setViewMode("compact")}
            aria-label="Compact list view"
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant={viewMode === "table" ? "default" : "outline"}
            onClick={() => setViewMode("table")}
            aria-label="Table view"
          >
            <Table2 className="w-4 h-4" />
          </Button>
          <Label className="text-xs text-muted-foreground ml-2">Sort by</Label>
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

      {filteredSongs.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          No songs match your search or filters.
        </p>
      ) : viewMode === "table" ? (
        <div className="space-y-4">
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Artist</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead className="text-right">Usage</TableHead>
                  <TableHead className="w-[88px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems.map((song) => (
                  <TableRow
                    key={song.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedSong(song.id)}
                  >
                    <TableCell className="font-medium">{song.title}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {song.artist}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {song.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {song.tags.length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{song.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {song.usageCount}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditSong(song.id);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleDeleteSong(song.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <ListPagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div
            className={
              viewMode === "compact"
                ? "divide-y rounded-lg border"
                : "grid grid-cols-1 gap-4"
            }
          >
            {paginatedItems.map((song) =>
              viewMode === "compact" ? (
                <div
                  key={song.id}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => setSelectedSong(song.id)}
                >
                  <Music className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{song.title}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {song.artist}
                    </p>
                  </div>
                  <div className="hidden sm:flex gap-1 max-w-[200px] overflow-hidden">
                    {song.tags.slice(0, 2).map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-xs shrink-0"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground tabular-nums w-8 text-right">
                    {song.usageCount}
                  </span>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditSong(song.id);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        void handleDeleteSong(song.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <Card
                  key={song.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedSong(song.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                          <Music className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">
                            {song.title}
                          </h3>
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
                          <p className="text-2xl font-bold">
                            {song.usageCount}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditSong(song.id);
                            }}
                          >
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
              ),
            )}
          </div>
          <ListPagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      )}

      {/* Edit Song Dialog */}
      <Dialog
        open={editingSongId !== null}
        onOpenChange={(open) => {
          if (!open) setEditingSongId(null);
        }}
      >
        <DialogContent className="sm:max-w-5xl max-h-[90vh]">
          {editingSongId && (
            <>
              <DialogHeader>
                <DialogTitle>Edit Song</DialogTitle>
                <DialogDescription>
                  Update song metadata and section-based lyrics.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpdateSong} className="space-y-4">
                <SongFormBody
                  idPrefix="edit"
                  titleDefaultValue={
                    songs.find((s) => s.id === editingSongId)?.title
                  }
                  artistDefaultValue={
                    songs.find((s) => s.id === editingSongId)?.artist
                  }
                  tagsDefaultValue={songs
                    .find((s) => s.id === editingSongId)
                    ?.tags.join(", ")}
                  backgroundVideoUrl={backgroundVideoUrl}
                  setBackgroundVideoUrl={setBackgroundVideoUrl}
                  isUploadingVideo={isUploadingVideo}
                  fileInputRef={videoFileInputRef}
                  onFileSelected={handleVideoFileSelected}
                  uploadingSectionId={uploadingSectionId}
                  onUploadSectionVideo={handleUploadSectionVideo}
                  sections={sections}
                  setSections={setSections}
                  onAddSection={() =>
                    setSections((prev) => [
                      ...prev,
                      createEmptySection(
                        `${sectionIdPrefix}-edit-${nextSectionId.current++}`,
                        String(prev.length + 1),
                      ),
                    ])
                  }
                />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingSongId(null)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>

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
                {song.backgroundVideoUrl ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Video className="w-4 h-4" />
                    Background video configured — sections with their own
                    background override it live.
                  </div>
                ) : null}
                <div className="space-y-4">
                  {song.sections.map((section) => (
                    <Card key={section.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between gap-2">
                          <CardTitle className="text-sm uppercase text-muted-foreground">
                            {section.type} {section.number || ""}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            {section.backgroundVideoUrl ? (
                              <Badge variant="outline" className="text-xs">
                                <Video className="w-3 h-3 mr-1" />
                                Own background
                              </Badge>
                            ) : null}
                            {section.backgroundVideoUrl ||
                            song.backgroundVideoUrl ? (
                              <Badge variant="outline" className="text-xs">
                                {getSectionIntensity(section)}% intensity
                              </Badge>
                            ) : null}
                          </div>
                        </div>
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
