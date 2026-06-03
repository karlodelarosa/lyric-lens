import { useMemo, useState } from "react";
import { useOrganization } from "@frontend/contexts/OrganizationContext";
import {
  useApp,
  type AnnouncementSlide,
} from "../../contexts/AppContext";
import {
  SlideDeckEditor,
  inferAnnouncementFormat,
  type AnnouncementFormat,
} from "../announcements/SlideDeckEditor";
import { Megaphone, Plus, Pencil, Trash2, Search } from "lucide-react";
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
import { format, isPast, parseISO } from "date-fns";

const emptyForm = {
  title: "",
  body: "",
  category: "",
  expiresAt: "",
  slides: [] as AnnouncementSlide[],
  format: "text" as AnnouncementFormat,
};

export function AnnouncementBank() {
  const {
    activeOrganizationId,
    isLoading: isOrgLoading,
    loadError: orgLoadError,
  } = useOrganization();
  const {
    announcements,
    announcementsLoading,
    announcementsError,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
  } = useApp();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  const categories = useMemo(() => {
    const values = announcements
      .map((item) => item.category?.trim())
      .filter((value): value is string => Boolean(value));
    return [...new Set(values)].sort();
  }, [announcements]);

  const filteredAnnouncements = announcements.filter((item) => {
    const keyword = search.trim().toLowerCase();
    const matchesSearch =
      !keyword ||
      item.title.toLowerCase().includes(keyword) ||
      item.body.toLowerCase().includes(keyword) ||
      (item.category?.toLowerCase().includes(keyword) ?? false);

    const matchesCategory = !categoryFilter || item.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIsDialogOpen(true);
  };

  const openEdit = (id: string) => {
    const item = announcements.find((entry) => entry.id === id);
    if (!item) return;

    setEditingId(id);
    setForm({
      title: item.title,
      body: item.body,
      category: item.category ?? "",
      expiresAt: item.expiresAt ? item.expiresAt.slice(0, 10) : "",
      slides: [...item.slides],
      format: inferAnnouncementFormat(item.slides, item.body),
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (form.format === "slides" && form.slides.length === 0) {
      toast.error("Add at least one slide or switch to text format");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        body: form.format === "text" ? form.body : "",
        category: form.category.trim() || null,
        expiresAt: form.expiresAt
          ? new Date(`${form.expiresAt}T23:59:59`).toISOString()
          : null,
        slides: form.format === "slides" ? form.slides : [],
      };

      if (editingId) {
        await updateAnnouncement(editingId, payload);
        toast.success("Announcement updated");
      } else {
        await addAnnouncement(payload);
        toast.success("Announcement created");
      }

      setIsDialogOpen(false);
      setForm(emptyForm);
      setEditingId(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save announcement",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this announcement from the bank?")) return;

    try {
      await deleteAnnouncement(id);
      toast.success("Announcement deleted");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete announcement",
      );
    }
  };

  if (!activeOrganizationId && !isOrgLoading) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">
          Select or create an organization to manage announcements.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Megaphone className="w-8 h-8" />
            Announcement Bank
          </h1>
          <p className="text-muted-foreground mt-1">
            Text announcements or multi-slide decks for service segments.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4 mr-2" />
              New announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit announcement" : "New announcement"}
              </DialogTitle>
              <DialogDescription>
                Use a slide deck for image/video announcements, or text for
                simple copy.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="announcement-title">Title</Label>
                <Input
                  id="announcement-title"
                  value={form.title}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                />
              </div>

              <SlideDeckEditor
                organizationId={activeOrganizationId}
                format={form.format}
                onFormatChange={(format) =>
                  setForm((prev) => ({ ...prev, format }))
                }
                slides={form.slides}
                onSlidesChange={(slides) =>
                  setForm((prev) => ({ ...prev, slides }))
                }
                body={form.body}
                onBodyChange={(body) =>
                  setForm((prev) => ({ ...prev, body }))
                }
                disabled={isSaving}
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="announcement-category">Category</Label>
                  <Input
                    id="announcement-category"
                    placeholder="Events, Giving, Volunteers"
                    value={form.category}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="announcement-expires">Expires</Label>
                  <Input
                    id="announcement-expires"
                    type="date"
                    value={form.expiresAt}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        expiresAt: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <Button
                className="w-full"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : editingId ? "Update" : "Create"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {(orgLoadError || announcementsError) && (
        <p className="text-sm text-destructive">
          {orgLoadError ?? announcementsError}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search announcements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="h-10 rounded-md border bg-background px-3 text-sm"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {announcementsLoading ? (
        <p className="text-muted-foreground">Loading announcements...</p>
      ) : filteredAnnouncements.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No announcements yet. Create reusable copy or slide decks for your
            services.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredAnnouncements.map((item) => {
            const isExpired =
              item.expiresAt && isPast(parseISO(item.expiresAt));
            const isSlideDeck = item.slides.length > 0;

            return (
              <Card key={item.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(item.id)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {isSlideDeck && (
                      <Badge variant="secondary">
                        {item.slides.length} slide
                        {item.slides.length === 1 ? "" : "s"}
                      </Badge>
                    )}
                    {!isSlideDeck && (
                      <Badge variant="outline">Text</Badge>
                    )}
                    {item.category && (
                      <Badge variant="secondary">{item.category}</Badge>
                    )}
                    {isExpired && <Badge variant="destructive">Expired</Badge>}
                    {item.expiresAt && !isExpired && (
                      <Badge variant="outline">
                        Until {format(parseISO(item.expiresAt), "MMM d, yyyy")}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {isSlideDeck ? (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {item.slides.slice(0, 4).map((slide, index) => (
                        <div
                          key={`${slide.url}-${index}`}
                          className="w-14 h-10 shrink-0 rounded border overflow-hidden bg-muted/30"
                        >
                          {slide.type === "video" ? (
                            <video
                              src={slide.url}
                              muted
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <img
                              src={slide.url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      ))}
                      {item.slides.length > 4 && (
                        <span className="text-xs text-muted-foreground self-center">
                          +{item.slides.length - 4}
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground line-clamp-4 whitespace-pre-wrap">
                      {item.body || "No body text"}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
