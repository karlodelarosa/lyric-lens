import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  ReactNode,
} from "react";
import { useOrganization } from "@frontend/contexts/OrganizationContext";
import {
  createEvent as createEventApi,
  deleteEvent as deleteEventApi,
  getEvents,
  updateEvent as updateEventApi,
  type EventDto,
} from "@frontend/lib/api/events";
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
  updateSong as updateSongApi,
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

export type SetlistFlowSectionInput = {
  name: string;
  songIds: string[];
};

export type NewSetlistInput = {
  name: string;
  songs: string[];
  flowSections?: SetlistFlowSectionInput[];
};

export type UpdateSetlistInput = {
  name?: string;
  songs?: string[];
  flowSections?: SetlistFlowSectionInput[];
};

interface Schedule {
  id: string;
  title: string;
  date: string;
  setlistId?: string;
}

export type NewScheduleInput = {
  title: string;
  date: string;
  setlistId?: string;
};

export type UpdateScheduleInput = {
  title?: string;
  date?: string;
  setlistId?: string | null;
};

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
  schedulesLoading: boolean;
  schedulesError: string | null;
  liveState: LiveState;
  refreshSongs: () => Promise<void>;
  refreshSetlists: () => Promise<void>;
  refreshSchedules: () => Promise<void>;
  addSong: (song: NewSongInput) => Promise<void>;
  updateSong: (id: string, song: NewSongInput) => Promise<void>;
  deleteSong: (id: string) => Promise<void>;
  addSetlist: (input: NewSetlistInput) => Promise<void>;
  updateSetlist: (id: string, input: UpdateSetlistInput) => Promise<void>;
  deleteSetlist: (id: string) => Promise<void>;
  addSchedule: (schedule: NewScheduleInput) => Promise<void>;
  updateSchedule: (id: string, schedule: UpdateScheduleInput) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;
  updateLiveState: (state: Partial<LiveState>) => void;
  setCurrentSlide: (songId: string, sectionId: string) => void;
}

import {
  createLiveStateChannel,
  LIVE_STATE_STORAGE_KEY,
  publishLiveState,
  readLiveStateFromStorage,
} from "../lib/liveStateSync";

const AppContext = createContext<AppContextType | undefined>(undefined);

function getDefaultLiveState(): LiveState {
  return {
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
}

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
    flowSections: dto.flowSections ?? [],
  };
}

