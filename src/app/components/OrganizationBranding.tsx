import { useRef, useState } from "react";
import { ImageIcon, Palette, Trash2 } from "lucide-react";
import { useOrganization } from "@frontend/contexts/OrganizationContext";
import { useOrgRole } from "@frontend/hooks/useOrgRole";
import {
  ORG_LOGO_ACCEPT,
  ORG_LOGO_MAX_BYTES,
  updateOrganization,
  uploadOrganizationLogo,
} from "@frontend/lib/api/organizations";
import {
  ORG_THEME_PRESET_IDS,
  ORG_THEME_PRESETS,
  type OrgThemePresetId,
} from "@backend/domain/organization/orgThemePresets";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { cn } from "../lib/utils";
import { toast } from "sonner";

export function OrganizationBranding() {
  const { activeOrganization, refresh } = useOrganization();
  const { isAdmin, isLoading: isRoleLoading } = useOrgRole();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSavingTheme, setIsSavingTheme] = useState(false);
  const [isSavingDisplay, setIsSavingDisplay] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isRemovingLogo, setIsRemovingLogo] = useState(false);

  if (!activeOrganization) {
    return null;
  }

  if (isRoleLoading) {
    return (
      <p className="text-sm text-muted-foreground">
        Loading branding settings…
      </p>
    );
  }

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Organization branding</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Only organization admins can change the color theme, sidebar title,
            and upload a logo.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleThemeChange = async (themePreset: OrgThemePresetId) => {
    if (themePreset === activeOrganization.themePreset) return;

    setIsSavingTheme(true);
    try {
      await updateOrganization(activeOrganization.id, { themePreset });
      await refresh();
      toast.success("Theme updated");
    } catch {
      toast.error("Failed to update theme");
    } finally {
      setIsSavingTheme(false);
    }
  };

  const handleLogoUpload = async (file: File) => {
    if (file.size > ORG_LOGO_MAX_BYTES) {
      toast.error("Logo must be 2 MB or smaller");
      return;
    }

    setIsUploadingLogo(true);
    try {
      await uploadOrganizationLogo(activeOrganization.id, file);
      await refresh();
      toast.success("Logo uploaded");
    } catch {
      toast.error("Failed to upload logo");
    } finally {
      setIsUploadingLogo(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveLogo = async () => {
    setIsRemovingLogo(true);
    try {
      await updateOrganization(activeOrganization.id, { logoUrl: null });
      await refresh();
      toast.success("Logo removed");
    } catch {
      toast.error("Failed to remove logo");
    } finally {
      setIsRemovingLogo(false);
    }
  };

  const handleShowOrgNameChange = async (showOrgNameInSidebar: boolean) => {
    if (showOrgNameInSidebar === activeOrganization.showOrgNameInSidebar) {
      return;
    }

    setIsSavingDisplay(true);
    try {
      await updateOrganization(activeOrganization.id, { showOrgNameInSidebar });
      await refresh();
      toast.success(
        showOrgNameInSidebar
          ? "Sidebar will show your organization name"
          : "Sidebar will show Lyric Lens",
      );
    } catch {
      toast.error("Failed to update sidebar display");
    } finally {
      setIsSavingDisplay(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-primary" />
          Organization branding
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <section className="space-y-3">
          <div>
            <Label>Color theme</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Applies to buttons, accents, and sidebar highlights for everyone
              in {activeOrganization.name}.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {ORG_THEME_PRESET_IDS.map((presetId) => {
              const preset = ORG_THEME_PRESETS[presetId];
              const isSelected = activeOrganization.themePreset === presetId;

              return (
                <button
                  key={presetId}
                  type="button"
                  disabled={isSavingTheme}
                  onClick={() => void handleThemeChange(presetId)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
                    isSelected
                      ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                      : "hover:bg-accent",
                  )}
                >
                  <span
                    className="h-8 w-8 shrink-0 rounded-full border border-black/10"
                    style={{ backgroundColor: preset.swatch }}
                  />
                  <span className="text-sm font-medium">{preset.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-3 pt-2 border-t">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <Label htmlFor="show-org-name">Show organization name</Label>
              <p className="text-sm text-muted-foreground">
                When off, the sidebar title stays as Lyric Lens for everyone in
                this organization. Your logo still appears if uploaded.
              </p>
            </div>
            <Switch
              id="show-org-name"
              checked={activeOrganization.showOrgNameInSidebar ?? true}
              disabled={isSavingDisplay}
              onCheckedChange={(checked) =>
                void handleShowOrgNameChange(checked)
              }
            />
          </div>
        </section>

        <section className="space-y-3 pt-2 border-t">
          <div>
            <Label>Organization logo</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Shown in the sidebar instead of the default emblem. PNG, JPG,
              WebP, GIF, AVIF, or SVG up to 2 MB.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border bg-muted/30">
              {activeOrganization.logoUrl ? (
                <img
                  src={activeOrganization.logoUrl}
                  alt={`${activeOrganization.name} logo`}
                  className="h-full w-full object-contain p-2"
                />
              ) : (
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept={ORG_LOGO_ACCEPT}
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    void handleLogoUpload(file);
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                disabled={isUploadingLogo}
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploadingLogo ? "Uploading…" : "Upload logo"}
              </Button>
              {activeOrganization.logoUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  disabled={isRemovingLogo}
                  onClick={() => void handleRemoveLogo()}
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </Button>
              )}
            </div>
          </div>
        </section>
      </CardContent>
    </Card>
  );
}
