import { useState, useEffect } from "react";
import FadeIn from "@/components/FadeIn";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2 } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Escalacao {
  id: number | string;
  paciente: string;
  telefone: string;
  mensagem: string;
  data: string;
  status: "pendente" | "resolvido";
}

export default function DashboardEscalacoes() {
  const { clienteId } = useAuth();
  const [data, setData] = useState<Escalacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("todas");

  useEffect(() => {
    if (!clienteId) { setLoading(false); return; }
    let active = true;
    (async () => {
      setLoading(true);
      const { data: rows, error } = await supabase
        .from("escalacoes")
        .select("*")
        .eq("cliente_id", clienteId)
        .order("criado_em", { ascending: false });
      if (!active) return;
      if (error) { console.error(error); setLoading(false); return; }
      const mapped: Escalacao[] = (rows || []).map((r: any) => ({
        id: r.id,
        paciente: r.paciente ?? r.nome_paciente ?? "—",
        telefone: r.telefone ?? "—",
        mensagem: r.mensagem ?? r.motivo ?? "—",
        data: r.criado_em ? new Date(r.criado_em).toLocaleString("pt-PT") : "—",
        status: (r.estado ?? r.status ?? "pendente") as "pendente" | "resolvido",
      }));
      setData(mapped);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [clienteId]);

  const markResolved = async (id: number | string) => {
    const { error } = await supabase.from("escalacoes").update({ estado: "resolvido" }).eq("id", id);
    if (error) { toast.error("Erro ao actualizar."); return; }
    setData(prev => prev.map(e => e.id === id ? { ...e, status: "resolvido" } : e));
    toast.success("Escalação marcada como resolvida.");
  };

  const filtered = tab === "todas" ? data : data.filter(e => e.status === (tab === "pendentes" ? "pendente" : "resolvido"));

  return (
    <FadeIn>
      <h2 className="font-display text-2xl font-bold mb-6">Escalações</h2>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="pendentes">Pendentes</TabsTrigger>
          <TabsTrigger value="resolvidas">Resolvidas</TabsTrigger>
        </TabsList>
        <TabsContent value={tab}>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState icon={CheckCircle2} title="Nenhuma escalação pendente" description="A Fernanda está a gerir tudo sem precisar de ajuda humana." />
          ) : (
          <div className="gradient-border rounded-xl bg-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-left">
                  <th className="p-4 font-medium">Paciente</th>
                  <th className="p-4 font-medium hidden sm:table-cell">Telefone</th>
                  <th className="p-4 font-medium">Mensagem</th>
                  <th className="p-4 font-medium hidden sm:table-cell">Data</th>
                  <th className="p-4 font-medium">Estado</th>
                  <th className="p-4" />
                </tr>
              </thead>
              <tbody>
                {filtered.map(e => (
                  <tr key={e.id} className="border-b border-border/50">
                    <td className="p-4 font-medium">{e.paciente}</td>
                    <td className="p-4 text-muted-foreground hidden sm:table-cell">{e.telefone}</td>
                    <td className="p-4">{e.mensagem}</td>
                    <td className="p-4 text-muted-foreground hidden sm:table-cell">{e.data}</td>
                    <td className="p-4">
                      <Badge className={`text-[10px] ${e.status === "resolvido" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-amber-500/20 text-amber-400 border-amber-500/30"}`}>
                        {e.status === "resolvido" ? "Resolvido" : "Pendente"}
                      </Badge>
                    </td>
                    <td className="p-4">
                      {e.status === "pendente" && (
                        <Button variant="outline" size="sm" onClick={() => markResolved(e.id)}>
                          Marcar Resolvido
                        </Button>
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
