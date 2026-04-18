import { useState, useEffect } from "react";
import FadeIn from "@/components/FadeIn";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, LayoutGrid } from "lucide-react";
import { Link } from "react-router-dom";
import EmptyState from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

type PlanOption = "Prime" | "Scale" | "Executive";

interface AdminClient {
  id: number;
  clinica: string;
  email: string;
  telefone: string;
  plano: PlanOption;
  estado: "Ativo" | "Suspenso";
  proximaFaturacao: string;
  escalacoes: number;
}

function normalizePlan(p: string | undefined): PlanOption {
  const v = (p || "").toLowerCase();
  if (v === "executive") return "Executive";
  if (v === "scale") return "Scale";
  return "Prime";
}

export default function AdminClientes() {
  const [clients, setClients] = useState<AdminClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("todos");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingChange, setPendingChange] = useState<{ clientId: number; oldPlan: PlanOption; newPlan: PlanOption } | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase.from("clientes").select("*");
      if (!active) return;
      if (error) { console.error(error); setLoading(false); return; }
      const mapped: AdminClient[] = (data || []).map((r: any) => ({
        id: r.cliente_id ?? r.id,
        clinica: r.nome_clinica ?? r.nome ?? "—",
        email: r.email ?? "—",
        telefone: r.telefone ?? "—",
        plano: normalizePlan(r.plano),
        estado: (r.estado === "Suspenso" || r.estado === "suspenso") ? "Suspenso" : "Ativo",
        proximaFaturacao: r.proxima_faturacao ?? "—",
        escalacoes: r.escalacoes ?? 0,
      }));
      setClients(mapped);
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  const toggleEstado = (id: number) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, estado: c.estado === "Ativo" ? "Suspenso" : "Ativo" } : c));
  };

  const requestPlanChange = (clientId: number, oldPlan: PlanOption, newPlan: PlanOption) => {
    if (oldPlan === newPlan) return;
    setPendingChange({ clientId, oldPlan, newPlan });
    setConfirmOpen(true);
  };

  const confirmPlanChange = async () => {
    if (!pendingChange) return;
    const { clientId, newPlan } = pendingChange;
    const { error } = await supabase.from("clientes").update({ plano: newPlan.toLowerCase() }).eq("cliente_id", clientId);
    if (error) { toast.error("Erro ao actualizar o plano."); return; }
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, plano: newPlan } : c));
    localStorage.setItem(`cliente_plano_${clientId}`, newPlan.toLowerCase());

    const key = `cliente_notificacoes_${clientId}`;
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    existing.unshift({
      id: Date.now().toString(),
      tipo: "plano_actualizado",
      titulo: "Plano actualizado",
      mensagem: `O teu plano foi actualizado para ${newPlan}. As novas funcionalidades já estão disponíveis.`,
      lida: false,
      data: "agora",
    });
    localStorage.setItem(key, JSON.stringify(existing));

    if (clientId === 1) localStorage.setItem("flowen_current_plan", newPlan.toLowerCase());

    const client = clients.find(c => c.id === clientId);
    toast.success(`Plano da ${client?.clinica} actualizado para ${newPlan} com sucesso.`);
    setConfirmOpen(false);
    setPendingChange(null);
  };

  const filtered = clients
    .filter(c => c.clinica.toLowerCase().includes(search.toLowerCase()))
    .filter(c => tab === "todos" || c.plano.toLowerCase() === tab);

  const planBadge = (p: string) => p === "Executive" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : p === "Scale" ? "bg-primary/20 text-primary border-primary/30" : "bg-muted text-muted-foreground";

  return (
    <FadeIn>
      <h2 className="font-display text-2xl font-bold mb-6">Clientes</h2>
      <div className="relative mb-4 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Pesquisar clínica..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="prime">Prime</TabsTrigger>
          <TabsTrigger value="scale">Scale</TabsTrigger>
          <TabsTrigger value="executive">Executive</TabsTrigger>
        </TabsList>
        <TabsContent value={tab}>
          {loading ? (
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState icon={Search} title="Nenhum cliente encontrado" description="Tenta pesquisar por outro nome ou email." />
          ) : (
          <div className="gradient-border rounded-xl bg-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-left">
                  <th className="p-4 font-medium">Clínica</th>
                  <th className="p-4 font-medium hidden md:table-cell">Email</th>
                  <th className="p-4 font-medium">Plano</th>
                  <th className="p-4 font-medium">Estado</th>
                  <th className="p-4 font-medium hidden md:table-cell">Faturação</th>
                  <th className="p-4 font-medium hidden md:table-cell">Escalações</th>
                  <th className="p-4" />
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="border-b border-border/50">
                    <td className="p-4 font-medium">{c.clinica}</td>
                    <td className="p-4 text-muted-foreground hidden md:table-cell">{c.email}</td>
                    <td className="p-4"><Badge className={`text-[10px] ${planBadge(c.plano)}`}>{c.plano}</Badge></td>
                    <td className="p-4"><Badge className={`text-[10px] ${c.estado === "Ativo" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}`}>{c.estado}</Badge></td>
                    <td className="p-4 text-muted-foreground hidden md:table-cell">{c.proximaFaturacao}</td>
                    <td className="p-4 hidden md:table-cell">{c.escalacoes}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Link to={`/admin/clientes/${c.id}`}><Button variant="outline" size="sm">Ver</Button></Link>
                        <Button variant="ghost" size="sm" className="text-xs" onClick={() => toggleEstado(c.id)}>
                          {c.estado === "Ativo" ? "Suspender" : "Reativar"}
                        </Button>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="text-xs">Gerir Plano</Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-56 p-3">
                            <p className="text-xs text-muted-foreground mb-2">Plano actual: <Badge className={`text-[10px] ${planBadge(c.plano)}`}>{c.plano}</Badge></p>
                            <div className="flex flex-col gap-1.5">
                              {(["Prime", "Scale", "Executive"] as PlanOption[]).map(p => (
                                <Button
                                  key={p}
                                  variant={p === c.plano ? "default" : "outline"}
                                  size="sm"
                                  className="text-xs justify-start"
                                  onClick={() => requestPlanChange(c.id, c.plano, p)}
                                  disabled={p === c.plano}
                                >
                                  {p}
                                </Button>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                        <Link to={`/admin/clientes/${c.id}`}>
                          <Button variant="outline" size="sm" className="text-xs">
                            <LayoutGrid size={14} className="mr-1" /> Secções
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar alteração de plano</DialogTitle>
            <DialogDescription>
              {pendingChange && (() => {
                const client = clients.find(c => c.id === pendingChange.clientId);
                return `Tens a certeza que queres mudar o plano da ${client?.clinica} de ${pendingChange.oldPlan} para ${pendingChange.newPlan}? Esta alteração é imediata e o cliente terá acesso às novas funcionalidades de imediato.`;
              })()}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end mt-4">
            <Button variant="outline" onClick={() => { setConfirmOpen(false); setPendingChange(null); }}>Cancelar</Button>
            <Button onClick={confirmPlanChange}>Confirmar Alteração</Button>
          </div>
        </DialogContent>
      </Dialog>
    </FadeIn>
  );
}
