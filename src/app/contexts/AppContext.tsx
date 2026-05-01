import React, { createContext, useContext, useState, ReactNode } from "react";

interface Song {
  id: string;
  title: string;
  artist: string;
  sections: {
    id: string;
    type: "verse" | "chorus" | "bridge" | "intro" | "outro";
    number?: number;
    lyrics: string;
  }[];
  tags: string[];
  usageCount: number;
}

interface Setlist {
  id: string;
  name: string;
  songs: string[];
  flowSections: {
    name: string;
    songIds: string[];
  }[];
  scheduleId?: string;
}

interface Schedule {
  id: string;
  title: string;
  date: string;
  setlistId?: string;
}

interface LiveState {
  isLive: boolean;
  currentSetlistId: string | null;
  currentSongId: string | null;
  currentSectionId: string | null;
  fontSize: number;
  fontFamily: string;
  textTransform: "none" | "uppercase" | "lowercase" | "capitalize";
  background: {
    type: "color" | "gradient" | "image";
    value: string;
  };
  backgroundVideoUrl: string | null;
  alignment: "left" | "center" | "right";
  verticalPosition: "top" | "center" | "bottom";
  topPadding: number;
  lineHeight: number;
  fontWeight: 400 | 500 | 600 | 700 | 800 | 900;
  manualLyrics: string | null;
  useLineChunks: boolean;
  linesPerSlide: number;
  currentChunkIndex: number;
}

interface AppContextType {
  songs: Song[];
  setlists: Setlist[];
  schedules: Schedule[];
  liveState: LiveState;
  addSong: (song: Omit<Song, "id" | "usageCount">) => void;
  updateSong: (id: string, song: Partial<Song>) => void;
  deleteSong: (id: string) => void;
  addSetlist: (setlist: Omit<Setlist, "id">) => void;
  updateSetlist: (id: string, setlist: Partial<Setlist>) => void;
  deleteSetlist: (id: string) => void;
  addSchedule: (schedule: Omit<Schedule, "id">) => void;
  updateSchedule: (id: string, schedule: Partial<Schedule>) => void;
  deleteSchedule: (id: string) => void;
  updateLiveState: (state: Partial<LiveState>) => void;
  setCurrentSlide: (songId: string, sectionId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);
const LIVE_STATE_STORAGE_KEY = "lyric-lens-live-state";

const mockSongs: Song[] = [
  {
    id: "1",
    title: "Amazing Grace",
    artist: "John Newton",
    tags: ["classic", "slow", "worship"],
    usageCount: 45,
    sections: [
      {
        id: "s1",
        type: "verse",
        number: 1,
        lyrics:
          "Amazing grace how sweet the sound\nThat saved a wretch like me\nI once was lost, but now I'm found\nWas blind, but now I see",
      },
      {
        id: "s2",
        type: "verse",
        number: 2,
        lyrics:
          "Twas grace that taught my heart to fear\nAnd grace my fears relieved\nHow precious did that grace appear\nThe hour I first believed",
      },
      {
        id: "s3",
        type: "chorus",
        lyrics:
          "My chains are gone, I've been set free\nMy God, my Savior has ransomed me\nAnd like a flood His mercy reigns\nUnending love, amazing grace",
      },
    ],
  },
  {
    id: "2",
    title: "How Great Is Our God",
    artist: "Chris Tomlin",
    tags: ["modern", "worship", "upbeat"],
    usageCount: 32,
    sections: [
      {
        id: "s1",
        type: "verse",
        number: 1,
        lyrics:
          "The splendor of the King\nClothed in majesty\nLet all the earth rejoice\nAll the earth rejoice",
      },
      {
        id: "s2",
        type: "chorus",
        lyrics:
          "How great is our God\nSing with me\nHow great is our God\nAnd all will see how great\nHow great is our God",
      },
      {
        id: "s3",
        type: "verse",
        number: 2,
        lyrics:
          "Age to age He stands\nAnd time is in His hands\nBeginning and the End\nBeginning and the End",
      },
      {
        id: "s4",
        type: "bridge",
        lyrics:
          "Name above all names\nWorthy of all praise\nMy heart will sing\nHow great is our God",
      },
    ],
  },
  {
    id: "3",
    title: "10,000 Reasons",
    artist: "Matt Redman",
    tags: ["worship", "slow", "reflective"],
    usageCount: 28,
    sections: [
      {
        id: "s1",
        type: "chorus",
        lyrics:
          "Bless the Lord, O my soul\nO my soul\nWorship His holy name\nSing like never before\nO my soul\nI'll worship Your holy name",
      },
      {
        id: "s2",
        type: "verse",
        number: 1,
        lyrics:
          "The sun comes up, it's a new day dawning\nIt's time to sing Your song again\nWhatever may pass and whatever lies before me\nLet me be singing when the evening comes",
      },
      {
        id: "s3",
        type: "verse",
        number: 2,
        lyrics:
          "You're rich in love and You're slow to anger\nYour name is great and Your heart is kind\nFor all Your goodness, I will keep on singing\nTen thousand reasons for my heart to find",
      },
    ],
  },
];

const mockSetlists: Setlist[] = [
  {
    id: "sl1",
    name: "Sunday Morning Worship - May 3",
    songs: ["1", "2", "3"],
    flowSections: [
      { name: "Opening", songIds: ["2"] },
      { name: "Worship", songIds: ["1", "3"] },
    ],
    scheduleId: "sch1",
  },
];

const mockSchedules: Schedule[] = [
  {
    id: "sch1",
    title: "Sunday Service",
    date: "2026-05-03",
    setlistId: "sl1",
  },
  {
    id: "sch2",
    title: "Wednesday Night Worship",
    date: "2026-04-29",
  },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [songs, setSongs] = useState<Song[]>(mockSongs);
  const [setlists, setSetlists] = useState<Setlist[]>(mockSetlists);
  const [schedules, setSchedules] = useState<Schedule[]>(mockSchedules);
  const [liveState, setLiveState] = useState<LiveState>(() => {
    const defaultLiveState: LiveState = {
      isLive: false,
      currentSetlistId: null,
      currentSongId: null,
      currentSectionId: null,
      fontSize: 48,
      fontFamily: "Inter",
      textTransform: "none",
      background: {
        type: "gradient",
        value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      },
      backgroundVideoUrl: null,
      alignment: "center",
      verticalPosition: "center",
      topPadding: 24,
      lineHeight: 1.5,
      fontWeight: 600,
      manualLyrics: null,
      useLineChunks: true,
      linesPerSlide: 2,
      currentChunkIndex: 0,
    };

    if (typeof window === "undefined") return defaultLiveState;

    const saved = window.localStorage.getItem(LIVE_STATE_STORAGE_KEY);
    if (!saved) return defaultLiveState;

    try {
      return { ...defaultLiveState, ...JSON.parse(saved) };
    } catch {
      return defaultLiveState;
    }
  });

  React.useEffect(() => {
    window.localStorage.setItem(
      LIVE_STATE_STORAGE_KEY,
      JSON.stringify(liveState),
    );
  }, [liveState]);

  React.useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== LIVE_STATE_STORAGE_KEY || !event.newValue) return;

