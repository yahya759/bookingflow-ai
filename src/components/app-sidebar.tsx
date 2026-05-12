import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Scissors, Users, Clock, Workflow,
  CalendarCheck, Settings, Sparkles, LogOut, Sun, Moon,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter,
} from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/routes/__root";

const items = [
  { title: "لوحة التحكم", url: "/dashboard", icon: LayoutDashboard },
  { title: "الخدمات", url: "/services", icon: Scissors },
  { title: "الموظفون", url: "/staff", icon: Users },
  { title: "ساعات العمل", url: "/hours", icon: Clock },
  { title: "منشئ الخطوات", url: "/flow", icon: Workflow },
  { title: "الحجوزات", url: "/bookings", icon: CalendarCheck },
  { title: "الإعدادات", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { signOut, user } = useAuth();
  const { theme, toggle } = useTheme();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link to="/dashboard" className="flex items-center gap-2 px-2 py-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-accent-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-base font-bold group-data-[collapsible=icon]:hidden">بوكلي</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>القائمة</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((it) => (
                <SidebarMenuItem key={it.url}>
                  <SidebarMenuButton asChild isActive={path === it.url} tooltip={it.title}>
                    <Link to={it.url}>
                      <it.icon className="h-4 w-4" />
                      <span>{it.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-2 py-1 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden truncate">
          {user?.email}
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={toggle} tooltip={theme === "dark" ? "الوضع النهاري" : "الوضع الليلي"}>
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span>{theme === "dark" ? "الوضع النهاري" : "الوضع الليلي"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => signOut()} tooltip="تسجيل الخروج">
              <LogOut className="h-4 w-4" />
              <span>تسجيل الخروج</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
