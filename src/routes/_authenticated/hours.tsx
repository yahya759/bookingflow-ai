import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/hooks/use-business";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/hours")({
  head: () => ({ meta: [{ title: "Working Hours — Bookly" }] }),
  component: HoursPage,
});

const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

interface WH {
  id: string; day_of_week: number; open_time: string; close_time: string;
  break_start: string | null; break_end: string | null; is_closed: boolean;
}

function HoursPage() {
  const { business } = useBusiness();
  const [rows, setRows] = useState<WH[]>([]);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!business) return;
    const { data } = await supabase.from("working_hours").select("*").eq("business_id", business.id).order("day_of_week");
    setRows((data ?? []) as WH[]);
  };
  useEffect(() => { load(); }, [business?.id]);

  const update = (idx: number, patch: Partial<WH>) => {
    setRows((r) => r.map((row, i) => (i === idx ? { ...row, ...patch } : row)));
  };

  const save = async () => {
    if (!business) return;
    setBusy(true);
    const updates = rows.map((r) =>
      supabase.from("working_hours").update({
        open_time: r.open_time, close_time: r.close_time,
        break_start: r.break_start || null, break_end: r.break_end || null,
        is_closed: r.is_closed,
      }).eq("id", r.id)
    );
    const results = await Promise.all(updates);
    setBusy(false);
    if (results.some((r) => r.error)) toast.error("Some rows failed to save");
    else toast.success("Working hours saved");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Working hours</h1>
        <p className="mt-1 text-sm text-muted-foreground">When customers can book appointments.</p>
      </div>
      <Card className="divide-y divide-border/60">
        {rows.map((r, i) => (
          <div key={r.id} className="grid grid-cols-12 items-center gap-3 p-4">
            <div className="col-span-3 font-medium">{DAYS[r.day_of_week]}</div>
            <div className="col-span-2 flex items-center gap-2">
              <Switch checked={!r.is_closed} onCheckedChange={(v)=>update(i,{is_closed: !v})} />
              <span className="text-xs text-muted-foreground">{r.is_closed ? "Closed" : "Open"}</span>
            </div>
            {!r.is_closed ? (
              <>
                <Input type="time" className="col-span-2" value={r.open_time?.slice(0,5)} onChange={(e)=>update(i,{open_time:e.target.value})}/>
                <Input type="time" className="col-span-2" value={r.close_time?.slice(0,5)} onChange={(e)=>update(i,{close_time:e.target.value})}/>
                <Input type="time" className="col-span-1.5" placeholder="Break" value={r.break_start?.slice(0,5) ?? ""} onChange={(e)=>update(i,{break_start:e.target.value || null})}/>
                <Input type="time" className="col-span-1.5" placeholder="End" value={r.break_end?.slice(0,5) ?? ""} onChange={(e)=>update(i,{break_end:e.target.value || null})}/>
              </>
            ) : <div className="col-span-9 text-xs text-muted-foreground">Day off</div>}
          </div>
        ))}
      </Card>
      <div className="flex justify-end">
        <Button onClick={save} disabled={busy} className="bg-accent text-accent-foreground">{busy ? "Saving..." : "Save changes"}</Button>
      </div>
    </div>
  );
}
