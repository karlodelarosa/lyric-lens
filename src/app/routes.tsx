import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/layouts/RootLayout";
import { Dashboard } from "./components/pages/Dashboard";
import { SongLibrary } from "./components/pages/SongLibrary";
import { SetlistBuilder } from "./components/pages/SetlistBuilder";
import { Schedule } from "./components/pages/Schedule";
import { AnnouncementBank } from "./components/pages/AnnouncementBank";
import { ServiceFlowBuilder } from "./components/pages/ServiceFlowBuilder";
import { LiveMode } from "./components/pages/LiveMode";
import { Website } from "./components/pages/Website";
import { PresenterView } from "./components/pages/PresenterView";
import { RemoteControl } from "./components/pages/RemoteControl";
import { Profile } from "./components/pages/Profile";
import { HowToUse } from "./components/pages/HowToUse";
import { Trash } from "./components/pages/Trash";
import { NotFound } from "./components/pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "songs", Component: SongLibrary },
      { path: "setlists", Component: SetlistBuilder },
      { path: "announcements", Component: AnnouncementBank },
      { path: "service-flows", Component: ServiceFlowBuilder },
      { path: "schedule", Component: Schedule },
      { path: "live", Component: LiveMode },
      { path: "how-to-use", Component: HowToUse },
      { path: "website", Component: Website },
      { path: "profile", Component: Profile },
      { path: "trash", Component: Trash },
      { path: "*", Component: NotFound },
    ],
  },
  {
    path: "/presenter",
    Component: PresenterView,
  },
  {
    path: "/remote/:code?",
    Component: RemoteControl,
  },
]);
