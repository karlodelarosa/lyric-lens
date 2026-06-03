import { Link } from "react-router";
import {
  BookOpen,
  Music,
  List,
  GitBranch,
  Megaphone,
  Calendar,
  Radio,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Monitor,
  Maximize2,
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

type WorkflowCombo = {
  id: string;
  title: string;
  summary: string;
  bestFor: string;
  needs: string[];
  optional?: string[];
  liveHow: string;
  steps: string[];
};

const setupOrder = [
  {
    icon: Music,
    title: "Song Library",
    href: "/songs",
    description: "Add songs with sections (verse, chorus, bridge) and tags.",
  },
  {
    icon: List,
    title: "Setlists",
    href: "/setlists",
    description:
      "Pick songs, reorder, optional welcome slide, optional flow sections.",
  },
  {
    icon: Megaphone,
    title: "Announcements",
    href: "/announcements",
    description: "Text or slide decks for offering, events, volunteers, etc.",
  },
  {
    icon: GitBranch,
    title: "Service Flows",
    href: "/service-flows",
    description:
      "Ordered segments: music (setlist), announcements, cues, and notes.",
  },
  {
    icon: Calendar,
    title: "Schedule",
    href: "/schedule",
    description: "Plan services on the calendar and link a setlist per event.",
  },
  {
    icon: Radio,
    title: "Live Mode",
    href: "/live",
    description:
      "Control the projector output and drive the service in real time.",
  },
];

const workflows: WorkflowCombo[] = [
  {
    id: "setlist-only",
    title: "Setlist only (simplest)",
    summary:
      "One setlist drives the whole service. No service flow or schedule required.",
    bestFor: "Rehearsals, small groups, or when you only need worship lyrics.",
    needs: ["Songs", "Setlist"],
    steps: [
      "Build a setlist in Setlists — add songs and drag to order.",
      "Open Live Mode and choose that setlist from the dropdown.",
      "Click Go Live to open the output window, then Fill screen on your projector display.",
      "Click songs and sections in the left panel (or use arrow keys) to advance lyrics.",
    ],
    liveHow:
      "Live uses the setlist picker. Welcome slide works if you uploaded one on the setlist.",
  },
  {
    id: "setlist-welcome",
    title: "Setlist + welcome slide",
    summary:
      "Same as setlist-only, plus an opening image or video on the setlist.",
    bestFor: "Sunday opener branding or a motion welcome loop.",
    needs: ["Songs", "Setlist with welcome slide"],
    steps: [
      "In Setlists, upload a welcome image or video on the setlist you will use.",
      "Go to Live Mode, select the setlist, and press Welcome when ready.",
      "Advance through songs and sections as usual.",
    ],
    liveHow:
      "Welcome is triggered from Live controls; lyrics use the setlist navigator.",
  },
  {
    id: "setlist-flow-sections",
    title: "Setlist + flow sections (Opening / Worship / …)",
    summary:
      "Tag songs inside the setlist to Opening, Worship, Response, or Closing without building a full service flow.",
    bestFor:
      "Organizing a long setlist by service moment while staying in setlist mode.",
    needs: ["Songs", "Setlist with flow section checkboxes"],
    steps: [
      "In Setlists, after adding songs, assign them to flow section presets.",
      "Use Live Mode with that setlist — sections help you mentally group songs.",
      "You still click individual songs/sections to project; sections are organizational.",
    ],
    liveHow:
      "Setlist mode in Live. Flow sections are labels on the setlist, not auto-advance segments.",
  },
  {
    id: "schedule-setlist",
    title: "Schedule + setlist",
    summary:
      "Plan the date on the calendar and attach a setlist. Jump to Live with the setlist already linked.",
    bestFor: "Teams that plan ahead but run Live in simple setlist mode.",
    needs: ["Songs", "Setlist", "Scheduled event with setlist"],
    optional: ["Announcements"],
    steps: [
      "Create the setlist first, then Schedule → add event and pick that setlist.",
      "From Schedule, use Go Live on the event (opens Live with setlistId in the URL).",
      "Or open Live manually — the URL can include ?setlistId=… from the event.",
    ],
    liveHow:
      "Setlist mode. Schedule is for planning and quick launch, not required every week.",
  },
  {
    id: "announcements-manual",
    title: "Setlist + announcements (manual)",
    summary:
      "Worship from a setlist; show announcement copy or slide decks when you choose.",
    bestFor: "Flexible order — announcements anytime without a scripted flow.",
    needs: ["Songs", "Setlist", "Announcements in the bank"],
    steps: [
      "Create announcements (text or multi-slide decks) in Announcement Bank.",
      "In Live with a setlist selected, switch to announcement content from the controls when needed.",
      "Return to lyrics by selecting a song/section again.",
    ],
    liveHow:
      "Setlist mode + manual announcement/cue controls on the Live page.",
  },
  {
    id: "service-flow-music",
    title: "Service flow (music segments only)",
    summary:
      "A flow with only Praise & Worship–style segments, each tied to a setlist.",
    bestFor: "Multiple worship blocks in one service (e.g. opener + response).",
    needs: [
      "Songs",
      "One or more setlists",
      "Service flow with music segments",
    ],
    steps: [
      "Create setlists for each worship block (or one combined setlist).",
      "In Service Flows, add music segments and link each to a setlist.",
      "Open Live with ?serviceFlowId=… or pick the flow from the builder’s Go Live link.",
      "Use Prev/Next segment to move between blocks; lyrics follow the linked setlist.",
    ],
    liveHow:
      "Service flow mode — segment buttons, setlist songs in the left panel per segment.",
  },
  {
    id: "service-flow-full",
    title: "Service flow (full service)",
    summary: "Script the whole service: cues, music, announcements in order.",
    bestFor:
      "Sunday morning with prayer, worship, offering, sermon cues, benediction.",
    needs: [
      "Songs",
      "Setlists",
      "Announcements",
      "Service flow (mixed segment kinds)",
    ],
    steps: [
      "Prepare setlists and announcements first.",
      "Build the flow: cue segments (labels/notes), music segments (setlist), announcement segments (bank items).",
      "Drag segments to order; duplicate flows for recurring templates.",
      "Launch Live from the flow (Go Live link) and step segments with Prev/Next segment.",
      "Within a music segment, pick songs/sections; within announcements, advance slides if needed.",
    ],
    liveHow:
      "Service flow mode. Left panel follows active segment type (songs vs announcements vs cue card).",
  },
  {
    id: "schedule-flow",
    title: "Schedule + service flow",
    summary:
      "Calendar event for planning; run Live via service flow (setlist on event is optional).",
    bestFor: "Planned dates with a fixed run-of-show in Service Flows.",
    needs: ["Service flow", "Scheduled event"],
    optional: ["Setlist on event for reference or setlist-only backup"],
    steps: [
      "Create and save the service flow template.",
      "Add schedule events for each service date (setlist optional).",
      "Open Live with the flow ID — from Service Flows or bookmark /live?serviceFlowId=…",
    ],
    liveHow:
      "Service flow mode. Schedule reminds the team when to serve; the flow drives Live.",
  },
  {
    id: "schedule-setlist-flow",
    title: "Schedule + setlist + service flow (everything)",
    summary:
      "Maximum structure: calendar event, default setlist on the event, and a full service flow for Live.",
    bestFor:
      "Large teams — planners use Schedule, operators use Service Flow in Live.",
    needs: [
      "Songs",
      "Setlists",
      "Announcements",
      "Service flow",
      "Scheduled event",
    ],
    steps: [
      "Song library → setlists → announcement bank → service flow → schedule event.",
      "Link a setlist to the event for quick setlist-only Live if needed.",
      "Primary path: Go Live from the service flow with serviceFlowId.",
      "Backup path: Go Live from Schedule with setlistId only (simpler, no segments).",
    ],
    liveHow:
      "Prefer service flow for Sunday; setlist-only link from Schedule is a fallback.",
  },
  {
    id: "manual-lyrics",
    title: "Manual / impromptu lyrics",
    summary:
      "No setlist required — type or paste lyrics in Live for one-off moments.",
    bestFor: "Spontaneous songs, readings, or guest items not in the library.",
    needs: ["Live Mode only"],
    optional: ["Songs", "Setlist"],
    steps: [
      "Open Live Mode without selecting a setlist (or alongside one).",
      "Use the manual lyrics tab in the center panel to enter text.",
      "Style with typography and background controls; output updates on the presenter window.",
    ],
    liveHow:
      "Works in setlist or flow mode. Manual text overrides until you select a library section again.",
  },
  {
    id: "blank-welcome-cue",
    title: "Blank screen, welcome, and cues",
    summary:
      "Control non-lyric moments: clear screen, welcome media, segment cue cards.",
    bestFor: "Transitions, prayer, offering, sermon title slides.",
    needs: ["Live Mode"],
    optional: ["Setlist welcome slide", "Service flow cue segments"],
    steps: [
      "Clear screen hides all content on the output.",
      "Welcome uses the welcome slide on the active setlist (setlist mode).",
      "Cue segments in a service flow show label + notes on the output.",
    ],
    liveHow:
      "Buttons on Live; cues auto-show when you enter a cue segment in flow mode.",
  },
];

export function HowToUse() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10 pb-16">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-primary" />
            How to use Lyric Lens
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Lyric Lens is built around <strong>Live Mode</strong> — everything
            else prepares content you project. Mix and match the workflows
            below; only some pieces are required for each way you run a service.
          </p>
        </div>
        <Link to="/live">
          <Button
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg text-white"
          >
            <Radio className="w-5 h-5 mr-2" />
            Open Live Mode
          </Button>
        </Link>
      </div>

      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Recommended setup order
          </CardTitle>
          <CardDescription>
            First-time setup — you can skip steps you do not need for your
            workflow.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4">
            {setupOrder.map((step, index) => {
              const Icon = step.icon;
              const isLive = step.href === "/live";
              return (
                <li key={step.href} className="flex gap-4">
                  <span className={cnStepNumber(isLive)} aria-hidden>
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={step.href}
                      className="font-semibold hover:text-primary inline-flex items-center gap-2"
                    >
                      <Icon className="w-4 h-4" />
                      {step.title}
                      <ArrowRight className="w-3 h-3 opacity-50" />
                    </Link>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {step.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Ways to run Live</h2>
        <p className="text-muted-foreground">
          Each card is a valid combination. Pick the lightest path that fits
          your Sunday (or event).
        </p>
        <div className="grid gap-4">
          {workflows.map((flow) => (
            <Card key={flow.id} id={flow.id}>
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <CardTitle className="text-lg">{flow.title}</CardTitle>
                  <Badge variant="secondary">{flow.bestFor}</Badge>
                </div>
                <CardDescription>{flow.summary}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs font-medium text-muted-foreground w-full">
                    Requires
                  </span>
                  {flow.needs.map((item) => (
                    <Badge key={item} variant="outline">
                      {item}
                    </Badge>
                  ))}
                  {flow.optional?.map((item) => (
                    <Badge key={item} variant="outline" className="opacity-70">
                      Optional: {item}
                    </Badge>
                  ))}
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-sm">
                  {flow.steps.map((step) => (
                    <li key={step} className="text-muted-foreground">
                      <span className="text-foreground">{step}</span>
                    </li>
                  ))}
                </ol>
                <p className="text-sm rounded-md bg-muted/50 px-3 py-2 border">
                  <span className="font-medium text-foreground">In Live: </span>
                  {flow.liveHow}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            Output window & fullscreen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p className="flex gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span>
              <strong className="text-foreground">Go Live</strong> opens the
              presenter output in a separate window. Drag it to your projector
              or second display.
            </span>
          </p>
          <p className="flex gap-2">
            <Maximize2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span>
              Use <strong className="text-foreground">Fill screen</strong> on
              the Live page (or the button inside the output window) to
              fullscreen on that display.
            </span>
          </p>
          <p className="flex gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span>
              Live and the output window stay in sync — song changes, styles,
              announcements, and blank screen update instantly.
            </span>
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Link to="/live">
          <Button
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-indigo-600"
          >
            <Radio className="w-5 h-5 mr-2" />
            Start in Live Mode
          </Button>
        </Link>
        <Link to="/songs">
          <Button variant="outline">Song Library</Button>
        </Link>
        <Link to="/setlists">
          <Button variant="outline">Setlists</Button>
        </Link>
      </div>
    </div>
  );
}

function cnStepNumber(isLive: boolean) {
  return [
    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
    isLive
      ? "bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-md"
      : "bg-muted text-muted-foreground",
  ].join(" ");
}
