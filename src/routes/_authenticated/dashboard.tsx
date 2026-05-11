import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarCheck, Users, Scissors, DollarSign, ExternalLink, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/hooks/use-business";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Bookly" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { business } = useBusiness();
  const [stats, setStats] = useState({ upcoming: 0, services: 0, staff: 0, revenue: 0 });
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    if (!business) return;
    (async () => {
      const today = new Date().toISOString().slice(0, 10);
      const [{ count: upcoming }, { count: svc }, { count: stf }, { data: rev }, { data: rec }] = await Promise.all([
        supabase.from("bookings").select("*", { count: "exact", head: true }).eq("business_id", business.id).gte("booking_date", today).neq("status", "cancelled"),
        supabase.from("services").select("*", { count: "exact", head: true }).eq("business_id", business.id),
        supabase.from("staff").select("*", { count: "exact", head: true }).eq("business_id", business.id),
        supabase.from("bookings").select("service_id, services(price)").eq("business_id", business.id).eq("status", "confirmed").gte("booking_date", today),
        supabase.from("bookings").select("*, services(name), staff(name)").eq("business_id", business.id).order("booking_date", { ascending: false }).order("start_time", { ascending: false }).limit(5),
      ]);
      const revenue = (rev as any[] | null)?.reduce((s, r) => s + (Number(r.services?.price) || 0), 0) ?? 0;
      setStats({ upcoming: upcoming ?? 0, services: svc ?? 0, staff: stf ?? 0, revenue });
      setRecent(rec ?? []);
    })();
  }, [business?.id]);

  const publicUrl = business ? `${typeof window !== "undefined" ? window.location.origin : ""}/booking/${business.slug}` : "";

  const copyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    toast.success("Booking link copied");
  };

  const cards = [
    { label: "Upcoming Bookings", value: stats.upcoming, icon: CalendarCheck, accent: true },
    { label: "Services", value: stats.services, icon: Scissors },
    { label: "Staff", value: stats.staff, icon: Users },
    { label: "Revenue (today+)", value: `$${stats.revenue.toFixed(0)}`, icon: DollarSign },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">Here's what's happening with your business.</p>
        </div>
        {business && (
          <Card className="glass flex items-center gap-2 px-4 py-2 text-sm">
            <span className="text-muted-foreground">Public link:</span>
            <code className="text-xs">/booking/{business.slug}</code>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={copyLink}><Copy className="h-3.5 w-3.5"/></Button>
            <a href={publicUrl} target="_blank" rel="noreferrer">
              <Button size="icon" variant="ghost" className="h-7 w-7"><ExternalLink className="h-3.5 w-3.5"/></Button>
            </a>
          </Card>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className={`p-5 ${c.accent ? "border-accent/50" : ""}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">{c.label}</span>
              <c.icon className={`h-4 w-4 ${c.accent ? "text-accent" : "text-muted-foreground"}`} />
            </div>
            <div className="mt-3 text-3xl font-bold">{c.value}</div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Recent bookings</h2>
          <Link to="/bookings"><Button variant="ghost" size="sm">View all</Button></Link>
        </div>
        {recent.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">No bookings yet. Share your booking link to get started.</p>
        ) : (
          <div className="divide-y divide-border/60">
            {recent.map((b) => (
              <div key={b.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <div className="font-medium">{b.customer_name}</div>
                  <div className="text-xs text-muted-foreground">{b.services?.name ?? "—"} · {b.staff?.name ?? "Any"}</div>
                </div>
                <div className="text-end text-xs">
                  <div>{b.booking_date} · {b.start_time?.slice(0,5)}</div>
                  <div className="text-accent">{b.status}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
