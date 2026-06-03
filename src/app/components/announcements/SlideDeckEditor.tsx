import type { AnnouncementSlide } from "../../contexts/AppContext";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import {
  ANNOUNCEMENT_SLIDE_ACCEPT,
  ANNOUNCEMENT_SLIDE_MAX_BYTES,
  uploadAnnouncementSlide,
} from "@frontend/lib/api/announcements";
import {
  ChevronDown,
  ChevronUp,
  Trash2,
  Upload,
  Images,
  Type,
} from "lucide-react";
import { toast } from "sonner";

export type AnnouncementFormat = "text" | "slides";

type SlideDeckEditorProps = {
  organizationId: string | null;
  format: AnnouncementFormat;
  onFormatChange: (format: AnnouncementFormat) => void;
  slides: AnnouncementSlide[];
  onSlidesChange: (slides: AnnouncementSlide[]) => void;
  body: string;
  onBodyChange: (body: string) => void;
  disabled?: boolean;
};

export function SlideDeckEditor({
  organizationId,
  format,
  onFormatChange,
  slides,
  onSlidesChange,
  body,
  onBodyChange,
  disabled = false,
}: SlideDeckEditorProps) {
  const moveSlide = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= slides.length) return;
    const next = [...slides];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    onSlidesChange(next);
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    event.target.value = "";
    if (!files?.length) return;

    if (!organizationId) {
      toast.error("Select an organization before uploading");
      return;
    }

    const validFiles = [...files].filter((file) => {
      if (file.size > ANNOUNCEMENT_SLIDE_MAX_BYTES) {
        toast.error(`${file.name} exceeds the 20 MB limit`);
        return false;
      }
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
        toast.error(`${file.name} is not a supported image or video`);
        return false;
      }
      return true;
    });

    if (!validFiles.length) return;

    const uploaded: AnnouncementSlide[] = [];
    for (const file of validFiles) {
      try {
        const { slide } = await uploadAnnouncementSlide(organizationId, file);
        uploaded.push(slide);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : `Failed to upload ${file.name}`,
        );
      }
    }

    if (uploaded.length) {
      onSlidesChange([...slides, ...uploaded]);
      onFormatChange("slides");
      toast.success(
        uploaded.length === 1
          ? "Slide uploaded"
          : `${uploaded.length} slides uploaded`,
      );
    }
  };

  return (
    <div className="space-y-3 rounded-lg border p-3">
      <Label>Presentation format</Label>
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          variant={format === "text" ? "default" : "outline"}
          disabled={disabled}
          onClick={() => onFormatChange("text")}
        >
          <Type className="w-4 h-4 mr-1" />
          Text
        </Button>
        <Button
          type="button"
          size="sm"
          variant={format === "slides" ? "default" : "outline"}
          disabled={disabled}
          onClick={() => onFormatChange("slides")}
        >
          <Images className="w-4 h-4 mr-1" />
          Slide deck
        </Button>
      </div>

      {format === "text" ? (
        <div className="space-y-2">
          <Label htmlFor="announcement-body">Body</Label>
          <textarea
            id="announcement-body"
            rows={6}
            disabled={disabled}
            className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={body}
            onChange={(e) => onBodyChange(e.target.value)}
          />
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Upload one or more images or videos (max 20 MB each). Use Next /
            Previous in Live Mode to step through slides.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || !organizationId}
            asChild
          >
            <label className="cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              Add slides
              <input
                type="file"
                className="sr-only"
                multiple
                accept={ANNOUNCEMENT_SLIDE_ACCEPT}
                disabled={disabled}
                onChange={(event) => void handleUpload(event)}
              />
            </label>
          </Button>

          {slides.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No slides yet. Upload at least one file.
            </p>
          ) : (
            <div className="grid gap-2">
              {slides.map((slide, index) => (
                <div
                  key={`${slide.url}-${index}`}
                  className="flex items-center gap-2 rounded-md border p-2 bg-muted/20"
                >
                  <div className="w-16 h-12 shrink-0 rounded overflow-hidden bg-black/10">
                    {slide.type === "video" ? (
                      <video
                        src={slide.url}
                        muted
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={slide.url}
                        alt={`Slide ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 text-xs text-muted-foreground">
                    Slide {index + 1} · {slide.type}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={disabled || index === 0}
                      onClick={() => moveSlide(index, -1)}
                    >
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={disabled || index === slides.length - 1}
                      onClick={() => moveSlide(index, 1)}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={disabled}
                      onClick={() =>
                        onSlidesChange(slides.filter((_, i) => i !== index))
                      }
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function inferAnnouncementFormat(
  slides: AnnouncementSlide[],
  body: string,
): AnnouncementFormat {
  if (slides.length > 0) return "slides";
  if (body.trim()) return "text";
  return "slides";
}
