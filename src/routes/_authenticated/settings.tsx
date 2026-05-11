import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Copy, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/hooks/use-business";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — Bookly" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { business, refresh } = useBusiness();
  const [form, setForm] = useState({
    name: "", slug: "", description: "", welcome_message: "",
    confirmation_message: "", allow_staff_selection: true, instant_confirmation: true,
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!business) return;
    setForm({
      name: business.name,
      slug: business.slug,
      description: business.description ?? "",
      welcome_message: business.welcome_message ?? "",
      confirmation_message: business.confirmation_message ?? "",
      allow_staff_selection: business.allow_staff_selection,
      instant_confirmation: business.instant_confirmation,
    });
  }, [business?.id]);

  const save = async () => {
    if (!business) return;
    setBusy(true);
    const slug = form.slug.toLowerCase().replace(/[^a-z0-9-]+/g, "-");
    const { error } = await supabase.from("businesses").update({
      name: form.name,
      slug,
      description: form.description || null,
      welcome_message: form.welcome_message || null,
      confirmation_message: form.confirmation_message || null,
      allow_staff_selection: form.allow_staff_selection,
      instant_confirmation: form.instant_confirmation,
    }).eq("id", business.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Settings saved");
    refresh();
  };

  const publicUrl = business ? `${typeof window !== "undefined" ? window.location.origin : ""}/booking/${business.slug}` : "";
  const copy = () => { navigator.clipboard.writeText(publicUrl); toast.success("Link copied"); };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Business details and booking behavior.</p>
      </div>

      <Card className="p-6">
        <h2 className="font-semibold">Public booking link</h2>
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-border/60 bg-secondary/40 p-2 text-sm">
          <code className="flex-1 truncate px-2">{publicUrl}</code>
          <Button size="sm" variant="ghost" onClick={copy}><Copy className="h-3.5 w-3.5 mr-1"/>Copy</Button>
          <a href={publicUrl} target="_blank" rel="noreferrer"><Button size="sm" variant="ghost"><ExternalLink className="h-3.5 w-3.5 mr-1"/>Open</Button></a>
        </div>
      </Card>

      <Card className="space-y-4 p-6">
        <h2 className="font-semibold">Business</h2>
        <div><Label>Business name</Label><Input className="mt-1.5" value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})}/></div>
        <div><Label>URL slug</Label><Input className="mt-1.5" value={form.slug} onChange={(e)=>setForm({...form, slug: e.target.value})}/></div>
        <div><Label>Description</Label><Textarea className="mt-1.5" value={form.description} onChange={(e)=>setForm({...form, description: e.target.value})}/></div>
      </Card>

      <Card className="space-y-4 p-6">
        <h2 className="font-semibold">Booking flow</h2>
        <div><Label>Welcome message</Label><Textarea className="mt-1.5" value={form.welcome_message} onChange={(e)=>setForm({...form, welcome_message: e.target.value})}/></div>
        <div><Label>Confirmation message</Label><Textarea className="mt-1.5" value={form.confirmation_message} onChange={(e)=>setForm({...form, confirmation_message: e.target.value})}/></div>
        <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
          <div><div className="text-sm font-medium">Allow staff selection</div><div className="text-xs text-muted-foreground">Customers can pick a specific staff member.</div></div>
          <Switch checked={form.allow_staff_selection} onCheckedChange={(v)=>setForm({...form, allow_staff_selection: v})}/>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
          <div><div className="text-sm font-medium">Instant confirmation</div><div className="text-xs text-muted-foreground">Auto-confirm bookings immediately.</div></div>
          <Switch checked={form.instant_confirmation} onCheckedChange={(v)=>setForm({...form, instant_confirmation: v})}/>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save} disabled={busy} className="bg-accent text-accent-foreground">{busy ? "Saving..." : "Save changes"}</Button>
      </div>
    </div>
  );
}
