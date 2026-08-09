import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@frontend/contexts/AuthContext";
import { useOrganization } from "@frontend/contexts/OrganizationContext";
import { useTheme } from "../../contexts/ThemeContext";
import {
  Home,
  Music,
  List,
  GitBranch,
  Megaphone,
  Calendar,
  Play,
  ChevronRight,
  BookOpen,
  Sun,
  Moon,
  Globe,
  PanelLeftClose,
  PanelLeftOpen,
  Eye,
  User,
  LogOut,
  Trash2,
} from "lucide-react";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { cn } from "../../lib/utils";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { OfflineBanner } from "../OfflineBanner";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function RootLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const {
    organizations,
    activeOrganization,
    activeOrganizationId,
    setActiveOrganizationId,
  } = useOrganization();
  const { theme, setTheme } = useTheme();
  const displayName = user?.displayName ?? "User";
  const initials = getInitials(displayName);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showCollapseHint, setShowCollapseHint] = useState(false);

  const mainNavigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Songs", href: "/songs", icon: Music },
    { name: "Setlists", href: "/setlists", icon: List },
    { name: "Service Flows", href: "/service-flows", icon: GitBranch },
    { name: "Announcements", href: "/announcements", icon: Megaphone },
    { name: "Schedule", href: "/schedule", icon: Calendar },
  ];

  const liveNav = {
    name: "Live Mode",
    href: "/live",
  };

  const secondaryNavigation = [
    { name: "How to use", href: "/how-to-use", icon: BookOpen },
    { name: "Website", href: "/website", icon: Globe },
    { name: "Trash", href: "/trash", icon: Trash2 },
  ];

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  const sidebarTitle =
    (activeOrganization?.showOrgNameInSidebar ?? true) &&
    activeOrganization?.name
      ? activeOrganization.name
      : "Lyric Lens";

  useEffect(() => {
    if (location.pathname.startsWith("/live")) {
      setIsSidebarCollapsed(true);
      setShowCollapseHint(true);
      const timeout = window.setTimeout(() => setShowCollapseHint(false), 2400);
      return () => window.clearTimeout(timeout);
    }
    return undefined;
  }, [location.pathname]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("welcome") !== "1") return;

    const user = params.get("user") ?? "Demo User";
    toast.success(`Welcome, ${user}!`);
    params.delete("welcome");
    params.delete("user");
    const nextSearch = params.toString();
    navigate(
      {
        pathname: location.pathname,
        search: nextSearch ? `?${nextSearch}` : "",
      },
      { replace: true },
    );
  }, [location.pathname, location.search, navigate]);

  return (
    <div className="flex flex-col h-screen bg-background">
      <OfflineBanner />
      <div className="flex flex-1 min-h-0">
      {/* Sidebar */}
      <aside
        className={cn(
          "border-r bg-card/50 backdrop-blur-sm flex flex-col transition-all duration-300",
          isSidebarCollapsed ? "w-20" : "w-64",
        )}
      >
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                {showCollapseHint && (
                  <span className="absolute -inset-1 rounded-full border border-primary/40 animate-ping" />
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative z-[1] h-8 w-8"
                  onClick={() => {
                    setIsSidebarCollapsed((prev) => !prev);
                    setShowCollapseHint(false);
                  }}
                >
                  {isSidebarCollapsed ? (
                    <PanelLeftOpen className="w-4 h-4" />
                  ) : (
                    <PanelLeftClose className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
            {!isSidebarCollapsed && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="h-8 w-8"
                title={
                  theme === "dark"
                    ? "Switch to light mode"
                    : "Switch to dark mode"
                }
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </Button>
            )}
          </div>
          <div
            className={cn(
              "flex items-center gap-2 mt-3",
              isSidebarCollapsed && "justify-center",
            )}
          >
            <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
              {activeOrganization?.logoUrl ? (
                <img
                  src={activeOrganization.logoUrl}
                  alt={`${activeOrganization.name} logo`}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="w-full h-full bg-primary flex items-center justify-center">
                  <Eye className="w-5 h-5 text-primary-foreground" />
                </div>
              )}
            </div>
            {!isSidebarCollapsed && (
              <div>
                <h1 className="font-semibold text-lg truncate">
                  {sidebarTitle}
                </h1>
                <p className="text-xs text-muted-foreground">
                  Worship Platform
                </p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-1 min-h-0">
          <div className="space-y-1">
            {mainNavigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center px-3 py-2.5 rounded-lg transition-all duration-200",
                    isSidebarCollapsed ? "justify-center" : "gap-3",
                    active
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                  title={isSidebarCollapsed ? item.name : undefined}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {!isSidebarCollapsed && (
                    <span className="font-medium">{item.name}</span>
                  )}
                </Link>
              );
            })}
          </div>

          <div
            className={cn(
              "pt-3",
              !isSidebarCollapsed && "border-t border-border/80 mt-2 px-1",
            )}
          >
            {!isSidebarCollapsed && (
              <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Present
              </p>
            )}
            <Button
              asChild
              size={isSidebarCollapsed ? "icon" : "lg"}
              className={cn(
                "w-full cursor-pointer font-semibold transition-all",
                "bg-primary hover:bg-primary/90",
                "text-primary-foreground",
                "shadow-md hover:shadow-lg hover:-translate-y-0.5",
                "active:translate-y-0 active:shadow-md",
                "border border-primary-foreground/20",
                isSidebarCollapsed
                  ? "h-12 w-12 rounded-xl"
                  : "h-auto py-3.5 rounded-xl justify-between gap-2",
                isActive(liveNav.href) &&
                  "ring-2 ring-primary-foreground/40 ring-offset-2 ring-offset-card",
              )}
            >
              <Link
                to={liveNav.href}
                title={isSidebarCollapsed ? liveNav.name : undefined}
              >
                {isSidebarCollapsed ? (
                  <Play className="w-5 h-5 fill-current" />
                ) : (
                  <>
                    <span className="flex items-center gap-2.5 min-w-0 text-primary-foreground">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/20">
                        <Play className="w-4 h-4 fill-current" />
                      </span>
                      <span className="flex flex-col items-start text-left leading-tight">
                        <span className="text-base font-bold">
                          Open Live Mode
                        </span>
                        <span className="text-[11px] font-normal opacity-90">
                          Control & project
                        </span>
                      </span>
                    </span>
                  </>
                )}
              </Link>
            </Button>
          </div>

          <div className="space-y-1 mt-auto pt-3">
            {secondaryNavigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-lg transition-all duration-200 text-sm",
                    isSidebarCollapsed ? "justify-center" : "gap-3",
                    active
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                  title={isSidebarCollapsed ? item.name : undefined}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!isSidebarCollapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </div>
        </nav>

        {organizations.length > 1 && !isSidebarCollapsed && (
          <div className="px-4 pb-2">
            <Select
              value={activeOrganizationId ?? undefined}
              onValueChange={setActiveOrganizationId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Organization" />
              </SelectTrigger>
              <SelectContent>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {activeOrganization && (
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {activeOrganization.name}
              </p>
            )}
          </div>
        )}

        <div className="p-4 border-t">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "w-full",
                  isSidebarCollapsed
                    ? "justify-center px-2"
                    : "justify-between",
                )}
                title={isSidebarCollapsed ? "Account" : undefined}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <Avatar className="size-6">
                    <AvatarFallback className="text-[11px]">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  {!isSidebarCollapsed && (
                    <span className="truncate">{displayName}</span>
                  )}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align={isSidebarCollapsed ? "center" : "start"}
              side="top"
              className="w-48"
            >
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <User className="h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => logout()}>
                <LogOut className="h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
      </div>
    </div>
  );
}
