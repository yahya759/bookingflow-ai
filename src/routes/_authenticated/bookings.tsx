import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Phone, User as UserIcon, Calendar, CalendarCheck, FileText, History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/hooks/use-business";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/bookings")({
  head: () => ({ meta: [{ title: "الحجوزات — بوكلي" }] }),
  component: BookingsPage,
});

interface Booking {
  id: string; customer_name: string; customer_phone: string;
  booking_date: string; start_time: string; end_time: string;
  status: string; notes: string | null;
  services: { name: string; price: number } | null;
  staff: { name: string } | null;
}

function BookingsPage() {
  const { business } = useBusiness();
  const [items, setItems] = useState<Booking[]>([]);

  // ملاحظات
  const [notesOpen, setNotesOpen] = useState(false);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [noteText, setNoteText] = useState("");
  const [notesBusy, setNotesBusy] = useState(false);

  // تاريخ المريض
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyPatient, setHistoryPatient] = useState<string>("");
  const [historyItems, setHistoryItems] = useState<Booking[]>([]);

  const load = async () => {
    if (!business) return;
    const { data } = await supabase
      .from("bookings")
      .select("*, services(name, price), staff(name)")
      .eq("business_id", business.id)
      .order("booking_date", { ascending: false })
      .order("start_time", { ascending: false });
    setItems((data ?? []) as any);
  };
  useEffect(() => { load(); }, [business?.id]);

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("تم التحديث"); load();
  };

  // فتح نافذة الملاحظات
  const openNotes = (b: Booking) => {
    setActiveBooking(b);
    setNoteText(b.notes ?? "");
    setNotesOpen(true);
  };

  // حفظ الملاحظة
  const saveNote = async () => {
    if (!activeBooking) return;
    setNotesBusy(true);
    const { error } = await supabase.from("bookings").update({ notes: noteText }).eq("id", activeBooking.id);
    setNotesBusy(false);
    if (error) return toast.error(error.message);
    toast.success("تم حفظ الملاحظة");
    setNotesOpen(false);
    load();
  };

  // فتح تاريخ المريض
  const openHistory = async (b: Booking) => {
    setHistoryPatient(b.customer_name);
    setHistoryOpen(true);
    const { data } = await supabase
      .from("bookings")
      .select("*, services(name, price), staff(name)")
      .eq("business_id", business!.id)
      .eq("customer_phone", b.customer_phone)
      .order("booking_date", { ascending: false });
    setHistoryItems((data ?? []) as any);
  };

  const statusLabel: Record<string, string> = { confirmed: "مؤكد", completed: "مكتمل", cancelled: "ملغي" };

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = items.filter((b) => b.booking_date >= today && b.status !== "cancelled" && b.status !== "completed");
  const completed = items.filter((b) => b.status === "completed" || (b.booking_date < today && b.status !== "cancelled"));
  const cancelled = items.filter((b) => b.status === "cancelled");

  const renderList = (list: Booking[]) =>
    list.length === 0 ? (
      <Card className="p-12 text-center">
        <CalendarCheck className="mx-auto h-10 w-10 text-muted-foreground"/>
        <p className="mt-3 text-sm text-muted-foreground">لا توجد حجوزات هنا.</p>
      </Card>
    ) : (
      <div className="space-y-3">
        {list.map((b) => (
          <Card key={b.id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-base font-semibold">
                  <UserIcon className="h-4 w-4 text-accent"/>{b.customer_name}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Phone className="h-3 w-3"/>{b.customer_phone}</span>
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3"/>{b.booking_date} الساعة {b.start_time?.slice(0,5)}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">الخدمة: </span>{b.services?.name ?? "—"}
                  <span className="mx-2 text-muted-foreground">·</span>
                  <span className="text-muted-foreground">الموظف: </span>{b.staff?.name ?? "أي موظف"}
                </div>
                {/* عرض الملاحظة إذا موجودة */}
                {b.notes && (
                  <div className="flex items-start gap-1.5 rounded-lg bg-accent/5 border border-accent/20 px-3 py-2 text-xs text-muted-foreground">
                    <FileText className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5"/>
                    <span>{b.notes}</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  b.status === "confirmed" ? "bg-accent/10 text-accent" :
                  b.status === "completed" ? "bg-chart-3/10 text-chart-3" :
                  "bg-destructive/10 text-destructive"
                }`}>{statusLabel[b.status] ?? b.status}</span>
                <div className="flex gap-1 flex-wrap justify-end">
                  {b.status !== "completed" && <Button size="sm" variant="outline" onClick={()=>setStatus(b.id,"completed")}>مكتمل</Button>}
                  {b.status !== "cancelled" && <Button size="sm" variant="ghost" onClick={()=>setStatus(b.id,"cancelled")}>إلغاء</Button>}
                  {/* زر الملاحظة */}
                  <Button size="sm" variant="ghost" className="text-accent" onClick={()=>openNotes(b)}>
                    <FileText className="h-3.5 w-3.5 ml-1"/>
                    {b.notes ? "تعديل ملاحظة" : "إضافة ملاحظة"}
                  </Button>
                  {/* زر التاريخ */}
                  <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={()=>openHistory(b)}>
                    <History className="h-3.5 w-3.5 ml-1"/>
                    السجل
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">الحجوزات</h1>
        <p className="mt-1 text-sm text-muted-foreground">جميع مواعيدك في مكان واحد.</p>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">القادمة ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="completed">المكتملة ({completed.length})</TabsTrigger>
          <TabsTrigger value="cancelled">الملغاة ({cancelled.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="mt-4">{renderList(upcoming)}</TabsContent>
        <TabsContent value="completed" className="mt-4">{renderList(completed)}</TabsContent>
        <TabsContent value="cancelled" className="mt-4">{renderList(cancelled)}</TabsContent>
      </Tabs>

      {/* نافذة الملاحظات */}
      <Dialog open={notesOpen} onOpenChange={setNotesOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-accent"/>
              ملاحظات على حجز {activeBooking?.customer_name}
            </DialogTitle>
          </DialogHeader>
          <div className="text-xs text-muted-foreground mb-2">
            هذه الملاحظات خاصة بك — لا يراها المريض.
          </div>
          <Textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="اكتب ملاحظاتك هنا... مثال: المريض يعاني من حساسية، جرعة الدواء، تعليمات المتابعة..."
            className="min-h-[140px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setNotesOpen(false)}>إلغاء</Button>
            <Button onClick={saveNote} disabled={notesBusy} className="bg-accent text-accent-foreground">
              {notesBusy ? "جارٍ الحفظ..." : "حفظ الملاحظة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* نافذة تاريخ المريض */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-4 w-4 text-accent"/>
              سجل زيارات {historyPatient}
            </DialogTitle>
          </DialogHeader>
          <div className="text-xs text-muted-foreground mb-3">
            إجمالي الزيارات: <span className="font-semibold text-accent">{historyItems.length}</span>
          </div>
          <div className="max-h-[400px] overflow-y-auto space-y-2">
            {historyItems.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">جارٍ التحميل...</p>
            ) : historyItems.map((b) => (
              <div key={b.id} className="rounded-lg border border-border/60 p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">{b.booking_date} الساعة {b.start_time?.slice(0,5)}</div>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${
                    b.status === "confirmed" ? "bg-accent/10 text-accent" :
                    b.status === "completed" ? "bg-chart-3/10 text-chart-3" :
                    "bg-destructive/10 text-destructive"
                  }`}>{statusLabel[b.status] ?? b.status}</span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {b.services?.name ?? "—"} · {b.staff?.name ?? "أي موظف"}
                </div>
                {b.notes && (
                  <div className="mt-2 flex items-start gap-1.5 rounded bg-accent/5 px-2 py-1.5 text-xs text-muted-foreground">
                    <FileText className="h-3 w-3 text-accent shrink-0 mt-0.5"/>
                    {b.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
