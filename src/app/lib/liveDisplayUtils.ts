export function getContrastingTextColor(backgroundValue: string): string {
  if (backgroundValue.includes("gradient")) {
    return "#ffffff";
  }

  const hex = backgroundValue.replace("#", "");
  if (hex.length !== 3 && hex.length !== 6) {
    return "#ffffff";
  }

  const expand = (value: string) =>
    value.length === 1 ? value + value : value;
  const r = parseInt(expand(hex.slice(0, hex.length === 3 ? 1 : 2)), 16);
  const g = parseInt(
    expand(hex.slice(hex.length === 3 ? 1 : 2, hex.length === 3 ? 2 : 4)),
    16,
  );
  const b = parseInt(
    expand(hex.slice(hex.length === 3 ? 2 : 4, hex.length === 3 ? 3 : 6)),
    16,
  );
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.55 ? "#000000" : "#ffffff";
}

export function formatCountdown(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;
  const pad = (value: number) => String(value).padStart(2, "0");

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

export function getLiveTextShadow(textColor: string): string | undefined {
  const normalized = textColor.toLowerCase();
  if (normalized === "#000000" || normalized === "black") {
    return undefined;
  }

  return "0 4px 12px rgba(0,0,0,0.8)";
}
