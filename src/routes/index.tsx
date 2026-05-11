import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Sparkles, Calendar, Users, Workflow, MessageSquare, ShieldCheck,
  ArrowLeft, Check, Bot, LayoutDashboard,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bookly — أنشئ مساعد الحجز الذكي الخاص بك" },
      { name: "description", content: "منصة لا-كود لبناء تجربة حجز مخصصة لصالونك أو عيادتك. شارك رابطك مع عملائك واستقبل الحجوزات تلقائياً." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground font-display">
      <Header />
      <Hero />
      <Features />
      <HowItWorks />
      <DashboardPreview />
      <AssistantPreview />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 glass">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-accent-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold">Bookly</span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground">المميزات</a>
          <a href="#how" className="text-sm text-muted-foreground hover:text-foreground">كيف يعمل</a>
          <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground">الأسعار</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/login"><Button variant="ghost" size="sm">تسجيل الدخول</Button></Link>
          <Link to="/signup"><Button size="sm" className="bg-accent text-accent-foreground hover:opacity-90">ابدأ مجاناً</Button></Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-hero-glow" />
      <div className="relative mx-auto max-w-5xl px-6 py-24 text-center md:py-32">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-4 py-1.5 text-xs text-muted-foreground glass">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          منصة بدون كود لإدارة الحجوزات
        </div>
        <h1 className="text-4xl font-extrabold leading-tight md:text-6xl lg:text-7xl">
          أنشئ <span className="gradient-text">مساعد الحجز الذكي</span> الخاص بك
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
          صمّم تجربة حجز مخصصة لصالونك أو عيادتك بدون أي برمجة. شارك رابطك مع عملائك واستقبل الحجوزات تلقائياً.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/signup">
            <Button size="lg" className="h-12 bg-accent px-8 text-base text-accent-foreground shadow-elegant hover:opacity-90">
              ابدأ تجربتك المجانية
              <ArrowLeft className="mr-2 h-4 w-4 rtl:rotate-180" />
            </Button>
          </Link>
          <a href="#how">
            <Button size="lg" variant="outline" className="h-12 px-8 text-base">
              شاهد كيف يعمل
            </Button>
          </a>
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2"><Check className="h-4 w-4 text-accent" /> بدون بطاقة ائتمانية</div>
          <div className="flex items-center gap-2"><Check className="h-4 w-4 text-accent" /> إعداد خلال دقائق</div>
          <div className="flex items-center gap-2"><Check className="h-4 w-4 text-accent" /> رابط حجز عام جاهز</div>
        </div>
      </div>
    </section>
  );
}

const features = [
  { icon: Workflow, title: "بنّاء تدفق مرئي", desc: "صمم رحلة الحجز خطوة بخطوة بسحب وإفلات بسيط." },
  { icon: Users, title: "إدارة الموظفين", desc: "أضف موظفيك، حدد أوقات عملهم والخدمات التي يقدمونها." },
  { icon: Calendar, title: "تقويم ذكي", desc: "إخفاء تلقائي للأوقات غير المتاحة ومنع الحجز المزدوج." },
  { icon: MessageSquare, title: "واجهة دردشة", desc: "تجربة حجز تفاعلية تشبه المساعد الذكي لعملائك." },
  { icon: LayoutDashboard, title: "لوحة تحكم احترافية", desc: "تحكم بكل الحجوزات والإحصائيات من مكان واحد." },
  { icon: ShieldCheck, title: "آمن وموثوق", desc: "بياناتك وحجوزات عملائك محمية بأعلى معايير الأمان." },
];