function mapEventDto(dto: EventDto): Schedule {
  return {
    id: dto.id,
    title: dto.title,
    date: dto.date,
    setlistId: dto.setlistId,
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { activeOrganizationId, isLoading: isOrgLoading } = useOrganization();
  const [songs, setSongs] = useState<Song[]>([]);
  const [songsLoading, setSongsLoading] = useState(false);
  const [songsError, setSongsError] = useState<string | null>(null);
  const [setlists, setSetlists] = useState<Setlist[]>([]);
  const [setlistsLoading, setSetlistsLoading] = useState(false);
  const [setlistsError, setSetlistsError] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [schedulesLoading, setSchedulesLoading] = useState(false);
  const [schedulesError, setSchedulesError] = useState<string | null>(null);
  const [liveState, setLiveState] = useState<LiveState>(getDefaultLiveState);
  const [liveStateHydrated, setLiveStateHydrated] = useState(false);
  const liveStateChannelRef = React.useRef<ReturnType<
    typeof createLiveStateChannel
  > | null>(null);

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
    } catch (error) {
      setSongs([]);
      setSongsError(
        error instanceof Error ? error.message : "Failed to load songs",
      );
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
    } catch (error) {
      setSetlists([]);
      setSetlistsError(
        error instanceof Error ? error.message : "Failed to load setlists",
      );
    } finally {
      setSetlistsLoading(false);
    }
  }, [activeOrganizationId]);

  const refreshSchedules = useCallback(async () => {
    if (!activeOrganizationId) {
      setSchedules([]);
      setSchedulesError(null);
      return;
    }

    setSchedulesLoading(true);
    setSchedulesError(null);

    try {
      const { events: loaded } = await getEvents(activeOrganizationId);
      setSchedules(loaded.map(mapEventDto));
    } catch (error) {
      setSchedules([]);
      setSchedulesError(
        error instanceof Error ? error.message : "Failed to load events",
      );
    } finally {
      setSchedulesLoading(false);
    }
  }, [activeOrganizationId]);

  React.useEffect(() => {
    if (isOrgLoading) return;
    refreshSongs();
    refreshSetlists();
    refreshSchedules();
  }, [isOrgLoading, refreshSongs, refreshSetlists, refreshSchedules]);

  React.useEffect(() => {
    const saved = readLiveStateFromStorage();
    if (saved) {
      setLiveState((prev) => ({ ...prev, ...saved }) as LiveState);
    }
    setLiveStateHydrated(true);

    const channel = createLiveStateChannel();
    liveStateChannelRef.current = channel;

    const onChannelMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== "object") return;
      setLiveState((prev) => ({ ...prev, ...event.data }) as LiveState);
    };

    channel?.addEventListener("message", onChannelMessage);

    const onStorage = (event: StorageEvent) => {
      if (event.key !== LIVE_STATE_STORAGE_KEY || !event.newValue) return;

      try {
        setLiveState((prev) => ({
          ...prev,
          ...JSON.parse(event.newValue || "{}"),
        }) as LiveState);
      } catch {
        // Ignore malformed storage payloads.
      }
    };

    window.addEventListener("storage", onStorage);

    return () => {
      channel?.removeEventListener("message", onChannelMessage);
      channel?.close();
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  React.useEffect(() => {
    if (!liveStateHydrated) return;

    publishLiveState(
      liveStateChannelRef.current,
      liveState as unknown as Record<string, unknown>,
    );
  }, [liveState, liveStateHydrated]);

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

  const updateSong = async (id: string, song: NewSongInput) => {
    if (!activeOrganizationId) {
      throw new Error("No organization selected");
    }

    const { song: updated } = await updateSongApi(activeOrganizationId, id, {
      title: song.title,
      artist: song.artist,
      tags: song.tags,
      sections: song.sections.map((section) => ({
        type: section.type,
        number: section.number,
        lyrics: section.lyrics,
      })),
    });

    setSongs((prev) =>
      prev.map((s) => (s.id === id ? mapSongDto(updated) : s)),
    );
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
      flowSections: input.flowSections,
    });

    setSetlists((prev) => [...prev, mapSetlistDto(created)]);
  };

  const updateSetlist = async (id: string, input: UpdateSetlistInput) => {
    if (!activeOrganizationId) {
      throw new Error("No organization selected");
    }

    const payload: {
      title?: string;
      songIds?: string[];
      flowSections?: SetlistFlowSectionInput[];
    } = {};
    if (input.name !== undefined) payload.title = input.name;
    if (input.songs !== undefined) payload.songIds = input.songs;
    if (input.flowSections !== undefined) {
      payload.flowSections = input.flowSections;
    }

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

  const addSchedule = async (schedule: NewScheduleInput) => {
    if (!activeOrganizationId) {
      throw new Error("No organization selected");
    }

    const { event: created } = await createEventApi(activeOrganizationId, {
      title: schedule.title,
      date: schedule.date,
      setlistId: schedule.setlistId ?? null,
    });

    setSchedules((prev) => [...prev, mapEventDto(created)]);
  };

  const updateSchedule = async (id: string, updates: UpdateScheduleInput) => {
    if (!activeOrganizationId) {
      throw new Error("No organization selected");
    }

    const payload: {
      title?: string;
      date?: string;
      setlistId?: string | null;
    } = {};

    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.date !== undefined) payload.date = updates.date;
    if (updates.setlistId !== undefined) payload.setlistId = updates.setlistId;

    const { event: updated } = await updateEventApi(
      activeOrganizationId,
      id,
      payload,
    );

    setSchedules((prev) =>
      prev.map((schedule) =>
        schedule.id === id ? mapEventDto(updated) : schedule,
      ),
    );
  };

  const deleteSchedule = async (id: string) => {
    if (!activeOrganizationId) {
      throw new Error("No organization selected");
    }

    await deleteEventApi(activeOrganizationId, id);
    setSchedules((prev) => prev.filter((schedule) => schedule.id !== id));
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
        schedulesLoading,
        schedulesError,
        liveState,
        refreshSongs,
        refreshSetlists,
        refreshSchedules,
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
