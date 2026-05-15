import { createFileRoute, useParams, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Bot, Sparkles, Send, Check, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/booking/$slug")({
  head: () => ({ meta: [{ title: "احجز موعدك" }] }),
  component: PublicBookingPage,
});

interface Biz { id: string; name: string; slug: string; welcome_message: string | null; confirmation_message: string | null; allow_staff_selection: boolean; }
interface Svc { id: string; name: string; price: number; duration_minutes: number; description: string | null; }
interface Stf { id: string; name: string; image_url: string | null; }
interface WH { day_of_week: number; open_time: string; close_time: string; break_start: string | null; break_end: string | null; is_closed: boolean; }
interface FlowStep { step_key: string; position: number; enabled: boolean; custom_label: string | null; }

// حجز واحد في السلة
interface BookingItem {
  id: string;
  service: Svc;
  staff: Stf | "any";
  date: Date;
  time: string;
}

const DEFAULT_MSGS: Record<string, string> = {
  service: "ما هي الخدمة التي تريد حجزها؟",
  staff: "مع من تريد الحجز؟",
  date: "اختر التاريخ المناسب لك.",
  time: "إليك الأوقات المتاحة:",
  info: "أوشكنا على الانتهاء — ما اسمك ورقم هاتفك؟",
  confirm: "تم تأكيد حجزك!",
};

type Msg = { from: "bot" | "user"; content: React.ReactNode; key: string };

