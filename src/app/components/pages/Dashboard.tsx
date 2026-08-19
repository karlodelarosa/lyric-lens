import { useApp } from "../../contexts/AppContext";
import { buildLiveUrl } from "../../lib/liveStateSync";
import { Link } from "react-router";
import {
  Calendar,
  Music,
  List,
  ArrowRight,
  Plus,
  GitBranch,
  Play,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { format, formatDistanceToNow } from "date-fns";

export function Dashboard() {
  const { schedules, setlists, songs, serviceFlowList } = useApp();

  const upcomingSchedules = schedules
    .filter((s) => new Date(s.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const nextSchedule = upcomingSchedules[0];
  const nextSetlist = nextSchedule
    ? setlists.find((sl) => sl.id === nextSchedule.setlistId)
    : undefined;
  const nextIsReady = Boolean(nextSetlist && nextSetlist.songs.length > 0);

  // Schedule is optional in practice — most services never get a schedule
  // entry, they just go straight from setlist to live. When there's no
  // upcoming schedule, fall back to the most recently touched ready setlist
  // instead of a dead "nothing scheduled" prompt.
  const latestReadySetlist = !nextSchedule
    ? [...setlists]
        .filter((sl) => sl.songs.length > 0)
        .sort((a, b) => {
          const aTime = a.updatedAt ? Date.parse(a.updatedAt) : 0;
          const bTime = b.updatedAt ? Date.parse(b.updatedAt) : 0;
          return bTime - aTime;
        })[0]
    : undefined;

  const isScheduleReady = (schedule: (typeof upcomingSchedules)[number]) => {
    const setlist = setlists.find((sl) => sl.id === schedule.setlistId);
    return Boolean(setlist && setlist.songs.length > 0);
  };

  const songsNeedingLyrics = songs.filter(
    (song) =>
      song.sections.length === 0 ||
      song.sections.every((section) => !section.lyrics.trim()),
  );

  const attentionItems = [
    ...upcomingSchedules
      .filter((s) => !isScheduleReady(s))
      .slice(0, 3)
      .map((s) => ({
        key: `schedule-${s.id}`,
        title: s.title,
        description: `${format(new Date(s.date), "MMM d")} — needs a setlist`,
        href: "/setlists",
      })),
    ...songsNeedingLyrics.slice(0, 3).map((song) => ({
      key: `song-${song.id}`,
      title: song.title,
      description: `${song.artist || "Unknown artist"} — no lyrics yet`,
      href: "/songs",
    })),
  ].slice(0, 5);

  const recentWork = [
    ...setlists.map((sl) => ({
      key: `setlist-${sl.id}`,
      title: sl.name,
      kind: "Setlist",
      updatedAt: sl.updatedAt,
      href: "/setlists",
    })),
    ...serviceFlowList.map((flow) => ({
      key: `flow-${flow.id}`,
      title: flow.title,
      kind: "Service Flow",
      updatedAt: flow.updatedAt,
      href: "/service-flows",
    })),
  ]
    .filter(
      (item): item is typeof item & { updatedAt: string } => !!item.updatedAt,
    )
    .sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    .slice(0, 5);

  return (
    <div className="px-10 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
            {format(new Date(), "EEEE, MMMM d")}
          </p>
          <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1.5">
            Welcome back to Lyric Lens
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/setlists">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Setlist
            </Button>
          </Link>
          <Link to="/service-flows">
            <Button variant="outline">
              <GitBranch className="w-4 h-4 mr-2" />
              Service Flows
            </Button>
          </Link>
          <Link to="/songs">
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Song
            </Button>
          </Link>
        </div>
      </div>

      {/* Hero: Next Service (or the last thing you were working on, if you don't use scheduling) */}
      <div className="rounded-xl border bg-card shadow-[var(--shadow-hero)] p-8 flex items-center justify-between gap-6 flex-wrap">
        {nextSchedule ? (
          <>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                Next service · {format(new Date(nextSchedule.date), "EEEE, MMMM d")}
              </p>
              <h2 className="text-2xl font-bold tracking-tight mb-3">
                {nextSchedule.title}
              </h2>
              {nextIsReady ? (
                <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/15">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                  Ready — {nextSetlist?.songs.length} songs
                </Badge>
              ) : (
                <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 hover:bg-amber-500/15">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
                  Needs a setlist
                </Badge>
              )}
            </div>
            <div className="flex gap-3">
              {nextIsReady ? (
                <Link
                  to={buildLiveUrl(nextSchedule.setlistId)}
                  state={{ eventTitle: nextSchedule.title }}
                >
                  <Button size="lg" className="shadow-[var(--shadow-glow)]">
                    <Play className="w-4 h-4 mr-2 fill-current" />
                    Go Live
                  </Button>
                </Link>
              ) : (
                <Link to="/setlists">
                  <Button size="lg">Build setlist</Button>
                </Link>
              )}
              <Link to="/schedule">
                <Button variant="outline" size="lg">
                  View schedule
                </Button>
              </Link>
            </div>
          </>
        ) : latestReadySetlist ? (
          <>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                Your latest setlist
              </p>
              <h2 className="text-2xl font-bold tracking-tight mb-3">
                {latestReadySetlist.name}
              </h2>
              <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/15">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                Ready — {latestReadySetlist.songs.length} songs
              </Badge>
            </div>
            <div className="flex gap-3">
              <Link
                to={buildLiveUrl(latestReadySetlist.id)}
                state={{ eventTitle: latestReadySetlist.name }}
              >
                <Button size="lg" className="shadow-[var(--shadow-glow)]">
                  <Play className="w-4 h-4 mr-2 fill-current" />
                  Go Live
                </Button>
              </Link>
              <Link to="/setlists">
                <Button variant="outline" size="lg">
                  View all setlists
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                Get started
              </p>
              <h2 className="text-2xl font-bold tracking-tight mb-1">
                Nothing to present yet
              </h2>
              <p className="text-sm text-muted-foreground">
                Build a setlist to see it here.
              </p>
            </div>
            <Link to="/setlists">
              <Button size="lg">
                <Plus className="w-4 h-4 mr-2" />
                Create a setlist
              </Button>
            </Link>
          </>
        )}
      </div>

      {/* Library snapshot */}
      <div className="flex items-center gap-6 text-sm text-muted-foreground border-y py-3 flex-wrap">
        <span className="flex items-center gap-1.5">
          <Music className="w-3.5 h-3.5" />
          {songs.length} songs in your library
        </span>
        <span className="flex items-center gap-1.5">
          <List className="w-3.5 h-3.5" />
          {setlists.length} setlists
        </span>
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          {upcomingSchedules.length} upcoming services
        </span>
      </div>

      {/* Needs Attention + Continue Where You Left Off */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Needs Attention
            </CardTitle>
            <CardDescription>
              Gaps worth clearing before service
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {attentionItems.length === 0 ? (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-8">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                You&apos;re all caught up
              </div>
            ) : (
              attentionItems.map((item) => (
                <Link
                  key={item.key}
                  to={item.href}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg border bg-card/50 hover:bg-accent/50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">{item.title}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {item.description}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              Continue Where You Left Off
            </CardTitle>
            <CardDescription>Your most recently edited work</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentWork.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nothing edited yet
              </p>
            ) : (
              recentWork.map((item) => (
                <Link
                  key={item.key}
                  to={item.href}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg border bg-card/50 hover:bg-accent/50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">{item.title}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {item.kind} · edited{" "}
                      {formatDistanceToNow(new Date(item.updatedAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
