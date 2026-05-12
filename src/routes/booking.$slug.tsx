import { createFileRoute, useParams, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Bot, Sparkles, Send, Check } from "lucide-react";
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

// الرسائل الافتراضية لكل خطوة
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

  const [step, setStep] = useState<"service" | "staff" | "date" | "time" | "info" | "done">("service");
  const [selService, setSelService] = useState<Svc | null>(null);
  const [selStaff, setSelStaff] = useState<Stf | "any" | null>(null);
  const [selDate, setSelDate] = useState<Date | null>(null);
  const [selTime, setSelTime] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // جيب الـ label من flow_steps أو استخدم الافتراضي
  const getLabel = (key: string) => {
    const step = flowSteps.find((s) => s.step_key === key);
    return step?.custom_label || DEFAULT_MSGS[key] || "";
  };

  // جيب label زر "أي موظف" من flow_steps لخطوة staff
  const anyStaffLabel = () => {
    const step = flowSteps.find((s) => s.step_key === "staff");
    return step?.custom_label ? `أي ${step.custom_label}` : "أي موظف متاح";
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
      const map: Record<string,string[]> = {};
      (ss ?? []).forEach((r:any)=>{ (map[r.staff_id] ||= []).push(r.service_id); });
      setStaffSvc(map);
      setHours((wh ?? []) as WH[]);
      setFlowSteps((fs ?? []) as FlowStep[]);
      setLoading(false);

      // رسالة الترحيب من الإعدادات أو من flow_steps
      const welcomeStep = (fs ?? []).find((f: any) => f.step_key === "welcome");
      const welcomeMsg = b.welcome_message || welcomeStep?.custom_label || `مرحباً في ${b.name}! دعنا نحجز موعدك.`;
      setMsgs([{ from: "bot", key: "hello", content: welcomeMsg }]);
    })();
  }, [slug]);

  useEffect(() => { scrollRef.current?.scrollTo({ top: 9e9, behavior: "smooth" }); }, [msgs, slots, step]);

  const addBot = (content: React.ReactNode, key: string) => setMsgs((m) => [...m, { from: "bot", content, key }]);
  const addUser = (content: React.ReactNode, key: string) => setMsgs((m) => [...m, { from: "user", content, key }]);

  const eligibleStaff = useMemo(() => selService
    ? staff.filter((s) => (staffSvc[s.id] ?? []).includes(selService.id))
    : staff, [selService, staff, staffSvc]);

  const pickService = (s: Svc) => {
    setSelService(s);
    addUser(s.name, `u-svc-${s.id}`);
    if (biz?.allow_staff_selection && staff.length > 0) {
      addBot(getLabel("staff"), "b-staff");
      setStep("staff");
    } else {
      addBot(getLabel("date"), "b-date");
      setStep("date");
    }
  };

  const pickStaff = (s: Stf | "any") => {
    setSelStaff(s);
    addUser(s === "any" ? anyStaffLabel() : s.name, `u-stf-${s === "any" ? "any" : s.id}`);
    addBot(getLabel("date"), "b-date");
    setStep("date");
  };

  const pickDate = async (d: Date | undefined) => {
    if (!d || !selService || !biz) return;
    setSelDate(d);
    addUser(format(d, "PPP"), `u-date-${d.toISOString()}`);
    const dow = d.getDay();
    const wh = hours.find((h) => h.day_of_week === dow);
    if (!wh || wh.is_closed) {
      addBot("عذراً، نحن مغلقون هذا اليوم. اختر تاريخاً آخر.", `b-closed-${dow}`);
      return;
    }
    const dateStr = format(d, "yyyy-MM-dd");
    const staffFilter = selStaff && selStaff !== "any" ? selStaff.id : null;
    let q = supabase.from("bookings").select("start_time,end_time,staff_id")
      .eq("business_id", biz.id).eq("booking_date", dateStr).eq("status", "confirmed");
    const { data: existing } = await q;
    const computed = computeSlots(wh, selService.duration_minutes, (existing ?? []) as any, staffFilter);
    setSlots(computed);
    if (computed.length === 0) {
      addBot("لا توجد أوقات متاحة هذا اليوم. جرب تاريخاً آخر.", `b-noslot-${dateStr}`);
    } else {
      addBot(getLabel("time"), `b-time-${dateStr}`);
      setStep("time");
    }
  };

  const pickTime = (t: string) => {
    setSelTime(t);
    addUser(t, `u-time-${t}`);
    addBot(getLabel("info"), "b-info");
    setStep("info");
  };

  const submit = async () => {
    if (!biz || !selService || !selDate || !selTime || !name.trim() || !phone.trim()) {
      toast.error("يرجى إدخال اسمك ورقم هاتفك");
      return;
    }
    const [h, m] = selTime.split(":").map(Number);
    const endMin = h * 60 + m + selService.duration_minutes;
    const endTime = `${String(Math.floor(endMin / 60)).padStart(2, "0")}:${String(endMin % 60).padStart(2, "0")}`;
    const { error } = await supabase.from("bookings").insert({
      business_id: biz.id,
      service_id: selService.id,
      staff_id: selStaff && selStaff !== "any" ? selStaff.id : null,
      customer_name: name.trim(),
      customer_phone: phone.trim(),
      booking_date: format(selDate, "yyyy-MM-dd"),
      start_time: selTime,
      end_time: endTime,
      status: "confirmed",
    });
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
                  <button key={s.id} onClick={()=>pickService(s)} className="rounded-2xl border border-border/70 bg-card/60 px-4 py-3 text-right text-sm transition hover:-translate-y-0.5 hover:border-accent">
                    <div className="font-medium">{s.name}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{s.duration_minutes} دقيقة · {Number(s.price).toFixed(0)} ₪</div>
                  </button>
                ))}
              </div>
            )}

            {step === "staff" && (
              <div className="flex flex-wrap gap-2 pt-1">
                <button onClick={()=>pickStaff("any")} className="rounded-2xl border border-border/70 bg-card/60 px-4 py-3 text-sm hover:border-accent">أي موظف متاح</button>
                {eligibleStaff.map((s) => (
                  <button key={s.id} onClick={()=>pickStaff(s)} className="flex items-center gap-2 rounded-2xl border border-border/70 bg-card/60 px-4 py-3 text-sm hover:border-accent">
                    {s.image_url ? <img src={s.image_url} className="h-6 w-6 rounded-full object-cover" alt=""/> : <div className="grid h-6 w-6 place-items-center rounded-full bg-accent/15 text-[10px] text-accent">{s.name.charAt(0)}</div>}
                    {s.name}
                  </button>
                ))}
              </div>
            )}

            {step === "date" && (
              <div className="rounded-2xl border border-border/70 bg-card/60 p-2">
                <Calendar mode="single" selected={selDate ?? undefined} onSelect={pickDate}
                  disabled={(d)=> d < new Date(new Date().toDateString())}
                  className="p-3 pointer-events-auto"/>
              </div>
            )}

            {step === "time" && (
              <div className="flex flex-wrap gap-2 pt-1">
                {slots.map((t) => (
                  <button key={t} onClick={()=>pickTime(t)} className="rounded-xl border border-accent/40 bg-card/60 px-3.5 py-2 text-sm hover:bg-accent hover:text-accent-foreground">{t}</button>
                ))}
              </div>
            )}

            {step === "info" && (
              <div className="space-y-2 rounded-2xl border border-border/70 bg-card/60 p-4">
                <Input placeholder="اسمك" value={name} onChange={(e)=>setName(e.target.value)}/>
                <Input placeholder="رقم الهاتف" value={phone} onChange={(e)=>setPhone(e.target.value)}/>
                <Button onClick={submit} className="w-full bg-accent text-accent-foreground"><Send className="h-4 w-4 ml-1"/>تأكيد الحجز</Button>
              </div>
            )}

            {step === "done" && (
              <div className="rounded-2xl border border-accent/40 bg-accent/10 p-4 text-sm">
                <div className="flex items-center gap-2 font-semibold"><Check className="h-4 w-4 text-accent"/>تم تأكيد الحجز</div>
                <div className="mt-2 text-muted-foreground">
                  {selService?.name} · {selDate && format(selDate, "PPP")} الساعة {selTime}
                </div>
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

function computeSlots(wh: WH, durationMin: number, existing: { start_time: string; end_time: string; staff_id: string | null }[], staffFilter: string | null): string[] {
  const toMin = (t: string) => { const [h,m] = t.split(":").map(Number); return h*60+m; };
  const fmt = (m: number) => `${String(Math.floor(m/60)).padStart(2,"0")}:${String(m%60).padStart(2,"0")}`;
  const open = toMin(wh.open_time), close = toMin(wh.close_time);
  const bs = wh.break_start ? toMin(wh.break_start) : null;
  const be = wh.break_end ? toMin(wh.break_end) : null;
  const taken = existing
    .filter((e) => staffFilter == null ? true : e.staff_id === staffFilter)
    .map((e) => [toMin(e.start_time), toMin(e.end_time)] as [number, number]);
  const slots: string[] = [];
  for (let t = open; t + durationMin <= close; t += 30) {
    const end = t + durationMin;
    if (bs != null && be != null && t < be && end > bs) continue;
    if (taken.some(([s,e]) => t < e && end > s)) continue;
    slots.push(fmt(t));
  }
  return slots;
}
