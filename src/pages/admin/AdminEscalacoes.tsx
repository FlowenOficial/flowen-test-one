import { useState, useEffect } from "react";
import FadeIn from "@/components/FadeIn";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NumberTicker } from "@/components/NumberTicker";
import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Escalacao {
  id: string | number;
  clinica: string;
  paciente: string;
  motivo: string;
  data: string;
  status: "pendente" | "resolvido";
}

export default function AdminEscalacoes() {
  const [data, setData] = useState<Escalacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("todos");

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const [escResp, cliResp] = await Promise.all([
        supabase.from("escalacoes").select("*").order("criado_em", { ascending: false }),
        supabase.from("clientes").select("cliente_id, nome_clinica"),
      ]);
      if (!active) return;
      const clientesMap = new Map<number, string>();
      (cliResp.data || []).forEach((c: any) => clientesMap.set(c.cliente_id ?? c.id, c.nome_clinica ?? "—"));
      const mapped: Escalacao[] = (escResp.data || []).map((r: any) => ({
        id: r.id,
        clinica: clientesMap.get(r.cliente_id) ?? "—",
        paciente: r.paciente ?? r.nome_paciente ?? "—",
        motivo: r.motivo ?? r.mensagem ?? "—",
        data: r.criado_em ? new Date(r.criado_em).toLocaleString("pt-PT") : "—",
        status: ((r.estado ?? r.status) === "resolvido" ? "resolvido" : "pendente") as "pendente" | "resolvido",
      }));
      setData(mapped);
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  const markResolved = async (id: string | number) => {
    const { error } = await supabase.from("escalacoes").update({ estado: "resolvido" }).eq("id", id);
    if (error) { toast.error("Erro ao actualizar."); return; }
    setData(prev => prev.map(e => e.id === id ? { ...e, status: "resolvido" } : e));
    toast.success("Escalação resolvida.");
  };

  const total = data.length;
  const pendentes = data.filter(e => e.status === "pendente").length;
  const resolvidas = data.filter(e => e.status === "resolvido").length;

  const kpis = [
    { label: "Total Este Mês", value: total, icon: AlertTriangle },
    { label: "Pendentes", value: pendentes, icon: Clock, badge: "bg-red-500/20 text-red-400 border-red-500/30", badgeText: "Atenção" },
    { label: "Resolvidas", value: resolvidas, icon: CheckCircle2 },
  ];

  const filtered = tab === "todos" ? data : data.filter(e => e.status === (tab === "pendentes" ? "pendente" : "resolvido"));

  return (
    <FadeIn>
      <h2 className="font-display text-2xl font-bold mb-6">Escalações</h2>
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
          <TabsTrigger value="todos">Todas</TabsTrigger>
          <TabsTrigger value="pendentes">Pendentes</TabsTrigger>
          <TabsTrigger value="resolvidas">Resolvidas</TabsTrigger>
        </TabsList>
        <TabsContent value={tab}>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState icon={CheckCircle2} title="Nenhuma escalação encontrada" description="Não existem escalações para este filtro." />
          ) : (
          <div className="gradient-border rounded-xl bg-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-left">
                  <th className="p-4 font-medium">Clínica</th>
                  <th className="p-4 font-medium">Paciente</th>
                  <th className="p-4 font-medium hidden md:table-cell">Motivo</th>
                  <th className="p-4 font-medium hidden md:table-cell">Data/Hora</th>
                  <th className="p-4 font-medium">Estado</th>
                  <th className="p-4" />
                </tr>
              </thead>
              <tbody>
                {filtered.map(e => (
                  <tr key={e.id} className="border-b border-border/50">
                    <td className="p-4 font-medium">{e.clinica}</td>
                    <td className="p-4">{e.paciente}</td>
                    <td className="p-4 hidden md:table-cell text-muted-foreground">{e.motivo}</td>
                    <td className="p-4 hidden md:table-cell text-muted-foreground">{e.data}</td>
                    <td className="p-4">
                      <Badge className={`text-[10px] ${e.status === "resolvido" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-amber-500/20 text-amber-400 border-amber-500/30"}`}>
                        {e.status === "resolvido" ? "Resolvido" : "Pendente"}
                      </Badge>
                    </td>
                    <td className="p-4">
                      {e.status === "pendente" && (
                        <Button variant="outline" size="sm" onClick={() => markResolved(e.id)}>Marcar Resolvido</Button>
                      )}
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
