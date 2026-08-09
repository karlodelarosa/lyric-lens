import { useEffect, useMemo, useRef, useState } from "react";
import { usePagination } from "../../lib/usePagination";
import { ListPagination } from "../ListPagination";
import { Link } from "react-router";
import { useOrganization } from "@frontend/contexts/OrganizationContext";
import {
  getServiceFlow,
  SERVICE_FLOW_WELCOME_MEDIA_ACCEPT,
  SERVICE_FLOW_WELCOME_MEDIA_MAX_BYTES,
  uploadServiceFlowWelcomeMedia,
} from "@frontend/lib/api/serviceFlows";
import { useApp, type ServiceFlowSegmentKind } from "../../contexts/AppContext";
import { buildLiveUrl } from "../../lib/liveStateSync";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  GitBranch,
  GripVertical,
  Plus,
  Trash2,
  Save,
  Copy,
  Radio,
  Pencil,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
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
import { toast } from "sonner";

type EditableSegment = {
  clientId: string;
  label: string;
  kind: ServiceFlowSegmentKind;
  notes: string;
  setlistId: string;
  announcementIds: string[];
  songId: string;
  welcomeMediaUrl: string;
  welcomeMediaType: "image" | "video";
  countdownValue: string;
  countdownUnit: "seconds" | "minutes";
};

const SEGMENT_PRESETS: { label: string; kind: ServiceFlowSegmentKind }[] = [
  { label: "Opening Prayer", kind: "cue" },
  { label: "Remarks", kind: "cue" },
  { label: "Praise & Worship", kind: "music" },
  { label: "Opening Song", kind: "song" },
  { label: "Altar Call", kind: "song" },
  { label: "Offering", kind: "cue" },
  { label: "Announcements", kind: "announcements" },
  { label: "Welcome", kind: "welcome" },
  { label: "Countdown", kind: "countdown" },
  { label: "Sermon", kind: "cue" },
  { label: "Benediction", kind: "cue" },
];

function createSegment(partial?: Partial<EditableSegment>): EditableSegment {
  return {
    clientId: crypto.randomUUID(),
    label: partial?.label ?? "New Segment",
    kind: partial?.kind ?? "cue",
    notes: partial?.notes ?? "",
    setlistId: partial?.setlistId ?? "",
    announcementIds: partial?.announcementIds ?? [],
    songId: partial?.songId ?? "",
    welcomeMediaUrl: partial?.welcomeMediaUrl ?? "",
    welcomeMediaType: partial?.welcomeMediaType ?? "image",
    countdownValue: partial?.countdownValue ?? "5",
    countdownUnit: partial?.countdownUnit ?? "minutes",
  };
}

interface DraggableSegmentProps {
  segment: EditableSegment;
  index: number;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  onChange: (clientId: string, patch: Partial<EditableSegment>) => void;
  onRemove: (clientId: string) => void;
  setlists: { id: string; name: string }[];
  announcements: { id: string; title: string }[];
  songs: { id: string; title: string; artist: string }[];
  organizationId: string | null;
}

