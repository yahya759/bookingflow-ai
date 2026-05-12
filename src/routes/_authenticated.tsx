import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export const Route = createFileRoute("/_authenticated")({
  component: AuthLayout,
});

function AuthLayout() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  useEffect(() => {
    if (!loading && !user) nav({ to: "/login" });
  }, [loading, user, nav]);

  if (loading || !user) {
    return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">جارٍ التحميل...</div>;
  }

  return (
    <SidebarProvider>
      {/* wrapper بـ ltr عشان الـ sidebar component يشتغل صح */}
      <div className="flex min-h-screen w-full" style={{ direction: "ltr" }}>
        {/* المحتوى على اليسار */}
        <div className="flex flex-1 flex-col" style={{ direction: "rtl" }}>
          <header className="sticky top-0 z-30 flex h-14 items-center justify-start gap-2 border-b border-border/60 bg-background/80 px-4 backdrop-blur">
            <SidebarTrigger />
          </header>
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
        {/* الـ sidebar على اليمين */}
        <AppSidebar side="right" />
      </div>
    </SidebarProvider>
  );
}
