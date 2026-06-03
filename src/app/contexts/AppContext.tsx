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
  createAnnouncement as createAnnouncementApi,
  deleteAnnouncement as deleteAnnouncementApi,
  getAnnouncements,
  updateAnnouncement as updateAnnouncementApi,
  type AnnouncementDto,
} from "@frontend/lib/api/announcements";
import {
  createServiceFlow as createServiceFlowApi,
  deleteServiceFlow as deleteServiceFlowApi,
  duplicateServiceFlow as duplicateServiceFlowApi,
  getServiceFlows,
  updateServiceFlow as updateServiceFlowApi,
  type ServiceFlowDto,
  type ServiceFlowListItemDto,
  type ServiceFlowSegmentInput,
} from "@frontend/lib/api/serviceFlows";
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
  welcomeSlide: WelcomeSlide | null;
  scheduleId?: string;
}

export type WelcomeSlide = {
  url: string;
  type: "image" | "video";
};

export type SetlistFlowSectionInput = {
  name: string;
  songIds: string[];
};

export type NewSetlistInput = {
  name: string;
  songs: string[];
  flowSections?: SetlistFlowSectionInput[];
  welcomeSlide?: WelcomeSlide | null;
};

export type UpdateSetlistInput = {
  name?: string;
  songs?: string[];
  flowSections?: SetlistFlowSectionInput[];
  welcomeSlide?: WelcomeSlide | null;
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

export type AnnouncementSlide = {
  url: string;
  type: "image" | "video";
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  category: string | null;
  expiresAt: string | null;
  slides: AnnouncementSlide[];
};

export type NewAnnouncementInput = {
  title: string;
  body: string;
  category?: string | null;
  expiresAt?: string | null;
  slides?: AnnouncementSlide[];
};

export type UpdateAnnouncementInput = {
  title?: string;
  body?: string;
  category?: string | null;
  expiresAt?: string | null;
  slides?: AnnouncementSlide[];
};

export type ServiceFlowSegmentKind = "music" | "announcements" | "cue";

export type ServiceFlowSegment = {
  id: string;
  position: number;
  label: string;
  kind: ServiceFlowSegmentKind;
  notes: string | null;
  setlistId: string | null;
  setlistName: string | null;
  announcements: Announcement[];
};

export type ServiceFlowListItem = {
  id: string;
  title: string;
  description: string | null;
  segmentCount: number;
};

export type ServiceFlow = {
  id: string;
  title: string;
  description: string | null;
  segments: ServiceFlowSegment[];
};

export type NewServiceFlowInput = {
  title: string;
  description?: string | null;
  segments: ServiceFlowSegmentInput[];
};

export type UpdateServiceFlowInput = {
  title?: string;
  description?: string | null;
  segments?: ServiceFlowSegmentInput[];
};

export type SlideMode = "lyrics" | "announcement" | "cue" | "welcome" | "blank";

interface LiveState {
  isLive: boolean;
  slideMode: SlideMode;
  currentServiceFlowId: string | null;
  currentSegmentId: string | null;
  currentAnnouncementId: string | null;
  currentAnnouncementTitle: string | null;
  currentAnnouncementBody: string | null;
  currentAnnouncementSlides: AnnouncementSlide[];
  currentCueLabel: string | null;
  currentCueNotes: string | null;
  welcomeSlideUrl: string | null;
  welcomeSlideType: "image" | "video" | null;
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
  idleTimeoutSeconds: number;
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
  announcements: Announcement[];
  announcementsLoading: boolean;
  announcementsError: string | null;
  serviceFlowList: ServiceFlowListItem[];
  serviceFlowsLoading: boolean;
  serviceFlowsError: string | null;
  liveState: LiveState;
  refreshSongs: () => Promise<void>;
  refreshSetlists: () => Promise<void>;
  refreshSchedules: () => Promise<void>;
  refreshAnnouncements: () => Promise<void>;
  refreshServiceFlows: () => Promise<void>;
  addSong: (song: NewSongInput) => Promise<void>;
  updateSong: (id: string, song: NewSongInput) => Promise<void>;
  deleteSong: (id: string) => Promise<void>;
  addSetlist: (input: NewSetlistInput) => Promise<void>;
  updateSetlist: (id: string, input: UpdateSetlistInput) => Promise<void>;
  deleteSetlist: (id: string) => Promise<void>;
  addSchedule: (schedule: NewScheduleInput) => Promise<void>;
  updateSchedule: (id: string, schedule: UpdateScheduleInput) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;
  addAnnouncement: (input: NewAnnouncementInput) => Promise<void>;
  updateAnnouncement: (
    id: string,
    input: UpdateAnnouncementInput,
  ) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;
  addServiceFlow: (input: NewServiceFlowInput) => Promise<ServiceFlow>;
  updateServiceFlow: (
    id: string,
    input: UpdateServiceFlowInput,
  ) => Promise<ServiceFlow>;
  deleteServiceFlow: (id: string) => Promise<void>;
  duplicateServiceFlow: (id: string) => Promise<ServiceFlow>;
  updateLiveState: (state: Partial<LiveState>) => void;
  setCurrentSlide: (songId: string, sectionId: string) => void;
  setCurrentAnnouncement: (
    announcement: Announcement,
    slideIndex?: number,
  ) => void;
  setCurrentCue: (label: string, notes: string | null) => void;
  showWelcomeSlide: (welcomeSlide: WelcomeSlide) => void;
  clearScreen: () => void;
}

import {
  createLiveStateChannel,
  isLiveStateBroadcast,
  LIVE_STATE_STORAGE_KEY,
  publishLiveState,
  readLiveStateFromStorage,
} from "../lib/liveStateSync";

const AppContext = createContext<AppContextType | undefined>(undefined);

function mapAnnouncementDto(dto: AnnouncementDto): Announcement {
  return {
    id: dto.id,
    title: dto.title,
    body: dto.body,
    category: dto.category,
    expiresAt: dto.expiresAt,
    slides: dto.slides ?? [],
  };
}

function mapServiceFlowListItemDto(
  dto: ServiceFlowListItemDto,
): ServiceFlowListItem {
  return {
    id: dto.id,
    title: dto.title,
    description: dto.description,
    segmentCount: dto.segmentCount,
  };
}

export function mapServiceFlowDto(dto: ServiceFlowDto): ServiceFlow {
  return {
    id: dto.id,
    title: dto.title,
    description: dto.description,
    segments: dto.segments.map((segment) => ({
      id: segment.id,
      position: segment.position,
      label: segment.label,
      kind: segment.kind,
      notes: segment.notes,
      setlistId: segment.setlistId,
      setlistName: segment.setlistName,
      announcements: segment.announcements.map(mapAnnouncementDto),
    })),
  };
}

function getDefaultLiveState(): LiveState {
  return {
    isLive: false,
    slideMode: "lyrics",
    currentServiceFlowId: null,
    currentSegmentId: null,
    currentAnnouncementId: null,
    currentAnnouncementTitle: null,
    currentAnnouncementBody: null,
    currentAnnouncementSlides: [],
    currentCueLabel: null,
    currentCueNotes: null,
    welcomeSlideUrl: null,
    welcomeSlideType: null,
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
    idleTimeoutSeconds: 120,
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
    welcomeSlide: dto.welcomeSlide ?? null,
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
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);
  const [announcementsError, setAnnouncementsError] = useState<string | null>(
    null,
  );
  const [serviceFlowList, setServiceFlowList] = useState<ServiceFlowListItem[]>(
    [],
  );
  const [serviceFlowsLoading, setServiceFlowsLoading] = useState(false);
  const [serviceFlowsError, setServiceFlowsError] = useState<string | null>(
    null,
  );
  const [liveState, setLiveState] = useState<LiveState>(getDefaultLiveState);
  const [liveStateHydrated, setLiveStateHydrated] = useState(false);
  const liveStateChannelRef = React.useRef<ReturnType<
    typeof createLiveStateChannel
  > | null>(null);
  const liveStateSourceIdRef = React.useRef(
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `live-${Math.random().toString(36).slice(2)}`,
  );
  const pendingPublishRef = React.useRef<LiveState | null>(null);
  const publishRafRef = React.useRef<number | null>(null);
  const liveActivityRef = React.useRef(Date.now());
  const skipNextPublishRef = React.useRef(false);

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

  const refreshAnnouncements = useCallback(async () => {
    if (!activeOrganizationId) {
      setAnnouncements([]);
      setAnnouncementsError(null);
      return;
    }

    setAnnouncementsLoading(true);
    setAnnouncementsError(null);

    try {
      const { announcements: loaded } =
        await getAnnouncements(activeOrganizationId);
      setAnnouncements(loaded.map(mapAnnouncementDto));
    } catch (error) {
      setAnnouncements([]);
      setAnnouncementsError(
        error instanceof Error ? error.message : "Failed to load announcements",
      );
    } finally {
      setAnnouncementsLoading(false);
    }
  }, [activeOrganizationId]);

  const refreshServiceFlows = useCallback(async () => {
    if (!activeOrganizationId) {
      setServiceFlowList([]);
      setServiceFlowsError(null);
      return;
    }

    setServiceFlowsLoading(true);
    setServiceFlowsError(null);

    try {
      const { serviceFlows: loaded } =
        await getServiceFlows(activeOrganizationId);
      setServiceFlowList(loaded.map(mapServiceFlowListItemDto));
    } catch (error) {
      setServiceFlowList([]);
      setServiceFlowsError(
        error instanceof Error ? error.message : "Failed to load service flows",
      );
    } finally {
      setServiceFlowsLoading(false);
    }
  }, [activeOrganizationId]);

  React.useEffect(() => {
    if (isOrgLoading) return;
    refreshSongs();
    refreshSetlists();
    refreshSchedules();
    refreshAnnouncements();
    refreshServiceFlows();
  }, [
    isOrgLoading,
    refreshSongs,
    refreshSetlists,
    refreshSchedules,
    refreshAnnouncements,
    refreshServiceFlows,
  ]);

  React.useEffect(() => {
    const saved = readLiveStateFromStorage();
    if (saved) {
      setLiveState(
        (prev) =>
          ({
            ...prev,
            ...saved,
            currentAnnouncementSlides: Array.isArray(
              saved.currentAnnouncementSlides,
            )
              ? saved.currentAnnouncementSlides
              : prev.currentAnnouncementSlides,
          }) as LiveState,
      );
    }
    setLiveStateHydrated(true);

    const channel = createLiveStateChannel();
    liveStateChannelRef.current = channel;

    const applyRemoteLiveState = (partial: Record<string, unknown>) => {
      liveActivityRef.current = Date.now();
      skipNextPublishRef.current = true;
      setLiveState((prev) => {
        const next = {
          ...prev,
          ...partial,
          currentAnnouncementSlides: Array.isArray(
            partial.currentAnnouncementSlides,
          )
            ? partial.currentAnnouncementSlides
            : prev.currentAnnouncementSlides,
        } as LiveState;
        if (JSON.stringify(prev) === JSON.stringify(next)) {
          skipNextPublishRef.current = false;
          return prev;
        }
        return next;
      });
    };

    const onChannelMessage = (event: MessageEvent) => {
      if (!isLiveStateBroadcast(event.data)) return;
      if (event.data.sourceId === liveStateSourceIdRef.current) return;
      applyRemoteLiveState(event.data.state);
    };

    channel?.addEventListener("message", onChannelMessage);

    const onStorage = (event: StorageEvent) => {
      if (event.key !== LIVE_STATE_STORAGE_KEY || !event.newValue) return;

      try {
        const parsed = JSON.parse(event.newValue) as Record<string, unknown>;
        if (parsed && typeof parsed === "object") {
          applyRemoteLiveState(parsed);
        }
      } catch {
        // Ignore malformed storage payloads.
      }
    };

    // BroadcastChannel handles same-origin windows; storage is a fallback only.
    if (!channel) {
      window.addEventListener("storage", onStorage);
    }

    return () => {
      channel?.removeEventListener("message", onChannelMessage);
      channel?.close();
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  React.useEffect(() => {
    if (!liveStateHydrated) return;
    if (skipNextPublishRef.current) {
      skipNextPublishRef.current = false;
      return;
    }

    pendingPublishRef.current = liveState;

    if (publishRafRef.current != null) return;

    publishRafRef.current = requestAnimationFrame(() => {
      publishRafRef.current = null;
      const state = pendingPublishRef.current;
      if (!state) return;

      publishLiveState(
        liveStateChannelRef.current,
        liveStateSourceIdRef.current,
        state as unknown as Record<string, unknown>,
      );
    });
  }, [liveState, liveStateHydrated]);

  React.useEffect(() => {
    return () => {
      if (publishRafRef.current != null) {
        cancelAnimationFrame(publishRafRef.current);
      }
    };
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
      welcomeSlide: input.welcomeSlide ?? null,
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
      welcomeSlide?: WelcomeSlide | null;
    } = {};
    if (input.name !== undefined) payload.title = input.name;
    if (input.songs !== undefined) payload.songIds = input.songs;
    if (input.flowSections !== undefined) {
      payload.flowSections = input.flowSections;
    }
    if (input.welcomeSlide !== undefined) {
      payload.welcomeSlide = input.welcomeSlide;
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

  const addAnnouncement = async (input: NewAnnouncementInput) => {
    if (!activeOrganizationId) {
      throw new Error("No organization selected");
    }

    const { announcement: created } = await createAnnouncementApi(
      activeOrganizationId,
      input,
    );

    setAnnouncements((prev) => [...prev, mapAnnouncementDto(created)]);
  };

  const updateAnnouncement = async (
    id: string,
    input: UpdateAnnouncementInput,
  ) => {
    if (!activeOrganizationId) {
      throw new Error("No organization selected");
    }

    const { announcement: updated } = await updateAnnouncementApi(
      activeOrganizationId,
      id,
      input,
    );

    setAnnouncements((prev) =>
      prev.map((item) => (item.id === id ? mapAnnouncementDto(updated) : item)),
    );
  };

  const deleteAnnouncement = async (id: string) => {
    if (!activeOrganizationId) {
      throw new Error("No organization selected");
    }

    await deleteAnnouncementApi(activeOrganizationId, id);
    setAnnouncements((prev) => prev.filter((item) => item.id !== id));
  };

  const addServiceFlow = async (input: NewServiceFlowInput) => {
    if (!activeOrganizationId) {
      throw new Error("No organization selected");
    }

    const { serviceFlow: created } = await createServiceFlowApi(
      activeOrganizationId,
      input,
    );

    const mapped = mapServiceFlowDto(created);
    setServiceFlowList((prev) => [
      ...prev,
      {
        id: mapped.id,
        title: mapped.title,
        description: mapped.description,
        segmentCount: mapped.segments.length,
      },
    ]);

    return mapped;
  };

  const updateServiceFlow = async (
    id: string,
    input: UpdateServiceFlowInput,
  ) => {
    if (!activeOrganizationId) {
      throw new Error("No organization selected");
    }

    const { serviceFlow: updated } = await updateServiceFlowApi(
      activeOrganizationId,
      id,
      input,
    );

    const mapped = mapServiceFlowDto(updated);
    setServiceFlowList((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              id: mapped.id,
              title: mapped.title,
              description: mapped.description,
              segmentCount: mapped.segments.length,
            }
          : item,
      ),
    );

    return mapped;
  };

  const deleteServiceFlow = async (id: string) => {
    if (!activeOrganizationId) {
      throw new Error("No organization selected");
    }

    await deleteServiceFlowApi(activeOrganizationId, id);
    setServiceFlowList((prev) => prev.filter((item) => item.id !== id));
  };

  const duplicateServiceFlow = async (id: string) => {
    if (!activeOrganizationId) {
      throw new Error("No organization selected");
    }

    const { serviceFlow: duplicated } = await duplicateServiceFlowApi(
      activeOrganizationId,
      id,
    );

    const mapped = mapServiceFlowDto(duplicated);
    setServiceFlowList((prev) => [
      ...prev,
      {
        id: mapped.id,
        title: mapped.title,
        description: mapped.description,
        segmentCount: mapped.segments.length,
      },
    ]);

    return mapped;
  };

  const updateLiveState = useCallback((state: Partial<LiveState>) => {
    const isIdleBlank =
      state.slideMode === "blank" && Object.keys(state).length === 1;

    if (!isIdleBlank) {
      liveActivityRef.current = Date.now();
    }

    setLiveState((prev) => ({ ...prev, ...state }));
  }, []);

  React.useEffect(() => {
    const interval = window.setInterval(() => {
      if (
        typeof window !== "undefined" &&
        window.location.pathname.startsWith("/presenter")
      ) {
        return;
      }

      setLiveState((prev) => {
        if (!prev.isLive) return prev;
        if (prev.idleTimeoutSeconds <= 0) return prev;
        if (
          prev.slideMode === "blank" ||
          prev.slideMode === "welcome" ||
          prev.slideMode === "announcement"
        ) {
          return prev;
        }

        const elapsedMs = Date.now() - liveActivityRef.current;
        if (elapsedMs < prev.idleTimeoutSeconds * 1000) return prev;

        return { ...prev, slideMode: "blank", manualLyrics: null };
      });
    }, 5000);

    return () => window.clearInterval(interval);
  }, []);

  const setCurrentSlide = useCallback((songId: string, sectionId: string) => {
    liveActivityRef.current = Date.now();
    setLiveState((prev) => ({
      ...prev,
      slideMode: "lyrics",
      currentSongId: songId,
      currentSectionId: sectionId,
      manualLyrics: null,
      currentChunkIndex: 0,
    }));
  }, []);

  const setCurrentAnnouncement = useCallback(
    (announcement: Announcement, slideIndex = 0) => {
      liveActivityRef.current = Date.now();
      const slides = Array.isArray(announcement.slides)
        ? announcement.slides
        : [];
      const maxSlideIndex = Math.max(slides.length - 1, 0);
      const safeSlideIndex = Math.min(
        Math.max(slideIndex, 0),
        slides.length > 0 ? maxSlideIndex : 0,
      );

      setLiveState((prev) => ({
        ...prev,
        slideMode: "announcement",
        currentAnnouncementId: announcement.id,
        currentAnnouncementTitle: announcement.title,
        currentAnnouncementBody: announcement.body,
        currentAnnouncementSlides: slides,
        manualLyrics: null,
        currentChunkIndex: safeSlideIndex,
      }));
    },
    [],
  );

  const setCurrentCue = useCallback((label: string, notes: string | null) => {
    liveActivityRef.current = Date.now();
    setLiveState((prev) => ({
      ...prev,
      slideMode: "cue",
      currentCueLabel: label,
      currentCueNotes: notes,
      manualLyrics: null,
      currentChunkIndex: 0,
    }));
  }, []);

  const showWelcomeSlide = useCallback((welcomeSlide: WelcomeSlide) => {
    liveActivityRef.current = Date.now();
    setLiveState((prev) => ({
      ...prev,
      slideMode: "welcome",
      welcomeSlideUrl: welcomeSlide.url,
      welcomeSlideType: welcomeSlide.type,
      manualLyrics: null,
      currentChunkIndex: 0,
    }));
  }, []);

  const clearScreen = useCallback(() => {
    liveActivityRef.current = Date.now();
    setLiveState((prev) => ({
      ...prev,
      slideMode: "blank",
      manualLyrics: null,
    }));
  }, []);

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
        announcements,
        announcementsLoading,
        announcementsError,
        serviceFlowList,
        serviceFlowsLoading,
        serviceFlowsError,
        liveState,
        refreshSongs,
        refreshSetlists,
        refreshSchedules,
        refreshAnnouncements,
        refreshServiceFlows,
        addSong,
        updateSong,
        deleteSong,
        addSetlist,
        updateSetlist,
        deleteSetlist,
        addSchedule,
        updateSchedule,
        deleteSchedule,
        addAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        addServiceFlow,
        updateServiceFlow,
        deleteServiceFlow,
        duplicateServiceFlow,
        updateLiveState,
        setCurrentSlide,
        setCurrentAnnouncement,
        setCurrentCue,
        showWelcomeSlide,
        clearScreen,
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