function DraggableSegment({
  segment,
  index,
  onMove,
  onChange,
  onRemove,
  setlists,
  announcements,
  songs,
  organizationId,
}: DraggableSegmentProps) {
  const [isUploadingWelcomeMedia, setIsUploadingWelcomeMedia] =
    useState(false);
  const welcomeMediaFileInputRef = useRef<HTMLInputElement>(null);

  const handleWelcomeMediaFileSelected = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !organizationId) return;

    if (file.size > SERVICE_FLOW_WELCOME_MEDIA_MAX_BYTES) {
      toast.error("File exceeds the 20 MB limit");
      return;
    }

    setIsUploadingWelcomeMedia(true);
    try {
      const { slide } = await uploadServiceFlowWelcomeMedia(
        organizationId,
        file,
      );
      onChange(segment.clientId, {
        welcomeMediaUrl: slide.url,
        welcomeMediaType: slide.type,
      });
      toast.success("Welcome media uploaded");
    } catch {
      toast.error("Failed to upload welcome media");
    } finally {
      setIsUploadingWelcomeMedia(false);
    }
  };
  const [{ isDragging }, drag] = useDrag({
    type: "SEGMENT",
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: "SEGMENT",
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        onMove(item.index, index);
        item.index = index;
      }
    },
  });

  const toggleAnnouncement = (announcementId: string, checked: boolean) => {
    const current = segment.announcementIds;
    const next = checked
      ? [...current, announcementId]
      : current.filter((id) => id !== announcementId);
    onChange(segment.clientId, { announcementIds: next });
  };

  return (
    <div
      ref={(node) => {
        drag(drop(node));
      }}
      className={`rounded-lg border bg-card p-4 space-y-3 ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <GripVertical className="w-5 h-5 text-muted-foreground mt-2 cursor-move" />
        <div className="flex-1 grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Label</Label>
            <Input
              value={segment.label}
              onChange={(e) =>
                onChange(segment.clientId, { label: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Kind</Label>
            <Select
              value={segment.kind}
              onValueChange={(value: ServiceFlowSegmentKind) =>
                onChange(segment.clientId, {
                  kind: value,
                  setlistId: value === "music" ? segment.setlistId : "",
                  announcementIds:
                    value === "announcements" ? segment.announcementIds : [],
                  songId: value === "song" ? segment.songId : "",
                  welcomeMediaUrl:
                    value === "welcome" ? segment.welcomeMediaUrl : "",
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cue">Cue (notes only)</SelectItem>
                <SelectItem value="music">Music (setlist)</SelectItem>
                <SelectItem value="song">Song (single)</SelectItem>
                <SelectItem value="announcements">Announcements</SelectItem>
                <SelectItem value="welcome">Welcome media</SelectItem>
                <SelectItem value="countdown">Countdown</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(segment.clientId)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-2">
        <Label>Operator notes</Label>
        <Textarea
          rows={2}
          value={segment.notes}
          onChange={(e) =>
            onChange(segment.clientId, { notes: e.target.value })
          }
          placeholder="Private cues for the operator"
        />
      </div>

      {segment.kind === "music" && (
        <div className="space-y-2">
          <Label>Setlist</Label>
          <Select
            value={segment.setlistId || "none"}
            onValueChange={(value) =>
              onChange(segment.clientId, {
                setlistId: value === "none" ? "" : value,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select setlist" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No setlist</SelectItem>
              {setlists.map((setlist) => (
                <SelectItem key={setlist.id} value={setlist.id}>
                  {setlist.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {segment.kind === "announcements" && (
        <div className="space-y-2">
          <Label>Announcements from bank</Label>
          {announcements.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No announcements in the bank yet.{" "}
              <Link to="/announcements" className="underline">
                Add some first
              </Link>
              .
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {announcements.map((item) => {
                const checked = segment.announcementIds.includes(item.id);
                return (
                  <label
                    key={item.id}
                    className="flex items-center gap-1 text-xs border rounded px-2 py-1 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) =>
                        toggleAnnouncement(item.id, e.target.checked)
                      }
                    />
                    {item.title}
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}

      {segment.kind === "song" && (
        <div className="space-y-2">
          <Label>Song</Label>
          {songs.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No songs in your library yet.{" "}
              <Link to="/songs" className="underline">
                Add some first
              </Link>
              .
            </p>
          ) : (
            <Select
              value={segment.songId || "none"}
              onValueChange={(value) =>
                onChange(segment.clientId, {
                  songId: value === "none" ? "" : value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select song" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No song</SelectItem>
                {songs.map((song) => (
                  <SelectItem key={song.id} value={song.id}>
                    {song.title}
                    {song.artist ? ` — ${song.artist}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <p className="text-xs text-muted-foreground">
            Use this for a single opening song, altar call, or similar — no
            setlist required.
          </p>
        </div>
      )}

      {segment.kind === "welcome" && (
        <div className="space-y-2">
          <Label>Welcome media (image or video loop)</Label>
          {segment.welcomeMediaUrl ? (
            <div className="relative w-full max-w-xs aspect-video overflow-hidden rounded-md border bg-black">
              {segment.welcomeMediaType === "video" ? (
                <video
                  key={segment.welcomeMediaUrl}
                  src={segment.welcomeMediaUrl}
                  muted
                  loop
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={segment.welcomeMediaUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          ) : null}
          <div className="flex gap-2">
            <Input
              value={segment.welcomeMediaUrl}
              onChange={(e) =>
                onChange(segment.clientId, { welcomeMediaUrl: e.target.value })
              }
              placeholder="https://your-cdn.com/welcome.mp4"
            />
            <Select
              value={segment.welcomeMediaType}
              onValueChange={(value: "image" | "video") =>
                onChange(segment.clientId, { welcomeMediaType: value })
              }
            >
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="video">Video</SelectItem>
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              onClick={() => welcomeMediaFileInputRef.current?.click()}
              disabled={isUploadingWelcomeMedia}
            >
              {isUploadingWelcomeMedia ? "Uploading..." : "Upload"}
            </Button>
          </div>
          <input
            ref={welcomeMediaFileInputRef}
            type="file"
            accept={SERVICE_FLOW_WELCOME_MEDIA_ACCEPT}
            className="hidden"
            onChange={handleWelcomeMediaFileSelected}
          />
        </div>
      )}

      {segment.kind === "countdown" && (
        <div className="space-y-2">
          <Label>Countdown duration</Label>
          <div className="flex gap-2 items-center">
            <Input
              type="number"
              min={1}
              className="w-24"
              value={segment.countdownValue}
              onChange={(e) =>
                onChange(segment.clientId, { countdownValue: e.target.value })
              }
            />
            <Select
              value={segment.countdownUnit}
              onValueChange={(value: "seconds" | "minutes") =>
                onChange(segment.clientId, { countdownUnit: value })
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="seconds">Seconds</SelectItem>
                <SelectItem value="minutes">Minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-muted-foreground">
            Selecting this segment live arms the timer; the operator starts it
            from Live Mode, and it auto-advances to the next segment at 0:00.
          </p>
        </div>
      )}
    </div>
  );
}

export function ServiceFlowBuilder() {
  const {
    activeOrganizationId,
    isLoading: isOrgLoading,
    loadError: orgLoadError,
  } = useOrganization();
  const {
    setlists,
    announcements,
    songs,
    serviceFlowList,
    serviceFlowsLoading,
    serviceFlowsError,
    addServiceFlow,
    updateServiceFlow,
    deleteServiceFlow,
    duplicateServiceFlow,
  } = useApp();

  const [editingFlowId, setEditingFlowId] = useState<string | null>(null);
  const [flowTitle, setFlowTitle] = useState("");
  const [flowDescription, setFlowDescription] = useState("");
  const [segments, setSegments] = useState<EditableSegment[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingFlow, setIsLoadingFlow] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [customLabel, setCustomLabel] = useState("");
  const [customKind, setCustomKind] = useState<ServiceFlowSegmentKind>("cue");

  const flowsPagination = usePagination(serviceFlowList, [
    serviceFlowList.length,
  ]);

  const resetBuilder = () => {
    setEditingFlowId(null);
    setFlowTitle("");
    setFlowDescription("");
    setSegments([]);
  };

  const loadFlow = async (flowId: string) => {
    if (!activeOrganizationId) return;

    setIsLoadingFlow(true);
    try {
      const { serviceFlow } = await getServiceFlow(
        activeOrganizationId,
        flowId,
      );
      setEditingFlowId(serviceFlow.id);
      setFlowTitle(serviceFlow.title);
      setFlowDescription(serviceFlow.description ?? "");
      setSegments(
        serviceFlow.segments.map((segment) => {
          const countdownSeconds = segment.countdownSeconds ?? 300;
          const useMinutes =
            countdownSeconds >= 60 && countdownSeconds % 60 === 0;

          return createSegment({
            label: segment.label,
            kind: segment.kind,
            notes: segment.notes ?? "",
            setlistId: segment.setlistId ?? "",
            announcementIds: segment.announcements.map((item) => item.id),
            songId: segment.songId ?? "",
            welcomeMediaUrl: segment.welcomeMedia?.url ?? "",
            welcomeMediaType: segment.welcomeMedia?.type ?? "image",
            countdownValue: String(
              useMinutes ? countdownSeconds / 60 : countdownSeconds,
            ),
            countdownUnit: useMinutes ? "minutes" : "seconds",
          });
        }),
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load service flow",
      );
    } finally {
      setIsLoadingFlow(false);
    }
  };

  useEffect(() => {
    if (!editingFlowId) return;
    void loadFlow(editingFlowId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingFlowId, activeOrganizationId]);

  const handleMoveSegment = (dragIndex: number, hoverIndex: number) => {
    setSegments((prev) => {
      const next = [...prev];
      const [removed] = next.splice(dragIndex, 1);
      next.splice(hoverIndex, 0, removed);
      return next;
    });
  };

  const handleChangeSegment = (
    clientId: string,
    patch: Partial<EditableSegment>,
  ) => {
    setSegments((prev) =>
      prev.map((segment) =>
        segment.clientId === clientId ? { ...segment, ...patch } : segment,
      ),
    );
  };

  const handleRemoveSegment = (clientId: string) => {
    setSegments((prev) =>
      prev.filter((segment) => segment.clientId !== clientId),
    );
  };

  const addPresetSegment = (preset: {
    label: string;
    kind: ServiceFlowSegmentKind;
  }) => {
    setSegments((prev) => [...prev, createSegment(preset)]);
    setIsAddDialogOpen(false);
  };

  const addCustomSegment = () => {
    if (!customLabel.trim()) {
      toast.error("Segment label is required");
      return;
    }

    setSegments((prev) => [
      ...prev,
      createSegment({ label: customLabel.trim(), kind: customKind }),
    ]);
    setCustomLabel("");
    setCustomKind("cue");
    setIsAddDialogOpen(false);
  };

  const buildPayloadSegments = () =>
    segments.map((segment) => {
      const countdownRaw = Number(segment.countdownValue);
      const countdownSeconds =
        segment.kind === "countdown" && Number.isFinite(countdownRaw) && countdownRaw > 0
          ? Math.round(
              countdownRaw * (segment.countdownUnit === "minutes" ? 60 : 1),
            )
          : null;

      return {
        label: segment.label.trim(),
        kind: segment.kind,
        notes: segment.notes.trim() || null,
        setlistId:
          segment.kind === "music" && segment.setlistId
            ? segment.setlistId
            : null,
        announcementIds:
          segment.kind === "announcements" ? segment.announcementIds : [],
        songId:
          segment.kind === "song" && segment.songId ? segment.songId : null,
        welcomeMedia:
          segment.kind === "welcome" && segment.welcomeMediaUrl
            ? {
                url: segment.welcomeMediaUrl,
                type: segment.welcomeMediaType,
              }
            : null,
        countdownSeconds,
      };
    });

  const handleSave = async () => {
    if (!flowTitle.trim()) {
      toast.error("Flow title is required");
      return;
    }

    if (segments.length === 0) {
      toast.error("Add at least one segment");
      return;
    }

    for (const segment of segments) {
      if (!segment.label.trim()) {
        toast.error("Every segment needs a label");
        return;
      }

      if (
        segment.kind === "countdown" &&
        !(Number(segment.countdownValue) > 0)
      ) {
        toast.error(`"${segment.label}" needs a countdown duration above 0`);
        return;
      }
    }

    setIsSaving(true);
    try {
      const payload = {
        title: flowTitle.trim(),
        description: flowDescription.trim() || null,
        segments: buildPayloadSegments(),
      };

      if (editingFlowId) {
        await updateServiceFlow(editingFlowId, payload);
        toast.success("Service flow updated");
      } else {
        const created = await addServiceFlow(payload);
        setEditingFlowId(created.id);
        toast.success("Service flow created");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save service flow",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (flowId: string) => {
    if (!window.confirm("Delete this service flow?")) return;

    try {
      await deleteServiceFlow(flowId);
      if (editingFlowId === flowId) resetBuilder();
      toast.success("Service flow deleted");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete service flow",
      );
    }
  };

  const handleDuplicate = async (flowId: string) => {
    try {
      const duplicated = await duplicateServiceFlow(flowId);
      await loadFlow(duplicated.id);
      toast.success("Service flow duplicated");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to duplicate service flow",
      );
    }
  };

  if (!activeOrganizationId && !isOrgLoading) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">
          Select or create an organization to manage service flows.
        </p>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <GitBranch className="w-8 h-8" />
              Service Flows
            </h1>
            <p className="text-muted-foreground mt-1">
              Build a run-of-show with flexible segments, setlists, and
              announcements.
            </p>
          </div>
          <Button variant="outline" onClick={resetBuilder}>
            <Plus className="w-4 h-4 mr-2" />
            New flow
          </Button>
        </div>

        {(orgLoadError || serviceFlowsError) && (
          <p className="text-sm text-destructive">
            {orgLoadError ?? serviceFlowsError}
          </p>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {editingFlowId ? "Edit flow" : "Create flow"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingFlow ? (
                <p className="text-sm text-muted-foreground">Loading flow...</p>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={flowTitle}
                      onChange={(e) => setFlowTitle(e.target.value)}
                      placeholder="Sunday Morning"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      rows={2}
                      value={flowDescription}
                      onChange={(e) => setFlowDescription(e.target.value)}
                      placeholder="Optional notes about this flow"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Segments</Label>
                    <Dialog
                      open={isAddDialogOpen}
                      onOpenChange={setIsAddDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Plus className="w-4 h-4 mr-1" />
                          Add segment
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add segment</DialogTitle>
                          <DialogDescription>
                            Use a preset or create a custom segment like
                            Birthday Greetings.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="flex flex-wrap gap-2">
                            {SEGMENT_PRESETS.map((preset) => (
                              <Button
                                key={preset.label}
                                size="sm"
                                variant="secondary"
                                onClick={() => addPresetSegment(preset)}
                              >
                                {preset.label}
                              </Button>
                            ))}
                          </div>
                          <div className="border-t pt-4 space-y-3">
                            <p className="text-sm font-medium">
                              Custom segment
                            </p>
                            <Input
                              placeholder="e.g. Birthday Greetings"
                              value={customLabel}
                              onChange={(e) => setCustomLabel(e.target.value)}
                            />
                            <Select
                              value={customKind}
                              onValueChange={(value: ServiceFlowSegmentKind) =>
                                setCustomKind(value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="cue">Cue</SelectItem>
                                <SelectItem value="music">Music</SelectItem>
                                <SelectItem value="song">Song</SelectItem>
                                <SelectItem value="announcements">
                                  Announcements
                                </SelectItem>
                                <SelectItem value="welcome">
                                  Welcome media
                                </SelectItem>
                                <SelectItem value="countdown">
                                  Countdown
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              className="w-full"
                              onClick={addCustomSegment}
                            >
                              Add custom segment
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {segments.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No segments yet. Add opening prayer, P&amp;W,
                      announcements, or any custom segment.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {segments.map((segment, index) => (
                        <DraggableSegment
                          key={segment.clientId}
                          segment={segment}
                          index={index}
                          onMove={handleMoveSegment}
                          onChange={handleChangeSegment}
                          onRemove={handleRemoveSegment}
                          setlists={setlists.map((s) => ({
                            id: s.id,
                            name: s.name,
                          }))}
                          announcements={announcements.map((a) => ({
                            id: a.id,
                            title: a.title,
                          }))}
                          songs={songs.map((s) => ({
                            id: s.id,
                            title: s.title,
                            artist: s.artist,
                          }))}
                          organizationId={activeOrganizationId}
                        />
                      ))}
                    </div>
                  )}

                  <Button
                    className="w-full"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? "Saving..." : "Save flow"}
                  </Button>

                  {editingFlowId && (
                    <Button variant="outline" className="w-full" asChild>
                      <Link to={buildLiveUrl({ serviceFlowId: editingFlowId })}>
                        <Radio className="w-4 h-4 mr-2" />
                        Go Live with this flow
                      </Link>
                    </Button>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Card className="lg:order-first">
            <CardHeader>
              <CardTitle>Saved flows</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {serviceFlowsLoading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : serviceFlowList.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No service flows yet.
                </p>
              ) : (
                <>
                  {flowsPagination.paginatedItems.map((flow) => (
                    <div
                      key={flow.id}
                      className="p-4 rounded-lg border flex items-center justify-between gap-3"
                    >
                      <div>
                        <p className="font-medium">{flow.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {flow.segmentCount} segment
                          {flow.segmentCount === 1 ? "" : "s"}
                        </p>
                        {flow.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {flow.description}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 justify-end">
                        <Badge variant="secondary">
                          {flow.segmentCount} steps
                        </Badge>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setEditingFlowId(flow.id)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDuplicate(flow.id)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(flow.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <Link to={buildLiveUrl({ serviceFlowId: flow.id })}>
                            <Radio className="w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                  <ListPagination
                    page={flowsPagination.page}
                    totalPages={flowsPagination.totalPages}
                    totalItems={flowsPagination.totalItems}
                    rangeStart={flowsPagination.rangeStart}
                    rangeEnd={flowsPagination.rangeEnd}
                    pageSize={flowsPagination.pageSize}
                    onPageChange={flowsPagination.setPage}
                    onPageSizeChange={flowsPagination.setPageSize}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DndProvider>
  );
}
