import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/layouts/RootLayout";
import { Dashboard } from "./components/pages/Dashboard";
import { SongLibrary } from "./components/pages/SongLibrary";
import { SetlistBuilder } from "./components/pages/SetlistBuilder";
import { Schedule } from "./components/pages/Schedule";
import { LiveMode } from "./components/pages/LiveMode";
import { Website } from "./components/pages/Website";
import { PresenterView } from "./components/pages/PresenterView";
import { Profile } from "./components/pages/Profile";
import { NotFound } from "./components/pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "songs", Component: SongLibrary },
      { path: "setlists", Component: SetlistBuilder },
      { path: "schedule", Component: Schedule },
      { path: "live", Component: LiveMode },
      { path: "website", Component: Website },
      { path: "profile", Component: Profile },
      { path: "*", Component: NotFound },
    ],
  },
  {
    path: "/presenter",
    Component: PresenterView,
  },
]);
