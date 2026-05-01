import { useState } from "react";
import { useApp } from "../../contexts/AppContext";
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths } from "date-fns";

export function Schedule() {
  const { songs, schedules, setlists, addSchedule, updateSchedule } = useApp();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isAddingSchedule, setIsAddingSchedule] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
  const [newSchedule, setNewSchedule] = useState({
    title: "",
    date: "",
    setlistId: "",
  });
  const [editingSchedule, setEditingSchedule] = useState({
    title: "",
    date: "",
    setlistId: "",
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getSchedulesForDay = (day: Date) => {
    return schedules.filter(schedule =>
      isSameDay(new Date(schedule.date), day)
    );
  };

  const handleAddSchedule = () => {
    if (!newSchedule.title || !newSchedule.date) return;

    addSchedule({
      title: newSchedule.title,
      date: newSchedule.date,
      setlistId: newSchedule.setlistId || undefined,
    });

    setNewSchedule({ title: "", date: "", setlistId: "" });
    setIsAddingSchedule(false);
  };

  const openScheduleEditor = (scheduleId: string) => {
    const schedule = schedules.find((s) => s.id === scheduleId);
    if (!schedule) return;

    setSelectedScheduleId(scheduleId);
    setEditingSchedule({
      title: schedule.title,
      date: schedule.date,
      setlistId: schedule.setlistId ?? "",
    });
  };

  const selectedSchedule = schedules.find((s) => s.id === selectedScheduleId);
  const selectedScheduleSetlist = setlists.find(
    (setlist) => setlist.id === (selectedSchedule?.setlistId || editingSchedule.setlistId),
  );

  const handleUpdateSchedule = () => {
    if (!selectedScheduleId || !editingSchedule.title || !editingSchedule.date) return;
    updateSchedule(selectedScheduleId, {
      title: editingSchedule.title,
      date: editingSchedule.date,
      setlistId: editingSchedule.setlistId || undefined,
    });
    setSelectedScheduleId(null);
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Schedule</h1>
          <p className="text-muted-foreground mt-1">Plan your services and events</p>
        </div>
        <Dialog open={isAddingSchedule} onOpenChange={setIsAddingSchedule}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule New Event</DialogTitle>
              <DialogDescription>Create a service or event schedule</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="eventTitle">Event Title</Label>
                <Input
                  id="eventTitle"
                  value={newSchedule.title}
                  onChange={(e) => setNewSchedule({ ...newSchedule, title: e.target.value })}
                  placeholder="Sunday Service"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventDate">Date</Label>
                <Input
                  id="eventDate"
                  type="date"
                  value={newSchedule.date}
                  onChange={(e) => setNewSchedule({ ...newSchedule, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="setlist">Setlist (Optional)</Label>
                <Select
                  value={newSchedule.setlistId}
                  onValueChange={(value) => setNewSchedule({ ...newSchedule, setlistId: value })}
                >
                  <SelectTrigger id="setlist">
                    <SelectValue placeholder="Select a setlist" />
                  </SelectTrigger>
                  <SelectContent>
                    {setlists.map((setlist) => (
                      <SelectItem key={setlist.id} value={setlist.id}>
                        {setlist.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddSchedule} className="w-full">
                Create Event
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Calendar Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{format(currentMonth, 'MMMM yyyy')}</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(new Date())}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                {day}
              </div>
            ))}

            {/* Empty cells for days before month starts */}
            {Array.from({ length: monthStart.getDay() }).map((_, i) => (
              <div key={`empty-${i}`} className="p-2" />
            ))}

            {/* Calendar days */}
            {days.map((day) => {
              const daySchedules = getSchedulesForDay(day);
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-24 p-2 rounded-lg border ${
                    isToday ? 'border-primary bg-primary/5' : 'border-border'
                  } ${isSameMonth(day, currentMonth) ? '' : 'opacity-40'}`}
                >
                  <div className={`text-sm font-medium mb-1 ${isToday ? 'text-primary' : ''}`}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {daySchedules.map((schedule) => {
                      const setlist = setlists.find(sl => sl.id === schedule.setlistId);
                      return (
                        <div
                          key={schedule.id}
                          className="text-xs p-1.5 rounded bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/30 cursor-pointer hover:shadow-sm"
                          onClick={() => openScheduleEditor(schedule.id)}
                        >
                          <p className="font-medium truncate">{schedule.title}</p>
                          {setlist && (
                            <p className="text-muted-foreground truncate">{setlist.name}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events List */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {schedules
            .filter(s => new Date(s.date) >= new Date())
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map((schedule) => {
              const setlist = setlists.find(sl => sl.id === schedule.setlistId);
              return (
                <div
                  key={schedule.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex flex-col items-center justify-center text-white">
                      <div className="text-xs font-medium">{format(new Date(schedule.date), 'MMM')}</div>
                      <div className="text-xl font-bold">{format(new Date(schedule.date), 'd')}</div>
                    </div>
                    <div>
                      <p className="font-semibold">{schedule.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(schedule.date), 'EEEE, MMMM d, yyyy')}
                      </p>
                      {setlist && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Setlist: {setlist.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => openScheduleEditor(schedule.id)}>
                    Edit
                  </Button>
                </div>
              );
            })}
        </CardContent>
      </Card>

      <Dialog open={selectedScheduleId !== null} onOpenChange={() => setSelectedScheduleId(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Scheduled Event</DialogTitle>
            <DialogDescription>
              Update event details and inspect the linked setlist songs.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-event-title">Event Title</Label>
              <Input
                id="edit-event-title"
                value={editingSchedule.title}
                onChange={(e) =>
                  setEditingSchedule((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-event-date">Date</Label>
              <Input
                id="edit-event-date"
                type="date"
                value={editingSchedule.date}
                onChange={(e) =>
                  setEditingSchedule((prev) => ({ ...prev, date: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Setlist</Label>
              <Select
                value={editingSchedule.setlistId}
                onValueChange={(value) =>
                  setEditingSchedule((prev) => ({ ...prev, setlistId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a setlist" />
                </SelectTrigger>
                <SelectContent>
                  {setlists.map((setlist) => (
                    <SelectItem key={setlist.id} value={setlist.id}>
                      {setlist.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Setlist Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {!selectedScheduleSetlist ? (
                  <p className="text-sm text-muted-foreground">No setlist linked yet.</p>
                ) : (
                  <>
                    <p className="font-medium">{selectedScheduleSetlist.name}</p>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {selectedScheduleSetlist.songs.map((songId, index) => {
                        const song = songs.find((s) => s.id === songId);
                        if (!song) return null;
                        return (
                          <div
                            key={`${songId}-${index}`}
                            className="text-sm rounded border px-2 py-1 bg-card"
                          >
                            {index + 1}. {song.title} - {song.artist}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedScheduleId(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateSchedule}>Save changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
