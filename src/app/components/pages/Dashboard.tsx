import { useApp } from "../../contexts/AppContext";
import { Link } from "react-router";
import { Calendar, Music, List, ArrowRight, Plus } from "lucide-react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { format } from "date-fns";

export function Dashboard() {
  const { schedules, setlists, songs } = useApp();

  const upcomingSchedules = schedules
    .filter((s) => new Date(s.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const recentSongs = [...songs]
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 5);

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back to LiveLyrics
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/setlists">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Setlist
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

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Songs</CardTitle>
            <Music className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{songs.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              In your library
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Setlists</CardTitle>
            <List className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{setlists.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Ready to present
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Calendar className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{upcomingSchedules.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Scheduled events
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Upcoming Schedules */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Upcoming Services</CardTitle>
                <CardDescription>Your scheduled events</CardDescription>
              </div>
              <Link to="/schedule">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingSchedules.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No upcoming services scheduled
              </p>
            ) : (
              upcomingSchedules.map((schedule) => {
                const setlist = setlists.find(
                  (sl) => sl.id === schedule.setlistId,
                );
                return (
                  <div
                    key={schedule.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card/50 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex flex-col items-center justify-center">
                        <div className="text-xs font-medium text-muted-foreground">
                          {format(new Date(schedule.date), "MMM")}
                        </div>
                        <div className="text-lg font-bold">
                          {format(new Date(schedule.date), "d")}
                        </div>
                      </div>
                      <div>
                        <p className="font-medium">{schedule.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {setlist ? setlist.name : "No setlist assigned"}
                        </p>
                      </div>
                    </div>
                    <Link to="/live">
                      <Button size="sm" variant="outline">
                        Go Live
                      </Button>
                    </Link>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Recently Used Songs */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Popular Songs</CardTitle>
                <CardDescription>Most used in services</CardDescription>
              </div>
              <Link to="/songs">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentSongs.map((song, index) => (
              <div
                key={song.id}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card/50 hover:bg-accent/50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{song.title}</p>
                  <p className="text-sm text-muted-foreground">{song.artist}</p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {song.usageCount} uses
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-br from-violet-500/5 to-purple-500/5 border-violet-500/20">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Jump into your workflow</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          <Link to="/live" className="group">
            <div className="p-6 rounded-lg border bg-card hover:bg-accent transition-all duration-200 cursor-pointer">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-1">Go to Live Mode</h3>
              <p className="text-sm text-muted-foreground">
                Start presenting lyrics
              </p>
            </div>
          </Link>
          <Link to="/setlists" className="group">
            <div className="p-6 rounded-lg border bg-card hover:bg-accent transition-all duration-200 cursor-pointer">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <List className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-1">Build Setlist</h3>
              <p className="text-sm text-muted-foreground">
                Create song sequences
              </p>
            </div>
          </Link>
          <Link to="/songs" className="group">
            <div className="p-6 rounded-lg border bg-card hover:bg-accent transition-all duration-200 cursor-pointer">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Music className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-1">Manage Songs</h3>
              <p className="text-sm text-muted-foreground">
                Add or edit lyrics
              </p>
            </div>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
