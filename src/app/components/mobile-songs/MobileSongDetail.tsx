import { ArrowLeft, Edit3, Music2, Trash2, Video } from "lucide-react";
import type { Song } from "../../contexts/AppContext";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

type MobileSongDetailProps = {
  song: Song;
  isDeleting: boolean;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function MobileSongDetail({
  song,
  isDeleting,
  onBack,
  onEdit,
  onDelete,
}: MobileSongDetailProps) {
  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-xl items-center gap-3 px-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 shrink-0"
            onClick={onBack}
            aria-label="Return to song list"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Song details
            </p>
            <h1 className="truncate text-lg font-semibold">{song.title}</h1>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-11 w-11"
            onClick={onEdit}
            aria-label={`Edit ${song.title}`}
          >
            <Edit3 className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-xl space-y-6 px-4 py-5 pb-28">
        <section className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Music2 className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h2 className="break-words text-2xl font-bold leading-tight">
                {song.title}
              </h2>
              <p className="mt-1 break-words text-muted-foreground">
                {song.artist || "No artist listed"}
              </p>
            </div>
          </div>
          {song.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {song.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          {song.backgroundVideoUrl && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Video className="h-4 w-4" />
              Background media configured
            </p>
          )}
        </section>

        <section className="space-y-4" aria-labelledby="mobile-lyrics-heading">
          <div className="flex items-center justify-between gap-3">
            <h2 id="mobile-lyrics-heading" className="font-semibold">
              Lyrics
            </h2>
            <span className="text-sm text-muted-foreground">
              {song.sections.length} section
              {song.sections.length === 1 ? "" : "s"}
            </span>
          </div>
          {song.sections.map((section) => (
            <Card key={section.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">
                  {section.type.replace("_", " ")} {section.number || ""}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap break-words font-mono text-sm leading-relaxed">
                  {section.lyrics}
                </p>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur">
        <div className="mx-auto grid max-w-xl grid-cols-2 gap-3">
          <Button variant="outline" className="h-12" onClick={onEdit}>
            <Edit3 className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            className="h-12 text-destructive hover:text-destructive"
            disabled={isDeleting}
            onClick={onDelete}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {isDeleting ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}
