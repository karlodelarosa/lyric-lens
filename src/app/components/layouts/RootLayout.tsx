import { Outlet, Link, useLocation } from "react-router";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  Home,
  Music,
  List,
  Calendar,
  Radio,
  Sun,
  Moon,
  Globe,
  PanelLeftClose,
  PanelLeftOpen,
  Eye,
} from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

export function RootLayout() {
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showCollapseHint, setShowCollapseHint] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Songs', href: '/songs', icon: Music },
    { name: 'Setlists', href: '/setlists', icon: List },
    { name: 'Schedule', href: '/schedule', icon: Calendar },
    { name: 'Live Mode', href: '/live', icon: Radio },
    { name: 'Website', href: '/website', icon: Globe },
  ];

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  useEffect(() => {
    if (location.pathname.startsWith("/live")) {
      setIsSidebarCollapsed(true);
      setShowCollapseHint(true);
      const timeout = window.setTimeout(() => setShowCollapseHint(false), 2400);
      return () => window.clearTimeout(timeout);
    }
    return undefined;
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "border-r bg-card/50 backdrop-blur-sm flex flex-col transition-all duration-300",
          isSidebarCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className="p-4 border-b">
          <div className={cn("flex items-center", isSidebarCollapsed ? "justify-center" : "justify-between")}>
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
              <span className="text-xs text-muted-foreground">Collapse</span>
            )}
          </div>
          <div className={cn("flex items-center gap-2 mt-3", isSidebarCollapsed && "justify-center")}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <Eye className="w-5 h-5 text-white" />
            </div>
            {!isSidebarCollapsed && (
              <div>
                <h1 className="font-semibold text-lg">Lyric Lens</h1>
                <p className="text-xs text-muted-foreground">Worship Platform</p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
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
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                title={isSidebarCollapsed ? item.name : undefined}
              >
                <Icon className="w-5 h-5" />
                {!isSidebarCollapsed && <span className="font-medium">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={cn("w-full", isSidebarCollapsed ? "justify-center px-2" : "justify-start gap-2")}
            title={isSidebarCollapsed ? (theme === 'dark' ? 'Light Mode' : 'Dark Mode') : undefined}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {!isSidebarCollapsed && (theme === 'dark' ? 'Light Mode' : 'Dark Mode')}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
