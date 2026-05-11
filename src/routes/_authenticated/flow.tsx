import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ArrowUp, ArrowDown, MessageSquare, Scissors, Users, Calendar, Clock, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/hooks/use-business";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/flow")({
  head: () => ({ meta: [{ title: "Flow Builder — Bookly" }] }),
  component: FlowPage,
});

interface Step { id: string; step_key: string; position: number; enabled: boolean; custom_label: string | null; }

const ICONS: Record<string, any> = { welcome: MessageSquare, service: Scissors, staff: Users, date: Calendar, time: Clock, confirm: CheckCircle2 };
const DEFAULT_LABEL: Record<string,string> = { welcome:"Welcome", service:"Choose Service", staff:"Choose Staff", date:"Choose Date", time:"Choose Time", confirm:"Confirmation" };

function FlowPage() {
  const { business } = useBusiness();
  const [steps, setSteps] = useState<Step[]>([]);

  const load = async () => {
    if (!business) return;
    const { data } = await supabase.from("flow_steps").select("*").eq("business_id", business.id).order("position");
    setSteps((data ?? []) as Step[]);
  };
  useEffect(() => { load(); }, [business?.id]);

  const move = async (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= steps.length) return;
    const a = steps[idx], b = steps[j];
    const next = [...steps];
    next[idx] = { ...b, position: a.position };
    next[j] = { ...a, position: b.position };
    setSteps(next.sort((x,y)=>x.position-y.position));
    await Promise.all([
      supabase.from("flow_steps").update({ position: b.position }).eq("id", a.id),
      supabase.from("flow_steps").update({ position: a.position }).eq("id", b.id),
    ]);
  };

  const updateStep = async (id: string, patch: Partial<Step>) => {
    setSteps((s) => s.map((x) => x.id === id ? { ...x, ...patch } : x));
    await supabase.from("flow_steps").update(patch).eq("id", id);
  };

  const saveLabel = async (id: string, label: string) => {
    await supabase.from("flow_steps").update({ custom_label: label }).eq("id", id);
    toast.success("Updated");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Flow builder</h1>
        <p className="mt-1 text-sm text-muted-foreground">Customize the steps customers go through when booking.</p>
      </div>
      <div className="space-y-3">
        {steps.map((s, i) => {
          const Icon = ICONS[s.step_key] ?? MessageSquare;
          return (
            <Card key={s.id} className={`p-5 transition ${s.enabled ? "" : "opacity-50"}`}>
              <div className="flex items-start gap-4">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent/10 text-accent">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">Step {i + 1}</div>
                  <Input
                    className="mt-1.5 border-none px-0 text-base font-semibold shadow-none focus-visible:ring-0"
                    defaultValue={s.custom_label ?? DEFAULT_LABEL[s.step_key]}
                    onBlur={(e)=>saveLabel(s.id, e.target.value)}
                  />
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Switch checked={s.enabled} onCheckedChange={(v)=>updateStep(s.id, { enabled: v })}/>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={()=>move(i, -1)} disabled={i===0}><ArrowUp className="h-3.5 w-3.5"/></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={()=>move(i, 1)} disabled={i===steps.length-1}><ArrowDown className="h-3.5 w-3.5"/></Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