function PublicBookingPage() {
  const { slug } = useParams({ from: "/booking/$slug" });
  const [biz, setBiz] = useState<Biz | null>(null);
  const [services, setServices] = useState<Svc[]>([]);
  const [staff, setStaff] = useState<Stf[]>([]);
  const [staffSvc, setStaffSvc] = useState<Record<string, string[]>>({});
  const [hours, setHours] = useState<WH[]>([]);
  const [flowSteps, setFlowSteps] = useState<FlowStep[]>([]);
  const [loading, setLoading] = useState(true);

  // الحجوزات المؤكدة في السلة
  const [cart, setCart] = useState<BookingItem[]>([]);

  // الخطوة الحالية
  const [step, setStep] = useState<"service" | "staff" | "date" | "time" | "info" | "done">("service");
  const [selService, setSelService] = useState<Svc | null>(null);
  const [selStaff, setSelStaff] = useState<Stf | "any" | null>(null);
  const [selDate, setSelDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const getLabel = (key: string) => {
    const s = flowSteps.find((f) => f.step_key === key);
    return s?.custom_label || DEFAULT_MSGS[key] || "";
  };

  useEffect(() => {
    (async () => {
      const { data: b } = await supabase.from("businesses").select("*").eq("slug", slug).maybeSingle();
      if (!b) { setLoading(false); return; }
      setBiz(b as Biz);
      const [{ data: s }, { data: st }, { data: ss }, { data: wh }, { data: fs }] = await Promise.all([
        supabase.from("services").select("*").eq("business_id", b.id).order("created_at"),
        supabase.from("staff").select("id,name,image_url").eq("business_id", b.id),
        supabase.from("staff_services").select("staff_id, service_id"),
        supabase.from("working_hours").select("*").eq("business_id", b.id),
        supabase.from("flow_steps").select("step_key,position,enabled,custom_label").eq("business_id", b.id).order("position"),
      ]);
      setServices((s ?? []) as Svc[]);
      setStaff((st ?? []) as Stf[]);
      const map: Record<string, string[]> = {};
      (ss ?? []).forEach((r: any) => { (map[r.staff_id] ||= []).push(r.service_id); });
      setStaffSvc(map);
      setHours((wh ?? []) as WH[]);
      setFlowSteps((fs ?? []) as FlowStep[]);
      setLoading(false);
      const welcomeStep = (fs ?? []).find((f: any) => f.step_key === "welcome");
      const welcomeMsg = b.welcome_message || welcomeStep?.custom_label || `مرحباً في ${b.name}! دعنا نحجز موعدك.`;
      setMsgs([{ from: "bot", key: "hello", content: welcomeMsg }]);
    })();
  }, [slug]);

  useEffect(() => { scrollRef.current?.scrollTo({ top: 9e9, behavior: "smooth" }); }, [msgs, slots, step, cart]);

  const addBot = (content: React.ReactNode, key: string) =>
    setMsgs((m) => [...m, { from: "bot", content, key }]);
  const addUser = (content: React.ReactNode, key: string) =>
    setMsgs((m) => [...m, { from: "user", content, key }]);

  const eligibleStaff = useMemo(() =>
    selService ? staff.filter((s) => (staffSvc[s.id] ?? []).includes(selService.id)) : staff,
    [selService, staff, staffSvc]);

  // إعادة البدء لحجز جديد
  const startNewBooking = () => {
    setSelService(null);
    setSelStaff(null);
    setSelDate(null);
    setSlots([]);
    const key = `b-newbooking-${Date.now()}`;
    addBot(getLabel("service"), key);
    setStep("service");
  };

  const pickService = (s: Svc) => {
    setSelService(s);
    addUser(s.name, `u-svc-${s.id}-${Date.now()}`);
    if (biz?.allow_staff_selection && staff.length > 0) {
      addBot(getLabel("staff"), `b-staff-${Date.now()}`);
      setStep("staff");
    } else {
      setSelStaff("any");
      addBot(getLabel("date"), `b-date-${Date.now()}`);
      setStep("date");
    }
  };

  const pickStaff = (s: Stf | "any") => {
    setSelStaff(s);
    addUser(s === "any" ? "أي طبيب متاح" : s.name, `u-stf-${Date.now()}`);
    addBot(getLabel("date"), `b-date-${Date.now()}`);
    setStep("date");
  };

  const pickDate = async (d: Date | undefined) => {
    if (!d || !selService || !biz) return;
    setSelDate(d);
    addUser(format(d, "PPP"), `u-date-${d.toISOString()}`);
    const dow = d.getDay();
    const wh = hours.find((h) => h.day_of_week === dow);
    if (!wh || wh.is_closed) {
      addBot("عذراً، نحن مغلقون هذا اليوم. اختر تاريخاً آخر.", `b-closed-${dow}-${Date.now()}`);
      return;
    }
    const dateStr = format(d, "yyyy-MM-dd");
    const staffFilter = selStaff && selStaff !== "any" ? selStaff.id : null;

    // احجز الأوقات الموجودة في DB + الأوقات المحجوزة في السلة الحالية
    const { data: existing } = await supabase
      .from("bookings")
      .select("start_time,end_time,staff_id")
      .eq("business_id", biz.id)
      .eq("booking_date", dateStr)
      .eq("status", "confirmed");

    // أضف حجوزات السلة كـ "محجوزة" لنفس التاريخ والطبيب
    const cartBooked = cart
      .filter((c) => format(c.date, "yyyy-MM-dd") === dateStr)
      .map((c) => ({
        start_time: c.time,
        end_time: addMinutes(c.time, c.service.duration_minutes),
        staff_id: c.staff !== "any" ? (c.staff as Stf).id : null,
      }));

    const allBooked = [...(existing ?? []), ...cartBooked] as any;

    let computed: string[];
    if (staffFilter) {
      // طبيب محدد — اعرض فقط الأوقات اللي هو فاضي فيها
      computed = computeSlots(wh, selService.duration_minutes, allBooked, staffFilter, d);
    } else {
      // أي طبيب — اعرض الأوقات اللي فيها على الأقل طبيب واحد فاضي
      const eligible = eligibleStaff.length > 0 ? eligibleStaff : staff;
      if (eligible.length === 0) {
        computed = computeSlots(wh, selService.duration_minutes, allBooked, null, d);
      } else {
        const allSlots = new Set<string>();
        for (const stf of eligible) {
          const stfSlots = computeSlots(wh, selService.duration_minutes, allBooked, stf.id, d);
          stfSlots.forEach((s) => allSlots.add(s));
        }
        computed = Array.from(allSlots).sort();
      }
    }
    setSlots(computed);
    if (computed.length === 0) {
      addBot("لا توجد أوقات متاحة هذا اليوم. جرب تاريخاً آخر.", `b-noslot-${dateStr}`);
    } else {
      addBot(getLabel("time"), `b-time-${dateStr}`);
      setStep("time");
    }
  };

  const pickTime = (t: string) => {
    if (!selService || !selDate || !selStaff) return;
    // أضف للسلة
    const item: BookingItem = {
      id: Date.now().toString(),
      service: selService,
      staff: selStaff,
      date: selDate,
      time: t,
    };
    setCart((c) => [...c, item]);
    addUser(t, `u-time-${t}-${Date.now()}`);
    addBot(
      <div className="space-y-2">
        <div>✅ تمت إضافة الموعد إلى سلتك.</div>
        <div className="text-xs text-muted-foreground">{selService.name} · {format(selDate, "PPP")} الساعة {t}</div>
        <div className="mt-2 font-medium">هل تريد إضافة حجز آخر؟</div>
      </div>,
      `b-added-${Date.now()}`
    );
    setStep("info");
  };

  const removeFromCart = (id: string) => {
    setCart((c) => c.filter((x) => x.id !== id));
  };

  const submit = async () => {
    if (!biz || !name.trim() || !phone.trim()) {
      toast.error("يرجى إدخال اسمك ورقم هاتفك");
      return;
    }
    if (cart.length === 0) {
      toast.error("لا يوجد حجز في السلة");
      return;
    }

    const inserts = cart.map((item) => ({
      business_id: biz.id,
      service_id: item.service.id,
      staff_id: item.staff !== "any" ? (item.staff as Stf).id : null,
      customer_name: name.trim(),
      customer_phone: phone.trim(),
      booking_date: format(item.date, "yyyy-MM-dd"),
      start_time: item.time,
      end_time: addMinutes(item.time, item.service.duration_minutes),
      status: "confirmed",
    }));

    const { error } = await supabase.from("bookings").insert(inserts);
    if (error) return toast.error(error.message);

    addUser(`${name} · ${phone}`, "u-info");
    const confirmMsg = biz.confirmation_message || getLabel("confirm");
    addBot(confirmMsg, "b-done");
    setStep("done");
  };

  if (loading) return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">جارٍ التحميل...</div>;
  if (!biz) throw notFound();

  return (
    <div className="relative min-h-screen bg-background" dir="rtl">
      <div className="absolute inset-0 bg-hero-glow" />
      <div className="relative mx-auto flex min-h-screen max-w-2xl flex-col px-4 py-8">
        <div className="mb-4 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-accent-foreground"><Sparkles className="h-5 w-5"/></div>
          <div>
            <div className="font-semibold">{biz.name}</div>
            <div className="text-xs text-accent">● مساعد الحجز</div>
          </div>
        </div>

        {/* سلة الحجوزات */}
        {cart.length > 0 && (
          <Card className="mb-3 p-3 border-accent/30 bg-accent/5">
            <div className="mb-2 text-sm font-semibold text-accent">🛒 سلة الحجوزات ({cart.length})</div>
            <div className="space-y-2">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs bg-background rounded-lg px-3 py-2">
                  <div>
                    <span className="font-medium">{item.service.name}</span>
                    <span className="text-muted-foreground"> · {format(item.date, "PPP")} الساعة {item.time}</span>
                    {item.staff !== "any" && <span className="text-muted-foreground"> · {(item.staff as Stf).name}</span>}
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-destructive hover:opacity-70">
                    <Trash2 className="h-3.5 w-3.5"/>
                  </button>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card className="glass flex flex-1 flex-col overflow-hidden shadow-elegant">
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-5">
            {msgs.map((m) => (
              <div key={m.key} className={`flex ${m.from === "user" ? "justify-start" : "justify-end"}`}>
                {m.from === "bot" && <div className="ml-2 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent/15 text-accent"><Bot className="h-3.5 w-3.5"/></div>}
                <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm ${m.from === "user" ? "bg-accent text-accent-foreground" : "bg-secondary"}`}>
                  {m.content}
                </div>
              </div>
            ))}

            {step === "service" && services.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {services.map((s) => (
                  <button key={s.id} onClick={() => pickService(s)} className="rounded-2xl border border-border/70 bg-card/60 px-4 py-3 text-right text-sm transition hover:-translate-y-0.5 hover:border-accent">
                    <div className="font-medium">{s.name}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{s.duration_minutes} دقيقة · {Number(s.price).toFixed(0)} ₪</div>
                  </button>
                ))}
              </div>
            )}

            {step === "staff" && (
              <div className="flex flex-wrap gap-2 pt-1">
                <button onClick={() => pickStaff("any")} className="rounded-2xl border border-border/70 bg-card/60 px-4 py-3 text-sm hover:border-accent">أي طبيب متاح</button>
                {eligibleStaff.map((s) => (
                  <button key={s.id} onClick={() => pickStaff(s)} className="flex items-center gap-2 rounded-2xl border border-border/70 bg-card/60 px-4 py-3 text-sm hover:border-accent">
                    {s.image_url ? <img src={s.image_url} className="h-6 w-6 rounded-full object-cover" alt=""/> : <div className="grid h-6 w-6 place-items-center rounded-full bg-accent/15 text-[10px] text-accent">{s.name.charAt(0)}</div>}
                    {s.name}
                  </button>
                ))}
              </div>
            )}

            {step === "date" && (
              <div className="rounded-2xl border border-border/70 bg-card/60 p-2">
                <Calendar mode="single" selected={selDate ?? undefined} onSelect={pickDate}
                  disabled={(d) => d < new Date(new Date().toDateString())}
                  className="p-3 pointer-events-auto"/>
              </div>
            )}

            {step === "time" && (
              <div className="flex flex-wrap gap-2 pt-1">
                {slots.map((t) => (
                  <button key={t} onClick={() => pickTime(t)} className="rounded-xl border border-accent/40 bg-card/60 px-3 py-2.5 text-sm hover:bg-accent hover:text-accent-foreground transition flex flex-col items-center gap-0.5">
                    <span className="font-semibold">{t}</span>
                    <span className="text-xs opacity-70">{addMinutes(t, selService!.duration_minutes)}</span>
                  </button>
                ))}
              </div>
            )}

            {step === "info" && (
              <div className="space-y-3 rounded-2xl border border-border/70 bg-card/60 p-4">
                {/* زر إضافة حجز آخر */}
                <button
                  onClick={startNewBooking}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-accent/40 px-4 py-2.5 text-sm text-accent hover:bg-accent/10 transition"
                >
                  <Plus className="h-4 w-4"/> إضافة حجز آخر
                </button>
                <div className="border-t border-border/40 pt-3">
                  <p className="mb-2 text-xs text-muted-foreground">{getLabel("info")}</p>
                  <Input placeholder="اسمك" value={name} onChange={(e) => setName(e.target.value)} className="mb-2"/>
                  <Input placeholder="رقم الهاتف" value={phone} onChange={(e) => setPhone(e.target.value)} className="mb-3"/>
                  <Button onClick={submit} className="w-full bg-accent text-accent-foreground">
                    <Send className="h-4 w-4 ml-1"/>تأكيد {cart.length > 1 ? `${cart.length} حجوزات` : "الحجز"}
                  </Button>
                </div>
              </div>
            )}

            {step === "done" && (
              <div className="rounded-2xl border border-accent/40 bg-accent/10 p-4 text-sm space-y-2">
                <div className="flex items-center gap-2 font-semibold"><Check className="h-4 w-4 text-accent"/>تم تأكيد الحجز</div>
                {cart.map((item) => (
                  <div key={item.id} className="text-muted-foreground text-xs">
                    {item.service.name} · {format(item.date, "PPP")} الساعة {item.time}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        <div className="mt-4 text-center text-xs text-muted-foreground">
          مدعوم بـ <span className="font-semibold text-foreground">بوكلي</span>
        </div>
      </div>
    </div>
  );
}

// إضافة دقائق على وقت بصيغة HH:MM
function addMinutes(time: string, mins: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + mins;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function computeSlots(
  wh: WH,
  durationMin: number,
  existing: { start_time: string; end_time: string; staff_id: string | null }[],
  staffFilter: string | null,
  selectedDate: Date
): string[] {
  const toMin = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
  const fmt = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
  const open = toMin(wh.open_time), close = toMin(wh.close_time);
  const bs = wh.break_start ? toMin(wh.break_start) : null;
  const be = wh.break_end ? toMin(wh.break_end) : null;
  const taken = existing
    .filter((e) => staffFilter != null ? e.staff_id === staffFilter : false)
    .map((e) => [toMin(e.start_time), toMin(e.end_time)] as [number, number]);

  // احسب الوقت الحالي بالدقائق إذا كان التاريخ هو اليوم
  const now = new Date();
  const isToday =
    selectedDate.getFullYear() === now.getFullYear() &&
    selectedDate.getMonth() === now.getMonth() &&
    selectedDate.getDate() === now.getDate();
  // أضف 30 دقيقة buffer للوقت الحالي
  const nowMin = isToday ? now.getHours() * 60 + now.getMinutes() + 30 : 0;

  const slots: string[] = [];
  for (let t = open; t + durationMin <= close; t += 30) {
    const end = t + durationMin;
    if (isToday && t < nowMin) continue; // ← فلتر الأوقات اللي فاتت
    if (bs != null && be != null && t < be && end > bs) continue;
    if (taken.some(([s, e]) => t < e && end > s)) continue;
    slots.push(fmt(t));
  }
  return slots;
}
