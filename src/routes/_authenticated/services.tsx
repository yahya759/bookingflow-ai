import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Scissors } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/hooks/use-business";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/services")({
  head: () => ({ meta: [{ title: "أنواع الكشف — بوكلي" }] }),
  component: ServicesPage,
});

interface Svc { id: string; name: string; price: number; duration_minutes: number; description: string | null; }

function ServicesPage() {
  const { business } = useBusiness();
  const [services, setServices] = useState<Svc[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Svc | null>(null);
  const [form, setForm] = useState({ name: "", price: "0", duration_minutes: "30", description: "" });

  const load = async () => {
    if (!business) return;
    const { data } = await supabase.from("services").select("*").eq("business_id", business.id).order("created_at");
    setServices((data ?? []) as Svc[]);
  };
  useEffect(() => { load(); }, [business?.id]);

  const openNew = () => { setEditing(null); setForm({ name: "", price: "0", duration_minutes: "30", description: "" }); setOpen(true); };
  const openEdit = (s: Svc) => { setEditing(s); setForm({ name: s.name, price: String(s.price), duration_minutes: String(s.duration_minutes), description: s.description ?? "" }); setOpen(true); };

  const save = async () => {
    if (!business || !form.name.trim()) return;
    const payload = {
      business_id: business.id,
      name: form.name.trim(),
      price: Number(form.price) || 0,
      duration_minutes: Number(form.duration_minutes) || 30,
      description: form.description || null,
    };
    const { error } = editing
      ? await supabase.from("services").update(payload).eq("id", editing.id)
      : await supabase.from("services").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(editing ? "تم تحديث النوع كشف" : "تم إضافة النوع كشف");
    setOpen(false); load();
  };

  const remove = async (id: string) => {
    if (!confirm("هل تريد حذف هذه النوع كشف؟")) return;
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("تم الحذف"); load();
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">أنواع الكشف</h1>
          <p className="mt-1 text-sm text-muted-foreground">أدر أنواع الكشف التي يمكن لعملائك حجزها.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew} className="bg-accent text-accent-foreground"><Plus className="h-4 w-4 ml-1"/>إضافة نوع كشف</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "تعديل النوع كشف" : "نوع كشف جديدة"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>الاسم</Label><Input value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})} className="mt-1.5"/></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>السعر (₪)</Label><Input type="number" value={form.price} onChange={(e)=>setForm({...form, price: e.target.value})} className="mt-1.5"/></div>
                <div><Label>المدة (دقيقة)</Label><Input type="number" value={form.duration_minutes} onChange={(e)=>setForm({...form, duration_minutes: e.target.value})} className="mt-1.5"/></div>
              </div>
              <div><Label>الوصف</Label><Textarea value={form.description} onChange={(e)=>setForm({...form, description: e.target.value})} className="mt-1.5"/></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={()=>setOpen(false)}>إلغاء</Button>
              <Button onClick={save} className="bg-accent text-accent-foreground">حفظ</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {services.length === 0 ? (
        <Card className="p-12 text-center">
          <Stethoscope className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">لا توجد أنواع كشف بعد. أضف أولى أنواع كشفك.</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <Card key={s.id} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{s.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{s.duration_minutes} دقيقة · {Number(s.price).toFixed(0)} ₪</p>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={()=>openEdit(s)}><Pencil className="h-3.5 w-3.5"/></Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={()=>remove(s.id)}><Trash2 className="h-3.5 w-3.5"/></Button>
                </div>
              </div>
              {s.description && <p className="mt-3 text-sm text-muted-foreground">{s.description}</p>}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
