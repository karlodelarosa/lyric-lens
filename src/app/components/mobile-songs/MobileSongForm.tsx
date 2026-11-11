import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import {
  type NewSongInput,
  type Song,
  type SongSectionType,
} from "../../contexts/AppContext";
import {
  createEmptyMobileSongSection,
  createMobileSongFormState,
  serializeMobileSongForm,
  type MobileSongFormSection,
} from "../../lib/mobileSongUtils";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";

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

type MobileSongFormProps = {
  song?: Song;
  onCancel: () => void;
  onSave: (input: NewSongInput) => Promise<void>;
};

export function MobileSongForm({
  song,
  onCancel,
  onSave,
}: MobileSongFormProps) {
  const initialForm = useMemo(() => createMobileSongFormState(song), [song]);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const nextSectionId = useRef(initialForm.sections.length + 1);
  const isDirty = JSON.stringify(form) !== JSON.stringify(initialForm);

  useEffect(() => {
    const warnAboutUnsavedChanges = (event: BeforeUnloadEvent) => {
      if (!isDirty || isSaving) return;
      event.preventDefault();
    };

    window.addEventListener("beforeunload", warnAboutUnsavedChanges);
    return () =>
      window.removeEventListener("beforeunload", warnAboutUnsavedChanges);
  }, [isDirty, isSaving]);

  const updateSection = (
    sectionId: string,
    updates: Partial<MobileSongFormSection>,
  ) => {
    setForm((current) => ({
      ...current,
      sections: current.sections.map((section) =>
        section.id === sectionId ? { ...section, ...updates } : section,
      ),
    }));
  };

  const moveSection = (index: number, direction: -1 | 1) => {
    setForm((current) => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= current.sections.length) {
        return current;
      }

      const sections = [...current.sections];
      [sections[index], sections[targetIndex]] = [
        sections[targetIndex],
        sections[index],
      ];
      return { ...current, sections };
    });
  };

  const requestCancel = () => {
    if (isDirty && !window.confirm("Discard your unsaved song changes?")) {
      return;
    }
    onCancel();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      const input = serializeMobileSongForm(form, song);
      setIsSaving(true);
      await onSave(input);
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Could not save song",
      );
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-xl items-center gap-3 px-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-11 w-11 shrink-0"
            onClick={requestCancel}
            aria-label="Cancel and return to songs"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {song ? "Edit song" : "New song"}
            </p>
            <h1 className="truncate text-lg font-semibold">
              {song?.title || "Add to library"}
            </h1>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="mx-auto max-w-xl pb-28">
        <div className="space-y-6 px-4 py-5">
          <section className="space-y-4" aria-labelledby="song-details-heading">
            <div>
              <h2 id="song-details-heading" className="font-semibold">
                Song details
              </h2>
              <p className="text-sm text-muted-foreground">
                Background media stays unchanged and can be managed on desktop.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile-song-title">Song title</Label>
              <Input
                id="mobile-song-title"
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                autoFocus
                required
                className="h-12 text-base"
                placeholder="Amazing Grace"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile-song-artist">Artist</Label>
              <Input
                id="mobile-song-artist"
                value={form.artist}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    artist: event.target.value,
                  }))
                }
                className="h-12 text-base"
                placeholder="Artist or composer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile-song-tags">Tags</Label>
              <Input
                id="mobile-song-tags"
                value={form.tags}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    tags: event.target.value,
                  }))
                }
                className="h-12 text-base"
                placeholder="worship, hymn, upbeat"
              />
              <p className="text-xs text-muted-foreground">
                Separate tags with commas.
              </p>
            </div>
          </section>

          <section
            className="space-y-4"
            aria-labelledby="song-sections-heading"
          >
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 id="song-sections-heading" className="font-semibold">
                  Lyrics
                </h2>
                <p className="text-sm text-muted-foreground">
                  Add sections in the order they should appear.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="h-11 shrink-0"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    sections: [
                      ...current.sections,
                      createEmptyMobileSongSection(
                        `mobile-new-${nextSectionId.current++}`,
                        String(current.sections.length + 1),
                      ),
                    ],
                  }))
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Section
              </Button>
            </div>

            <div className="space-y-4">
              {form.sections.map((section, index) => (
                <div
                  key={section.id}
                  className="space-y-3 rounded-xl border bg-card p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">Section {index + 1}</p>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10"
                        disabled={index === 0}
                        onClick={() => moveSection(index, -1)}
                        aria-label={`Move section ${index + 1} up`}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10"
                        disabled={index === form.sections.length - 1}
                        onClick={() => moveSection(index, 1)}
                        aria-label={`Move section ${index + 1} down`}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-destructive hover:text-destructive"
                        disabled={form.sections.length === 1}
                        onClick={() =>
                          setForm((current) => ({
                            ...current,
                            sections: current.sections.filter(
                              (candidate) => candidate.id !== section.id,
                            ),
                          }))
                        }
                        aria-label={`Remove section ${index + 1}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-[minmax(0,1fr)_5rem] gap-3">
                    <div className="space-y-2">
                      <Label htmlFor={`mobile-section-type-${section.id}`}>
                        Type
                      </Label>
                      <Select
                        value={section.type}
                        onValueChange={(value) =>
                          updateSection(section.id, {
                            type: value as SongSectionType,
                          })
                        }
                      >
                        <SelectTrigger
                          id={`mobile-section-type-${section.id}`}
                          className="h-11 w-full"
                        >
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
                    <div className="space-y-2">
                      <Label htmlFor={`mobile-section-number-${section.id}`}>
                        No.
                      </Label>
                      <Input
                        id={`mobile-section-number-${section.id}`}
                        value={section.number}
                        onChange={(event) =>
                          updateSection(section.id, {
                            number: event.target.value,
                          })
                        }
                        inputMode="numeric"
                        className="h-11"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`mobile-section-lyrics-${section.id}`}>
                      Lyrics
                    </Label>
                    <Textarea
                      id={`mobile-section-lyrics-${section.id}`}
                      value={section.lyrics}
                      onChange={(event) =>
                        updateSection(section.id, {
                          lyrics: event.target.value,
                        })
                      }
                      rows={7}
                      className="min-h-36 resize-y font-mono text-base leading-relaxed"
                      placeholder="Enter lyrics for this section..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </p>
          )}
        </div>

        <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur">
          <div className="mx-auto grid max-w-xl grid-cols-[1fr_2fr] gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-12"
              disabled={isSaving}
              onClick={requestCancel}
            >
              Cancel
            </Button>
            <Button type="submit" className="h-12" disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving…" : song ? "Save changes" : "Add song"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
