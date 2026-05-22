import React, { createContext, useCallback, useContext, useState, ReactNode } from "react";
import { useOrganization } from "@frontend/contexts/OrganizationContext";
import {
  createSetlist as createSetlistApi,
  deleteSetlist as deleteSetlistApi,
  getSetlists,
  updateSetlist as updateSetlistApi,
  type SetlistDto,
} from "@frontend/lib/api/setlists";
import {
  createSong as createSongApi,
  deleteSong as deleteSongApi,
  getSongs,
  type SongDto,
} from "@frontend/lib/api/songs";

export type SongSectionType =
  | "intro"
  | "verse"
  | "chorus"
  | "bridge"
  | "pre_chorus"
  | "outro"
  | "tag"
  | "custom";

interface SongSection {
  id: string;
  type: SongSectionType;
  number?: number;
  lyrics: string;
}

interface Song {
  id: string;
  title: string;
  artist: string;
  sections: SongSection[];
  tags: string[];
  usageCount: number;
}

export type NewSongInput = {
  title: string;
  artist: string;
  tags: string[];
  sections: {
    type: SongSectionType;
    number?: number;
    lyrics: string;
  }[];
};

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

export type NewSetlistInput = {
  name: string;
  songs: string[];
};

export type UpdateSetlistInput = {
  name?: string;
  songs?: string[];
};

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
  songsLoading: boolean;
  songsError: string | null;
  setlists: Setlist[];
  setlistsLoading: boolean;
  setlistsError: string | null;
  schedules: Schedule[];
  liveState: LiveState;
  refreshSongs: () => Promise<void>;
  refreshSetlists: () => Promise<void>;
  addSong: (song: NewSongInput) => Promise<void>;
  updateSong: (id: string, song: Partial<Song>) => void;
  deleteSong: (id: string) => Promise<void>;
  addSetlist: (input: NewSetlistInput) => Promise<void>;
  updateSetlist: (id: string, input: UpdateSetlistInput) => Promise<void>;
  deleteSetlist: (id: string) => Promise<void>;
  addSchedule: (schedule: Omit<Schedule, "id">) => void;
  updateSchedule: (id: string, schedule: Partial<Schedule>) => void;
  deleteSchedule: (id: string) => void;
  updateLiveState: (state: Partial<LiveState>) => void;
  setCurrentSlide: (songId: string, sectionId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);
const LIVE_STATE_STORAGE_KEY = "lyric-lens-live-state";

function mapSongDto(dto: SongDto): Song {
  return {
    id: dto.id,
    title: dto.title,
    artist: dto.artist,
    tags: dto.tags,
    usageCount: dto.usageCount,
    sections: dto.sections.map((section) => ({
      id: section.id,
      type: section.type as SongSectionType,
      number: section.number,
      lyrics: section.lyrics,
    })),
  };
}

function mapSetlistDto(dto: SetlistDto): Setlist {
  return {
    id: dto.id,
    name: dto.name,
    songs: dto.songs,
    flowSections: [],
  };
}

const mockSchedules: Schedule[] = [
  {
    id: "sch2",
    title: "Wednesday Night Worship",
    date: "2026-04-29",
  },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const { activeOrganizationId, isLoading: isOrgLoading } = useOrganization();
  const [songs, setSongs] = useState<Song[]>([]);
  const [songsLoading, setSongsLoading] = useState(false);
  const [songsError, setSongsError] = useState<string | null>(null);
  const [setlists, setSetlists] = useState<Setlist[]>([]);
  const [setlistsLoading, setSetlistsLoading] = useState(false);
  const [setlistsError, setSetlistsError] = useState<string | null>(null);
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

  const refreshSongs = useCallback(async () => {
    if (!activeOrganizationId) {
      setSongs([]);
      setSongsError(null);
      return;
    }

    setSongsLoading(true);
    setSongsError(null);

    try {
      const { songs: loaded } = await getSongs(activeOrganizationId);
      setSongs(loaded.map(mapSongDto));
    } catch {
      setSongs([]);
      setSongsError("Failed to load songs");
    } finally {
      setSongsLoading(false);
    }
  }, [activeOrganizationId]);

  const refreshSetlists = useCallback(async () => {
    if (!activeOrganizationId) {
      setSetlists([]);
      setSetlistsError(null);
      return;
    }

    setSetlistsLoading(true);
    setSetlistsError(null);

    try {
      const { setlists: loaded } = await getSetlists(activeOrganizationId);
      setSetlists(loaded.map(mapSetlistDto));
    } catch {
      setSetlists([]);
      setSetlistsError("Failed to load setlists");
    } finally {
      setSetlistsLoading(false);
    }
  }, [activeOrganizationId]);

  React.useEffect(() => {
    if (isOrgLoading) return;
    refreshSongs();
    refreshSetlists();
  }, [isOrgLoading, refreshSongs, refreshSetlists]);

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

  const addSong = async (song: NewSongInput) => {
    if (!activeOrganizationId) {
      throw new Error("No organization selected");
    }

    const { song: created } = await createSongApi(activeOrganizationId, {
      title: song.title,
      artist: song.artist,
      tags: song.tags,
      sections: song.sections.map((section) => ({
        type: section.type,
        number: section.number,
        lyrics: section.lyrics,
      })),
    });

    setSongs((prev) => [...prev, mapSongDto(created)]);
  };

  const updateSong = (id: string, updates: Partial<Song>) => {
    setSongs(songs.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const deleteSong = async (id: string) => {
    if (!activeOrganizationId) {
      throw new Error("No organization selected");
    }

    await deleteSongApi(activeOrganizationId, id);
    setSongs((prev) => prev.filter((s) => s.id !== id));
  };

  const addSetlist = async (input: NewSetlistInput) => {
    if (!activeOrganizationId) {
      throw new Error("No organization selected");
    }

    const { setlist: created } = await createSetlistApi(activeOrganizationId, {
      title: input.name,
      songIds: input.songs,
    });

    setSetlists((prev) => [...prev, mapSetlistDto(created)]);
  };

  const updateSetlist = async (id: string, input: UpdateSetlistInput) => {
    if (!activeOrganizationId) {
      throw new Error("No organization selected");
    }

    const payload: { title?: string; songIds?: string[] } = {};
    if (input.name !== undefined) payload.title = input.name;
    if (input.songs !== undefined) payload.songIds = input.songs;

    const { setlist: updated } = await updateSetlistApi(
      activeOrganizationId,
      id,
      payload,
    );

    setSetlists((prev) =>
      prev.map((setlist) =>
        setlist.id === id ? mapSetlistDto(updated) : setlist,
      ),
    );
  };

  const deleteSetlist = async (id: string) => {
    if (!activeOrganizationId) {
      throw new Error("No organization selected");
    }

    await deleteSetlistApi(activeOrganizationId, id);
    setSetlists((prev) => prev.filter((setlist) => setlist.id !== id));
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
        songsLoading,
        songsError,
        setlists,
        setlistsLoading,
        setlistsError,
        schedules,
        liveState,
        refreshSongs,
        refreshSetlists,
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
