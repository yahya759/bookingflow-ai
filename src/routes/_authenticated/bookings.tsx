import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Phone, User as UserIcon, Calendar, CalendarCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/hooks/use-business";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/bookings")({
  head: () => ({ meta: [{ title: "الحجوزات — بوكلي" }] }),
  component: BookingsPage,
});

interface Booking {
  id: string; customer_name: string; customer_phone: string;
  booking_date: string; start_time: string; end_time: string; status: string;
  services: { name: string; price: number } | null;
  staff: { name: string } | null;
}

function BookingsPage() {
  const { business } = useBusiness();
  const [items, setItems] = useState<Booking[]>([]);

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
                <div className="flex items-center gap-2 text-base font-semibold"><UserIcon className="h-4 w-4 text-accent"/>{b.customer_name}</div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Phone className="h-3 w-3"/>{b.customer_phone}</span>
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3"/>{b.booking_date} الساعة {b.start_time?.slice(0,5)}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">الخدمة: </span>{b.services?.name ?? "—"}
                  <span className="mx-2 text-muted-foreground">·</span>
                  <span className="text-muted-foreground">الموظف: </span>{b.staff?.name ?? "أي موظف"}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  b.status === "confirmed" ? "bg-accent/10 text-accent" :
                  b.status === "completed" ? "bg-chart-3/10 text-chart-3" :
                  "bg-destructive/10 text-destructive"
                }`}>{statusLabel[b.status] ?? b.status}</span>
                <div className="flex gap-1">
                  {b.status !== "completed" && <Button size="sm" variant="outline" onClick={()=>setStatus(b.id,"completed")}>مكتمل</Button>}
                  {b.status !== "cancelled" && <Button size="sm" variant="ghost" onClick={()=>setStatus(b.id,"cancelled")}>إلغاء</Button>}
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
    </div>
  );
}