function Features() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold md:text-5xl">كل ما تحتاجه لإدارة الحجوزات</h2>
        <p className="mt-4 text-muted-foreground">أدوات قوية بواجهة بسيطة تجعل إدارة عملك متعة.</p>
      </div>
      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <Card key={f.title} className="glass p-6 transition hover:-translate-y-1 hover:shadow-elegant">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-accent/10 text-accent">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", t: "أنشئ حسابك", d: "سجّل خلال دقيقة وابدأ في إعداد عملك." },
    { n: "02", t: "أضف خدماتك وفريقك", d: "حدد الأسعار، المدة، الموظفين وساعات العمل." },
    { n: "03", t: "صمّم تدفق الحجز", d: "اختر الخطوات التي يمر بها عميلك بضغطة زر." },
    { n: "04", t: "شارك رابطك", d: "أرسل رابط الحجز لعملائك واستقبل الحجوزات." },
  ];
  return (
    <section id="how" className="border-y border-border/50 bg-secondary/30 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold md:text-5xl">كيف يعمل؟</h2>
          <p className="mt-4 text-muted-foreground">من الفكرة إلى أول حجز خلال دقائق.</p>
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.n} className="relative rounded-2xl border border-border/60 bg-card p-6 shadow-card">
              <div className="text-4xl font-bold gradient-text">{s.n}</div>
              <h3 className="mt-4 text-lg font-semibold">{s.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DashboardPreview() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-bold md:text-4xl">لوحة تحكم تمنحك السيطرة الكاملة</h2>
          <p className="mt-4 text-muted-foreground">
            تابع حجوزاتك القادمة، أرباحك اليومية، وأداء فريقك من شاشة واحدة أنيقة وبسيطة.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {["إحصائيات مباشرة", "تقويم تفاعلي", "إدارة الموظفين والخدمات", "إعدادات قابلة للتخصيص"].map((x) => (
              <li key={x} className="flex items-center gap-2"><Check className="h-4 w-4 text-accent" />{x}</li>
            ))}
          </ul>
        </div>
        <div className="glass rounded-3xl p-4 shadow-elegant" dir="ltr">
          <div className="rounded-2xl bg-background/60 p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-xs text-muted-foreground">Today</div>
              <div className="flex gap-2">
                <span className="h-2 w-2 rounded-full bg-destructive/60" />
                <span className="h-2 w-2 rounded-full bg-chart-4" />
                <span className="h-2 w-2 rounded-full bg-accent" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[{l:"Bookings",v:"24"},{l:"Revenue",v:"$1.2k"},{l:"New",v:"8"}].map((s)=> (
                <div key={s.l} className="rounded-xl border border-border/60 p-4">
                  <div className="text-[10px] uppercase text-muted-foreground">{s.l}</div>
                  <div className="mt-1 text-xl font-bold">{s.v}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2">
              {["09:00 — Haircut · Ahmed","10:30 — Color · Sara","12:00 — Massage · Lina"].map((b)=>(
                <div key={b} className="flex items-center justify-between rounded-xl bg-secondary/60 px-4 py-3 text-sm">
                  <span>{b}</span>
                  <span className="text-xs text-accent">Confirmed</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AssistantPreview() {
  return (
    <section className="border-y border-border/50 bg-secondary/30 py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2">
        <div className="order-2 lg:order-1">
          <div className="glass mx-auto max-w-md rounded-3xl p-4 shadow-elegant" dir="ltr">
            <div className="rounded-2xl bg-background/70 p-5">
              <div className="mb-4 flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-accent text-accent-foreground"><Bot className="h-4 w-4"/></div>
                <div>
                  <div className="text-sm font-semibold">Booking Assistant</div>
                  <div className="text-[10px] text-accent">● Online</div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="max-w-[80%] rounded-2xl bg-secondary px-4 py-2">Hi! Which service would you like to book?</div>
                <div className="ml-auto max-w-[80%] rounded-2xl bg-accent px-4 py-2 text-accent-foreground">Haircut</div>
                <div className="max-w-[80%] rounded-2xl bg-secondary px-4 py-2">Great. Pick a time:</div>
                <div className="ml-auto flex max-w-[80%] flex-wrap gap-1">
                  {["10:00","10:30","11:00"].map(t=> <span key={t} className="rounded-lg border border-accent/40 px-3 py-1 text-xs">{t}</span>)}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <h2 className="text-3xl font-bold md:text-4xl">واجهة حجز تشبه المساعد الذكي</h2>
          <p className="mt-4 text-muted-foreground">
            تجربة محادثة سلسة تأخذ عميلك خطوة بخطوة حتى يتم الحجز. تصميم عصري على جميع الأجهزة.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {["محادثة طبيعية وسهلة", "متجاوبة مع الجوال", "حجز فوري بدون تطبيقات", "قابلة للتخصيص بالكامل"].map((x) => (
              <li key={x} className="flex items-center gap-2"><Check className="h-4 w-4 text-accent" />{x}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const plans = [
    { name: "المبتدئ", price: "مجاناً", desc: "للبدء وتجربة المنصة", features: ["حتى 30 حجز/شهر", "موظف واحد", "رابط حجز عام", "دعم بالبريد"], highlighted: false },
    { name: "الاحترافي", price: "$29", suffix: "/شهر", desc: "للأعمال المتنامية", features: ["حجوزات غير محدودة", "حتى 10 موظفين", "تخصيص كامل للتدفق", "دعم على مدار الساعة"], highlighted: true },
    { name: "المؤسسات", price: "تواصل معنا", desc: "لسلاسل الفروع", features: ["كل مميزات الاحترافي", "فروع متعددة", "تكاملات مخصصة", "مدير حساب"], highlighted: false },
  ];
  return (
    <section id="pricing" className="mx-auto max-w-7xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold md:text-5xl">أسعار بسيطة وعادلة</h2>
        <p className="mt-4 text-muted-foreground">اختر الخطة التي تناسب حجم أعمالك.</p>
      </div>
      <div className="mt-16 grid gap-6 lg:grid-cols-3">
        {plans.map((p) => (
          <Card key={p.name} className={`relative p-8 ${p.highlighted ? "border-accent shadow-elegant" : "glass"}`}>
            {p.highlighted && (
              <div className="absolute -top-3 right-1/2 translate-x-1/2 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">الأكثر شعبية</div>
            )}
            <h3 className="text-lg font-semibold">{p.name}</h3>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-bold">{p.price}</span>
              {p.suffix && <span className="text-sm text-muted-foreground">{p.suffix}</span>}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
            <ul className="mt-6 space-y-2 text-sm">
              {p.features.map((f) => (
                <li key={f} className="flex items-center gap-2"><Check className="h-4 w-4 text-accent" />{f}</li>
              ))}
            </ul>
            <Link to="/signup" className="mt-8 block">
              <Button className={`w-full ${p.highlighted ? "bg-accent text-accent-foreground" : ""}`} variant={p.highlighted ? "default" : "outline"}>
                ابدأ الآن
              </Button>
            </Link>
          </Card>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card p-12 text-center shadow-elegant md:p-20">
        <div className="absolute inset-0 bg-hero-glow" />
        <div className="relative">
          <h2 className="text-3xl font-bold md:text-5xl">جاهز لتحويل طريقة استقبال الحجوزات؟</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">انضم لمئات الأعمال التي تستخدم Bookly لإدارة حجوزاتها بذكاء.</p>
          <Link to="/signup" className="mt-8 inline-block">
            <Button size="lg" className="h-12 bg-accent px-10 text-base text-accent-foreground hover:opacity-90">ابدأ مجاناً الآن</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/60 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-sm text-muted-foreground md:flex-row">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent" />
          <span>© {new Date().getFullYear()} Bookly. جميع الحقوق محفوظة.</span>
        </div>
        <div className="flex gap-6">
          <a href="#features" className="hover:text-foreground">المميزات</a>
          <a href="#pricing" className="hover:text-foreground">الأسعار</a>
        </div>
      </div>
    </footer>
  );
}
