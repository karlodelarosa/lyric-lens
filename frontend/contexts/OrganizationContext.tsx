"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  getOrganizations,
  type OrganizationDto,
} from "@frontend/lib/api/organizations";
import { useAuth } from "./AuthContext";

const ACTIVE_ORG_STORAGE_KEY = "lyric-lens-active-org-id";

function isBrowserOnline() {
  return typeof navigator === "undefined" ? true : navigator.onLine;
}

function getSavedOrganizationId() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACTIVE_ORG_STORAGE_KEY);
}

type OrganizationContextValue = {
  organizations: OrganizationDto[];
  activeOrganization: OrganizationDto | null;
  activeOrganizationId: string | null;
  isLoading: boolean;
  loadError: string | null;
  setActiveOrganizationId: (organizationId: string) => void;
  refresh: () => Promise<void>;
};

const OrganizationContext = createContext<OrganizationContextValue | undefined>(
  undefined,
);

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [organizations, setOrganizations] = useState<OrganizationDto[]>([]);
  const [activeOrganizationId, setActiveOrganizationIdState] = useState<
    string | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setOrganizations([]);
      setActiveOrganizationIdState(null);
      setLoadError(null);
      return;
    }

    const { organizations: loaded } = await getOrganizations();
    setOrganizations(loaded);
    setLoadError(null);

    const savedOrgId =
      typeof window !== "undefined"
        ? window.localStorage.getItem(ACTIVE_ORG_STORAGE_KEY)
        : null;

    const nextOrgId =
      loaded.find((org) => org.id === savedOrgId)?.id ?? loaded[0]?.id ?? null;

    setActiveOrganizationIdState(nextOrgId);

    if (nextOrgId && typeof window !== "undefined") {
      window.localStorage.setItem(ACTIVE_ORG_STORAGE_KEY, nextOrgId);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthLoading) return;

    setIsLoading(true);
    refresh()
      .catch(() => {
        const savedOrgId = getSavedOrganizationId();
        if (savedOrgId) {
          setActiveOrganizationIdState(savedOrgId);
          setLoadError(
            isBrowserOnline()
              ? "Could not refresh organizations. Using your last selected organization."
              : null,
          );
          return;
        }

        setOrganizations([]);
        setActiveOrganizationIdState(null);
        setLoadError(
          "Could not load your organizations. Try signing out and back in.",
        );
      })
      .finally(() => setIsLoading(false));
  }, [isAuthLoading, refresh]);

  const setActiveOrganizationId = useCallback((organizationId: string) => {
    setActiveOrganizationIdState(organizationId);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ACTIVE_ORG_STORAGE_KEY, organizationId);
    }
  }, []);

  const activeOrganization =
    organizations.find((org) => org.id === activeOrganizationId) ?? null;

  return (
    <OrganizationContext.Provider
      value={{
        organizations,
        activeOrganization,
        activeOrganizationId,
        isLoading,
        loadError,
        setActiveOrganizationId,
        refresh,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error("useOrganization must be used within OrganizationProvider");
  }
  return context;
}
