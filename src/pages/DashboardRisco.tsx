import { useState, useEffect, useMemo } from "react";
import FadeIn from "@/components/FadeIn";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NumberTicker } from "@/components/NumberTicker";
import { UserX, Calendar } from "lucide-react";
import { usePlan, isFeatureUnlocked } from "@/contexts/PlanContext";
import LockedFeaturePage from "@/components/dashboard/LockedFeaturePage";
import { FEATURES } from "@/contexts/PlanContext";
import EmptyState from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

const dummyFeature = FEATURES.find(f => f.id === "followup")!;

interface PacienteRisco {
  nome: string;
  telefone: string;
  ultima: string;
  dias: number;
  followups: number;
}

export default function DashboardRisco() {
  const { currentPlan } = usePlan();
  const { clienteId } = useAuth();
  const [tab, setTab] = useState("30");
  const [pacientes, setPacientes] = useState<PacienteRisco[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clienteId) { setLoading(false); return; }
    let active = true;
    (async () => {
      setLoading(true);
      const { data: rows, error } = await supabase
        .from("agendamentos")
        .select("*")
        .eq("cliente_id", clienteId)
        .order("data_marcacao", { ascending: false });
      if (!active) return;
      if (error) { console.error(error); setLoading(false); return; }
      // group by paciente, keep last appointment
      const map = new Map<string, any>();
      (rows || []).forEach((r: any) => {
        const key = r.paciente ?? r.nome_paciente ?? r.telefone ?? String(r.id);
        if (!map.has(key)) map.set(key, r);
      });
      const now = Date.now();
      const list: PacienteRisco[] = Array.from(map.values()).map((r: any) => {
        const dt = r.data_marcacao ? new Date(r.data_marcacao).getTime() : now;
        const dias = Math.floor((now - dt) / 86400000);
        return {
          nome: r.paciente ?? r.nome_paciente ?? "—",
          telefone: r.telefone ?? "—",
          ultima: r.data_marcacao ? new Date(r.data_marcacao).toLocaleDateString("pt-PT") : "—",
          dias,
          followups: r.followups ?? 0,
        };
      });
      setPacientes(list);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [clienteId]);

  const pacientes30 = useMemo(() => pacientes.filter(p => p.dias > 30 && p.dias < 90).sort((a, b) => a.dias - b.dias), [pacientes]);
  const pacientes90 = useMemo(() => pacientes.filter(p => p.dias >= 90).sort((a, b) => a.dias - b.dias), [pacientes]);

  if (!isFeatureUnlocked("scale", currentPlan)) {
    return <LockedFeaturePage feature={{ ...dummyFeature, label: "Pacientes em Risco", description: "Identifica pacientes inativos que precisam de atenção.", benefit: "Reduz a perda de pacientes com intervenção proativa." }} />;
  }

  const data = tab === "30" ? pacientes30 : pacientes90;

  return (
    <FadeIn>
      <div className="flex items-center gap-3 mb-6">
        <h2 className="font-display text-2xl font-bold">Pacientes em Risco</h2>
        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">Requer atenção</Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="gradient-border rounded-xl p-6 bg-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center"><UserX size={20} className="text-amber-400" /></div>
            <span className="text-sm text-muted-foreground">Inativos há 30+ dias</span>
          </div>
          <p className="font-display text-2xl font-bold"><NumberTicker value={pacientes30.length} /></p>
          <Badge className="text-[10px] mt-1 bg-amber-500/20 text-amber-400 border-amber-500/30">Atenção</Badge>
        </div>
        <div className="gradient-border rounded-xl p-6 bg-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center"><UserX size={20} className="text-red-400" /></div>
            <span className="text-sm text-muted-foreground">Inativos há 90+ dias</span>
          </div>
          <p className="font-display text-2xl font-bold"><NumberTicker value={pacientes90.length} /></p>
          <Badge className="text-[10px] mt-1 bg-red-500/20 text-red-400 border-red-500/30">Crítico</Badge>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="30">30+ dias</TabsTrigger>
          <TabsTrigger value="90">90+ dias</TabsTrigger>
        </TabsList>
        <TabsContent value={tab}>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : data.length === 0 ? (
            <EmptyState icon={UserX} title="Sem pacientes em risco" description="Não existem pacientes inativos neste período." />
          ) : (
          <div className="gradient-border rounded-xl bg-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-left">
                  <th className="p-4 font-medium">Paciente</th>
                  <th className="p-4 font-medium hidden sm:table-cell">Telefone</th>
                  <th className="p-4 font-medium">Última Consulta</th>
                  <th className="p-4 font-medium">Dias Inativo</th>
                  <th className="p-4 font-medium hidden sm:table-cell">Follow-ups</th>
                  <th className="p-4" />
                </tr>
              </thead>
              <tbody>
                {data.map((p, i) => (
                  <tr key={i} className={`border-b border-border/50 ${tab === "90" ? "bg-red-500/5" : ""}`}>
                    <td className="p-4 font-medium">{p.nome}</td>
                    <td className="p-4 text-muted-foreground hidden sm:table-cell">{p.telefone}</td>
                    <td className="p-4 text-muted-foreground">{p.ultima}</td>
                    <td className="p-4">
                      <Badge className={`text-[10px] ${p.dias >= 90 ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-amber-500/20 text-amber-400 border-amber-500/30"}`}>
                        {p.dias} dias
                      </Badge>
                    </td>
                    <td className="p-4 text-muted-foreground hidden sm:table-cell">{p.followups} enviado{p.followups !== 1 ? "s" : ""}</td>
                    <td className="p-4">
                      <Button variant="outline" size="sm" className="text-xs">
                        <Calendar size={14} className="mr-1" /> Agendar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </TabsContent>
      </Tabs>
    </FadeIn>
  );
}
