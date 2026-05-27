import { cn } from "../../lib/utils";
import type {
  Announcement,
  ServiceFlow,
  ServiceFlowSegment,
} from "../../contexts/AppContext";

type ServiceFlowLivePanelProps = {
  serviceFlow: ServiceFlow;
  activeSegmentId: string | null;
  onSelectSegment: (segment: ServiceFlowSegment) => void;
  onSelectAnnouncement: (announcement: Announcement) => void;
  onSelectSong: (songId: string) => void;
  onSelectSection: (songId: string, sectionId: string) => void;
  currentSongId: string | null;
  currentSectionId: string | null;
  currentAnnouncementId: string | null;
  setlistSongs: {
    id: string;
    title: string;
    artist: string;
    sections: { id: string; type: string; number?: number; lyrics: string }[];
  }[];
};

export function ServiceFlowLivePanel({
  serviceFlow,
  activeSegmentId,
  onSelectSegment,
  onSelectAnnouncement,
  onSelectSong,
  onSelectSection,
  currentSongId,
  currentSectionId,
  currentAnnouncementId,
  setlistSongs,
}: ServiceFlowLivePanelProps) {
  const activeSegment =
    serviceFlow.segments.find((segment) => segment.id === activeSegmentId) ??
    serviceFlow.segments[0];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
          Service flow
        </h2>
        <p className="text-sm font-medium">{serviceFlow.title}</p>
      </div>

      <div className="space-y-1">
        {serviceFlow.segments.map((segment) => (
          <button
            key={segment.id}
            type="button"
            onClick={() => onSelectSegment(segment)}
            className={cn(
              "w-full text-left p-3 rounded-lg border text-sm transition-colors",
              activeSegment?.id === segment.id
                ? "bg-primary/20 border-primary"
                : "bg-card hover:bg-accent",
            )}
          >
            <div className="font-medium">{segment.label}</div>
            <div className="text-xs text-muted-foreground capitalize">
              {segment.kind}
            </div>
          </button>
        ))}
      </div>

      {activeSegment?.kind === "cue" && (
        <div className="rounded-lg border p-3 bg-card text-sm space-y-2">
          <p className="font-medium">{activeSegment.label}</p>
          {activeSegment.notes ? (
            <p className="text-muted-foreground whitespace-pre-wrap">
              {activeSegment.notes}
            </p>
          ) : (
            <p className="text-muted-foreground">No operator notes</p>
          )}
        </div>
      )}

      {activeSegment?.kind === "announcements" && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Announcements
          </p>
          {activeSegment.announcements.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No announcements attached to this segment.
            </p>
          ) : (
            activeSegment.announcements.map((announcement) => (
              <button
                key={announcement.id}
                type="button"
                onClick={() => onSelectAnnouncement(announcement)}
                className={cn(
                  "w-full text-left p-3 rounded-lg border text-sm",
                  currentAnnouncementId === announcement.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card hover:bg-accent",
                )}
              >
                <div className="font-medium">{announcement.title}</div>
                <div className="text-xs opacity-80 line-clamp-2 mt-1">
                  {announcement.body}
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {activeSegment?.kind === "music" && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            {activeSegment.setlistName
              ? `Setlist: ${activeSegment.setlistName}`
              : "No setlist linked"}
          </p>
          {setlistSongs.map((song) => (
            <div key={song.id} className="space-y-1">
              <button
                type="button"
                onClick={() => onSelectSong(song.id)}
                className={cn(
                  "w-full text-left p-3 rounded-lg border font-medium text-sm",
                  currentSongId === song.id
                    ? "bg-primary/20 border-primary"
                    : "bg-card hover:bg-accent",
                )}
              >
                {song.title}
              </button>
              <div className="ml-3 space-y-1">
                {song.sections.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => onSelectSection(song.id, section.id)}
                    className={cn(
                      "w-full text-left p-2 rounded text-xs",
                      currentSongId === song.id &&
                        currentSectionId === section.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent",
                    )}
                  >
                    {section.type}
                    {section.number ? ` ${section.number}` : ""}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
