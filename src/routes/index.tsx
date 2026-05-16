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
      { title: "بوكلي — نظام حجز مواعيد ذكي لعيادتك" },
      { name: "description", content: "منصة لا-كود لبناء نظام حجز مواعيد لعيادتك. شارك رابطك مع عملائك واستقبل الحجوزات تلقائياً." },
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
          <span className="text-xl font-bold">بوكلي</span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground">المميزات</a>
          <a href="#how" className="text-sm text-muted-foreground hover:text-foreground">كيف يعمل</a>
          <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground">الأسعار</a>
        </nav>
        <div className="flex items-center gap-2">
          <a href="https://wa.me/970597741299?text=%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B4%D8%AA%D8%B1%D8%A7%D9%83%20%D9%81%D9%8A%20%D8%A8%D9%88%D9%83%D9%84%D9%8A" target="_blank"><Button variant="ghost" size="sm">تواصل معنا</Button></a>
          <a href="https://wa.me/970597741299?text=%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B4%D8%AA%D8%B1%D8%A7%D9%83%20%D9%81%D9%8A%20%D8%A8%D9%88%D9%83%D9%84%D9%8A" target="_blank"><Button size="sm" className="bg-accent text-accent-foreground hover:opacity-90">ابدأ الآن</Button></a>
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
          نظام حجز مواعيد للعيادات
        </div>
        <h1 className="text-4xl font-extrabold leading-tight md:text-6xl lg:text-7xl">
          أنشئ <span className="gradient-text">مساعد الحجز الذكي</span> الخاص بك
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
          صمّم نظام حجز مواعيد احترافي لعيادتك بدون أي برمجة. شارك رابطك مع مرضاك واستقبل الحجوزات تلقائياً.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a href="https://wa.me/970597741299?text=%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B4%D8%AA%D8%B1%D8%A7%D9%83%20%D9%81%D9%8A%20%D8%A8%D9%88%D9%83%D9%84%D9%8A" target="_blank">
            <Button size="lg" className="h-12 bg-accent px-8 text-base text-accent-foreground shadow-elegant hover:opacity-90">
              ابدأ الآن — واتساب
              <ArrowLeft className="mr-2 h-4 w-4 rtl:rotate-180" />
            </Button>
          </a>
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
  { icon: Users, title: "إدارة الأطباء", desc: "أضف أطباءك، حدد أوقات عملهم وأنواع الكشوفات التي يقدمونها." },
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
    { n: "01", t: "تواصل معنا", d: "راسلنا على واتساب وسنعدّ لك حسابك خلال دقائق." },
    { n: "02", t: "أضف أنواع الكشف وأطباءك", d: "حدد أنواع الكشف، التسعير، الأطباء وساعات العيادة." },
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
            {["إحصائيات مباشرة", "تقويم تفاعلي", "إدارة الأطباء والخدمات", "إعدادات قابلة للتخصيص"].map((x) => (
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
              {[{l:"المواعيد",v:"24"},{l:"الإيرادات",v:"$1.2k"},{l:"جديد",v:"8"}].map((s)=> (
                <div key={s.l} className="rounded-xl border border-border/60 p-4">
                  <div className="text-[10px] uppercase text-muted-foreground">{s.l}</div>
                  <div className="mt-1 text-xl font-bold">{s.v}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2">
              {["09:00 — كشف عام · د. أحمد","10:30 — استشارة · د. سارة","12:00 — متابعة · د. لينا"].map((b)=>(
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
                  <div className="text-sm font-semibold">مساعد الحجز</div>
                  <div className="text-[10px] text-accent">● Online</div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="max-w-[80%] rounded-2xl bg-secondary px-4 py-2">مرحباً! ما نوع الكشف المطلوب؟</div>
                <div className="ml-auto max-w-[80%] rounded-2xl bg-accent px-4 py-2 text-accent-foreground">كشف عام</div>
                <div className="max-w-[80%] rounded-2xl bg-secondary px-4 py-2">ممتاز. اختر الوقت المناسب:</div>
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
  const features = [
    "حجوزات غير محدودة",
    "موظفون غير محدودين",
    "رابط حجز خاص بعملك",
    "تخصيص كامل لخطوات الحجز",
    "لوحة تحكم احترافية",
    "إحصائيات وتقارير",
    "دعم على مدار الساعة",
    "تحديثات مجانية دائماً",
  ];
  return (
    <section id="pricing" className="mx-auto max-w-7xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold md:text-5xl">سعر واحد — كل شيء مشمول</h2>
        <p className="mt-4 text-muted-foreground">بدون خطط معقدة. ادفع وانتهى.</p>
      </div>
      <div className="mt-16 flex justify-center">
        <Card className="relative w-full max-w-md border-accent p-10 shadow-elegant text-center">
          <div className="absolute -top-4 right-1/2 translate-x-1/2 rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-accent-foreground">
            الخطة الوحيدة
          </div>
          <h3 className="text-2xl font-bold">الخطة الاحترافية</h3>
          <div className="mt-6 flex items-baseline justify-center gap-1">
            <span className="text-6xl font-extrabold gradient-text">100</span>
            <div className="text-right">
              <div className="text-lg font-semibold">ريال</div>
              <div className="text-sm text-muted-foreground">/شهرياً</div>
            </div>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">كل ما تحتاجه لإدارة حجوزاتك باحترافية.</p>
          <ul className="mt-8 space-y-3 text-sm text-right">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-3">
                <Check className="h-4 w-4 text-accent shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <a href="https://wa.me/970597741299?text=%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B4%D8%AA%D8%B1%D8%A7%D9%83%20%D9%81%D9%8A%20%D8%A8%D9%88%D9%83%D9%84%D9%8A" target="_blank" className="mt-10 block"><Button size="lg" className="w-full bg-accent text-accent-foreground hover:opacity-90 h-12 text-base">ابدأ الآن — واتساب</Button></a>
          <p className="mt-4 text-xs text-muted-foreground">لا توجد رسوم خفية · يمكن الإلغاء في أي وقت</p>
        </Card>
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
          <h2 className="text-3xl font-bold md:text-5xl">جاهز لتحديث نظام مواعيد عيادتك؟</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">انضم للعيادات التي تستخدم بوكلي لإدارة مواعيدها باحترافية.</p>
          <a href="https://wa.me/970597741299?text=%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B4%D8%AA%D8%B1%D8%A7%D9%83%20%D9%81%D9%8A%20%D8%A8%D9%88%D9%83%D9%84%D9%8A" target="_blank" className="mt-8 inline-block"><Button size="lg" className="h-12 bg-accent px-10 text-base text-accent-foreground hover:opacity-90">تواصل معنا على واتساب</Button></a>
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
          <span>© {new Date().getFullYear()} بوكلي. جميع الحقوق محفوظة.</span>
        </div>
        <div className="flex gap-6">
          <a href="#features" className="hover:text-foreground">المميزات</a>
          <a href="#pricing" className="hover:text-foreground">الأسعار</a>
        </div>
      </div>
    </footer>
  );
}
