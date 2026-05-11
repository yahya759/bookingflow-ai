import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/hooks/use-business";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/staff")({
  head: () => ({ meta: [{ title: "Staff — Bookly" }] }),
  component: StaffPage,
});

interface Stf { id: string; name: string; image_url: string | null; bio: string | null; }
interface Svc { id: string; name: string; }

function StaffPage() {
  const { business } = useBusiness();
  const [staff, setStaff] = useState<Stf[]>([]);
  const [services, setServices] = useState<Svc[]>([]);
  const [linked, setLinked] = useState<Record<string, string[]>>({});
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Stf | null>(null);
  const [form, setForm] = useState({ name: "", image_url: "", bio: "", services: [] as string[] });

  const load = async () => {
    if (!business) return;
    const [{ data: s }, { data: sv }, { data: ss }] = await Promise.all([
      supabase.from("staff").select("*").eq("business_id", business.id).order("created_at"),
      supabase.from("services").select("id,name").eq("business_id", business.id),
      supabase.from("staff_services").select("staff_id, service_id"),
    ]);
    setStaff((s ?? []) as Stf[]);
    setServices((sv ?? []) as Svc[]);
    const map: Record<string, string[]> = {};
    (ss ?? []).forEach((r: any) => { (map[r.staff_id] ||= []).push(r.service_id); });
    setLinked(map);
  };
  useEffect(() => { load(); }, [business?.id]);

  const openNew = () => { setEditing(null); setForm({ name: "", image_url: "", bio: "", services: [] }); setOpen(true); };
  const openEdit = (s: Stf) => { setEditing(s); setForm({ name: s.name, image_url: s.image_url ?? "", bio: s.bio ?? "", services: linked[s.id] ?? [] }); setOpen(true); };

  const save = async () => {
    if (!business || !form.name.trim()) return;
    const payload = { business_id: business.id, name: form.name.trim(), image_url: form.image_url || null, bio: form.bio || null };
    const { data, error } = editing
      ? await supabase.from("staff").update(payload).eq("id", editing.id).select().single()
      : await supabase.from("staff").insert(payload).select().single();
    if (error) return toast.error(error.message);
    const staffId = data.id;
    await supabase.from("staff_services").delete().eq("staff_id", staffId);
    if (form.services.length) {
      await supabase.from("staff_services").insert(form.services.map((sid) => ({ staff_id: staffId, service_id: sid })));
    }
    toast.success(editing ? "Staff updated" : "Staff added");
    setOpen(false); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this staff member?")) return;
    const { error } = await supabase.from("staff").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); load();
  };

  const toggleSvc = (id: string) => {
    setForm((f) => ({ ...f, services: f.services.includes(id) ? f.services.filter((x) => x !== id) : [...f.services, id] }));
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Staff</h1>
          <p className="mt-1 text-sm text-muted-foreground">Your team members.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button onClick={openNew} className="bg-accent text-accent-foreground"><Plus className="h-4 w-4 mr-1"/>Add staff</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit staff" : "New staff member"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Name</Label><Input value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})} className="mt-1.5"/></div>
              <div><Label>Photo URL</Label><Input value={form.image_url} onChange={(e)=>setForm({...form, image_url: e.target.value})} placeholder="https://..." className="mt-1.5"/></div>
              <div><Label>Bio</Label><Textarea value={form.bio} onChange={(e)=>setForm({...form, bio: e.target.value})} className="mt-1.5"/></div>
              <div>
                <Label>Assigned services</Label>
                <div className="mt-2 max-h-40 space-y-2 overflow-auto rounded-lg border border-border/60 p-3">
                  {services.length === 0 ? <p className="text-xs text-muted-foreground">Add services first.</p> :
                    services.map((sv) => (
                      <label key={sv.id} className="flex items-center gap-2 text-sm">
                        <Checkbox checked={form.services.includes(sv.id)} onCheckedChange={()=>toggleSvc(sv.id)}/>
                        {sv.name}
                      </label>
                    ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={()=>setOpen(false)}>Cancel</Button>
              <Button onClick={save} className="bg-accent text-accent-foreground">Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {staff.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="mx-auto h-10 w-10 text-muted-foreground"/>
          <p className="mt-3 text-sm text-muted-foreground">No staff yet.</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {staff.map((s) => (
            <Card key={s.id} className="p-5">
              <div className="flex items-start gap-3">
                {s.image_url
                  ? <img src={s.image_url} alt={s.name} className="h-12 w-12 rounded-full object-cover"/>
                  : <div className="grid h-12 w-12 place-items-center rounded-full bg-accent/10 text-accent font-semibold">{s.name.charAt(0)}</div>}
                <div className="flex-1">
                  <h3 className="font-semibold">{s.name}</h3>
                  <p className="text-xs text-muted-foreground">{(linked[s.id] ?? []).length} services</p>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={()=>openEdit(s)}><Pencil className="h-3.5 w-3.5"/></Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={()=>remove(s.id)}><Trash2 className="h-3.5 w-3.5"/></Button>
                </div>
              </div>
              {s.bio && <p className="mt-3 text-sm text-muted-foreground">{s.bio}</p>}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