      try {
        setLiveState((prev) => ({
          ...prev,
          ...JSON.parse(event.newValue || "{}"),
        }));
      } catch {
        // Ignore malformed storage payloads.
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const addSong = (song: Omit<Song, "id" | "usageCount">) => {
    const newSong: Song = {
      ...song,
      id: Date.now().toString(),
      usageCount: 0,
    };
    setSongs([...songs, newSong]);
  };

  const updateSong = (id: string, updates: Partial<Song>) => {
    setSongs(songs.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const deleteSong = (id: string) => {
    setSongs(songs.filter((s) => s.id !== id));
  };

  const addSetlist = (setlist: Omit<Setlist, "id">) => {
    const newSetlist: Setlist = {
      ...setlist,
      id: Date.now().toString(),
    };
    setSetlists([...setlists, newSetlist]);
  };

  const updateSetlist = (id: string, updates: Partial<Setlist>) => {
    setSetlists(
      setlists.map((sl) => (sl.id === id ? { ...sl, ...updates } : sl)),
    );
  };

  const deleteSetlist = (id: string) => {
    setSetlists(setlists.filter((sl) => sl.id !== id));
  };

  const addSchedule = (schedule: Omit<Schedule, "id">) => {
    const newSchedule: Schedule = {
      ...schedule,
      id: Date.now().toString(),
    };
    setSchedules([...schedules, newSchedule]);
  };

  const updateSchedule = (id: string, updates: Partial<Schedule>) => {
    setSchedules(
      schedules.map((sch) => (sch.id === id ? { ...sch, ...updates } : sch)),
    );
  };

  const deleteSchedule = (id: string) => {
    setSchedules(schedules.filter((sch) => sch.id !== id));
  };

  const updateLiveState = (state: Partial<LiveState>) => {
    setLiveState((prev) => ({ ...prev, ...state }));
  };

  const setCurrentSlide = (songId: string, sectionId: string) => {
    setLiveState((prev) => ({
      ...prev,
      currentSongId: songId,
      currentSectionId: sectionId,
      manualLyrics: null,
      currentChunkIndex: 0,
    }));
  };

  return (
    <AppContext.Provider
      value={{
        songs,
        setlists,
        schedules,
        liveState,
        addSong,
        updateSong,
        deleteSong,
        addSetlist,
        updateSetlist,
        deleteSetlist,
        addSchedule,
        updateSchedule,
        deleteSchedule,
        updateLiveState,
        setCurrentSlide,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
