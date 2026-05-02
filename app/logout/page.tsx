import { Button } from "../../src/app/components/ui/button";
import { logout } from "../login/actions";

export default function LogoutPage() {
  return (
    <main
      className="bg-background flex items-center justify-center"
      style={{ minHeight: "100vh" }}
    >
      <form action={logout} className="space-y-4 text-center">
        <h1 className="text-xl font-semibold">Sign out</h1>
        <p className="text-sm text-muted-foreground">
          This calls a server action so no auth logic runs in the browser.
        </p>
        <Button type="submit">Logout</Button>
      </form>
    </main>
  );
}
