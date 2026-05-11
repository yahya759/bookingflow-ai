import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login — Bookly" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { signIn, user } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (user) nav({ to: "/dashboard" }); }, [user, nav]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await signIn(email, password);
    setBusy(false);
    if (error) toast.error(error);
    else { toast.success("Welcome back"); nav({ to: "/dashboard" }); }
  };

  return (
    <div className="relative min-h-screen bg-background">
      <div className="absolute inset-0 bg-hero-glow" />
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
        <Link to="/" className="mx-auto mb-8 flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-accent-foreground"><Sparkles className="h-5 w-5"/></div>
          <span className="text-xl font-bold">Bookly</span>
        </Link>
        <Card className="glass p-8 shadow-elegant">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to your dashboard.</p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={password} onChange={(e)=>setPassword(e.target.value)} className="mt-1.5" />
            </div>
            <Button type="submit" disabled={busy} className="w-full bg-accent text-accent-foreground hover:opacity-90">
              {busy ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            New here? <Link to="/signup" className="text-accent hover:underline">Create an account</Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
