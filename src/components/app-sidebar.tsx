import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Stethoscope, Users, Clock, Workflow,
  CalendarCheck, Settings, Sparkles, LogOut, Sun, Moon, Menu, X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/routes/__root";

const items = [
  { title: "لوحة التحكم", url: "/dashboard", icon: LayoutDashboard },
  { title: "أنواع الكشف", url: "/services", icon: Stethoscope },
  { title: "الأطباء", url: "/staff", icon: Users },
  { title: "ساعات العمل", url: "/hours", icon: Clock },
  { title: "منشئ الخطوات", url: "/flow", icon: Workflow },
  { title: "الحجوزات", url: "/bookings", icon: CalendarCheck },
  { title: "الإعدادات", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { signOut, user } = useAuth();
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(true);

  return (
    <>
      {/* Desktop Sidebar - ثابت على اليمين */}
      <aside className={`hidden md:flex flex-col fixed top-0 right-0 h-screen bg-sidebar border-l border-border z-20 transition-all duration-200 ${open ? "w-64" : "w-14"}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-4 border-b border-border">
          {open && (
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-accent-foreground shrink-0">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-base font-bold">بوكلي</span>
            </Link>
          )}
          {!open && (
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-accent-foreground mx-auto">
              <Sparkles className="h-4 w-4" />
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {open && <p className="text-xs text-muted-foreground px-2 mb-2">القائمة</p>}
          {items.map((it) => (
            <Link
              key={it.url}
              to={it.url}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                path === it.url
                  ? "bg-accent/20 text-accent font-medium"
                  : "text-foreground hover:bg-accent/10"
              } ${!open ? "justify-center" : ""}`}
              title={!open ? it.title : ""}
            >
              <it.icon className="h-4 w-4 shrink-0" />
              {open && <span>{it.title}</span>}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-border px-2 py-3 space-y-1">
          {open && <p className="text-xs text-muted-foreground px-2 truncate">{user?.email}</p>}
          <button
            onClick={toggle}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm w-full hover:bg-accent/10 transition-colors ${!open ? "justify-center" : ""}`}
            title={theme === "dark" ? "الوضع النهاري" : "الوضع الليلي"}
          >
            {theme === "dark" ? <Sun className="h-4 w-4 shrink-0" /> : <Moon className="h-4 w-4 shrink-0" />}
            {open && <span>{theme === "dark" ? "الوضع النهاري" : "الوضع الليلي"}</span>}
          </button>
          <button
            onClick={() => signOut()}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm w-full hover:bg-destructive/10 text-destructive transition-colors ${!open ? "justify-center" : ""}`}
            title="تسجيل الخروج"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {open && <span>تسجيل الخروج</span>}
          </button>
        </div>
      </aside>

      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className={`hidden md:flex fixed top-4 z-30 items-center justify-center h-8 w-8 rounded-lg bg-background border border-border hover:bg-accent/10 transition-all duration-200 ${open ? "right-[248px]" : "right-[44px]"}`}
      >
        {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>
    </>
  );
}
