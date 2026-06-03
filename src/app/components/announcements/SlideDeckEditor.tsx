import { useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { AnnouncementSlide } from "../../contexts/AppContext";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { uploadAnnouncementSlide } from "@frontend/lib/api/announcements";
import {
  PRESENTATION_MEDIA_ACCEPT,
  presentationMediaValidationError,
} from "@frontend/lib/mediaUpload";
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
  onUploadingChange?: (isUploading: boolean) => void;
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
  onUploadingChange,
}: SlideDeckEditorProps) {
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const setUploading = (value: boolean) => {
    setIsUploading(value);
    onUploadingChange?.(value);
  };

  const moveSlide = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= slides.length) return;
    const next = [...slides];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    onSlidesChange(next);
  };

  const openFilePicker = () => {
    if (!organizationId) {
      toast.error("Select an organization in the header before uploading");
      return;
    }

    const input = fileInputRef.current;
    if (!input) {
      toast.error("File picker is not ready. Try again.");
      return;
    }

    input.click();
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (fileList?.length) {
      // Copy before clearing — clearing can empty the list in some browsers.
      const files = Array.from(fileList);
      event.target.value = "";

      if (!organizationId) {
        toast.error("Select an organization before uploading");
        return;
      }

      const validFiles: File[] = [];
      for (const file of files) {
        const validationError = presentationMediaValidationError(file);
        if (validationError) {
          toast.error(validationError);
          continue;
        }
        validFiles.push(file);
      }

      if (!validFiles.length) {
        toast.error("No valid image or video files were selected");
        return;
      }

      setUploading(true);
      const uploaded: AnnouncementSlide[] = [];

      try {
        for (const file of validFiles) {
          try {
            const { slide } = await uploadAnnouncementSlide(
              organizationId,
              file,
            );
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
      } finally {
        setUploading(false);
      }
    }
  };

  const fileInput =
    typeof document !== "undefined"
      ? createPortal(
          <input
            id={fileInputId}
            ref={fileInputRef}
            type="file"
            tabIndex={-1}
            aria-hidden
            multiple
            accept={`${PRESENTATION_MEDIA_ACCEPT},image/*,video/*`}
            disabled={disabled || isUploading}
            onChange={(event) => void handleUpload(event)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: 1,
              height: 1,
              opacity: 0,
              pointerEvents: "none",
            }}
          />,
          document.body,
        )
      : null;

  return (
    <div className="space-y-3 rounded-lg border p-3">
      {fileInput}
      <Label>Presentation format</Label>
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          variant={format === "text" ? "default" : "outline"}
          disabled={disabled || isUploading}
          onClick={() => onFormatChange("text")}
        >
          <Type className="w-4 h-4 mr-1" />
          Text
        </Button>
        <Button
          type="button"
          size="sm"
          variant={format === "slides" ? "default" : "outline"}
          disabled={disabled || isUploading}
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
            disabled={disabled || isUploading}
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
            disabled={disabled || isUploading || !organizationId}
            onClick={openFilePicker}
          >
            <Upload className="w-4 h-4 mr-2" />
            {isUploading ? "Uploading..." : "Add slides"}
          </Button>

          {!organizationId && (
            <p className="text-xs text-destructive">
              Select an organization in the header before uploading slides.
            </p>
          )}

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
                      disabled={disabled || isUploading || index === 0}
                      onClick={() => moveSlide(index, -1)}
                    >
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={
                        disabled || isUploading || index === slides.length - 1
                      }
                      onClick={() => moveSlide(index, 1)}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={disabled || isUploading}
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
