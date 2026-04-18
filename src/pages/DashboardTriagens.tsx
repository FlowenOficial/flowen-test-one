import { useState, useEffect } from "react";
import FadeIn from "@/components/FadeIn";
import { Badge } from "@/components/ui/badge";
import { NumberTicker } from "@/components/NumberTicker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Stethoscope, CheckCircle2 } from "lucide-react";
import { usePlan, isFeatureUnlocked, FEATURES } from "@/contexts/PlanContext";
import LockedFeaturePage from "@/components/dashboard/LockedFeaturePage";
import EmptyState from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

const dummyFeature = FEATURES.find(f => f.id === "prioridade")!;

interface Triagem {
  id: string | number;
  paciente: string;
  sintomas: string;
  nivel: "emergencia" | "urgente" | "rotina";
  pontuacao: number;
  especialista: string;
  data: string;
}

const nivelBadge = (n: string) =>
  n === "emergencia" ? "bg-red-500/20 text-red-400 border-red-500/30"
    : n === "urgente" ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
    : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";

const nivelLabel = (n: string) =>
  n === "emergencia" ? "Emergência" : n === "urgente" ? "Urgente" : "Rotina";

function normalizeNivel(n: string | undefined): Triagem["nivel"] {
  const v = (n || "").toLowerCase();
  if (v.includes("emerg")) return "emergencia";
  if (v.includes("urgen")) return "urgente";
  return "rotina";
}

export default function DashboardTriagens() {
  const { currentPlan } = usePlan();
  const { clienteId } = useAuth();
  const [tab, setTab] = useState("todas");
  const [triagens, setTriagens] = useState<Triagem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clienteId) { setLoading(false); return; }
    let active = true;
    (async () => {
      setLoading(true);
      const { data: rows, error } = await supabase
        .from("n8n_triagens")
        .select("*")
        .eq("cliente_id", clienteId)
        .order("criado_em", { ascending: false });
      if (!active) return;
      if (error) { console.error(error); setLoading(false); return; }
      const mapped: Triagem[] = (rows || []).map((r: any) => ({
        id: r.id,
        paciente: r.paciente ?? r.nome_paciente ?? "—",
        sintomas: r.sintomas ?? "—",
        nivel: normalizeNivel(r.nivel ?? r.urgencia),
        pontuacao: r.pontuacao ?? 0,
        especialista: r.especialista ?? r.especialidade ?? "—",
        data: r.criado_em ? new Date(r.criado_em).toLocaleString("pt-PT") : "—",
      }));
      setTriagens(mapped);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [clienteId]);

  if (!isFeatureUnlocked("scale", currentPlan)) {
    return <LockedFeaturePage feature={{ ...dummyFeature, label: "Triagens", description: "Histórico de triagens automáticas da sua clínica.", benefit: "Casos urgentes nunca mais ficam esquecidos." }} />;
  }

  const totalMes = triagens.length;
  const urgentes = triagens.filter(t => t.nivel === "urgente").length;
  const emergencias = triagens.filter(t => t.nivel === "emergencia").length;

  const kpis = [
    { label: "Triagens Este Mês", value: totalMes, icon: Stethoscope },
    { label: "Urgentes", value: urgentes, icon: AlertTriangle, badge: "bg-amber-500/20 text-amber-400 border-amber-500/30", badgeText: "Atenção" },
    { label: "Emergências", value: emergencias, icon: CheckCircle2, badge: emergencias === 0 ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-red-500/20 text-red-400 border-red-500/30", badgeText: emergencias === 0 ? "Tudo ok" : "Crítico" },
  ];

  const filtered = tab === "todas" ? triagens : triagens.filter(t => t.nivel === tab);

  return (
    <FadeIn>
      <h2 className="font-display text-2xl font-bold mb-6">Triagens</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {kpis.map((k, i) => (
          <div key={i} className="gradient-border rounded-xl p-6 bg-card transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><k.icon size={20} className="text-primary" /></div>
              <span className="text-sm text-muted-foreground">{k.label}</span>
            </div>
            <p className="font-display text-2xl font-bold"><NumberTicker value={k.value} /></p>
            {k.badge && <Badge className={`text-[10px] mt-1 ${k.badge}`}>{k.badgeText}</Badge>}
          </div>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="emergencia">Emergência</TabsTrigger>
          <TabsTrigger value="urgente">Urgente</TabsTrigger>
          <TabsTrigger value="rotina">Rotina</TabsTrigger>
        </TabsList>
        <TabsContent value={tab}>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState icon={CheckCircle2} title="Nenhuma triagem encontrada" description="Não existem triagens para este filtro." />
          ) : (
          <div className="gradient-border rounded-xl bg-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-left">
                  <th className="p-4 font-medium">Paciente</th>
                  <th className="p-4 font-medium hidden md:table-cell">Sintomas</th>
                  <th className="p-4 font-medium">Nível</th>
                  <th className="p-4 font-medium hidden md:table-cell">Pontuação</th>
                  <th className="p-4 font-medium hidden md:table-cell">Especialista</th>
                  <th className="p-4 font-medium">Data/Hora</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t.id} className="border-b border-border/50">
                    <td className="p-4 font-medium">{t.paciente}</td>
                    <td className="p-4 hidden md:table-cell text-muted-foreground">{t.sintomas}</td>
                    <td className="p-4"><Badge className={`text-[10px] ${nivelBadge(t.nivel)}`}>{nivelLabel(t.nivel)}</Badge></td>
                    <td className="p-4 hidden md:table-cell">{t.pontuacao}</td>
                    <td className="p-4 hidden md:table-cell text-muted-foreground">{t.especialista}</td>
                    <td className="p-4 text-muted-foreground">{t.data}</td>
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
