import { ExternalLink, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";

export function Website() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Church Website</h1>
        <p className="text-muted-foreground mt-1">
          Quick access to your public church website.
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            ELG Church
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Open your website to share livestreams, updates, and church information.
          </p>
          <Button asChild>
            <a href="https://elgchurch.com" target="_blank" rel="noreferrer">
              Go to elgchurch.com
              <ExternalLink className="w-4 h-4 ml-2" />
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
