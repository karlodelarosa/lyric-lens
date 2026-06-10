import { HardDriveDownload } from "lucide-react";
import { Badge } from "./ui/badge";

export function OfflineSetlistBadge() {
  return (
    <Badge className="bg-emerald-600 text-white hover:bg-emerald-600 gap-1">
      <HardDriveDownload className="w-3 h-3" />
      Available offline
    </Badge>
  );
}
