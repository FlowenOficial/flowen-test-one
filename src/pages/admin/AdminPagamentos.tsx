import { useState, useEffect } from "react";
import FadeIn from "@/components/FadeIn";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NumberTicker } from "@/components/NumberTicker";
import { TrendingUp, CheckCircle2, XCircle, CreditCard } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";

interface Pagamento {
  id: string | number;
  clinica: string;
  plano: string;
  valor: string;
  valorNum: number;
  data: string;
  estado: "Pago" | "Falhado" | "Pendente";
  metodo: string;
}

export default function AdminPagamentos() {
  const [tab, setTab] = useState("todos");
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const [payResp, cliResp] = await Promise.all([
        supabase.from("pagamentos").select("*").order("criado_em", { ascending: false }),
        supabase.from("clientes").select("cliente_id, nome_clinica"),
      ]);
      if (!active) return;
      const clientesMap = new Map<number, string>();
      (cliResp.data || []).forEach((c: any) => clientesMap.set(c.cliente_id ?? c.id, c.nome_clinica ?? "—"));
      const mapped: Pagamento[] = (payResp.data || []).map((r: any) => {
        const v = Number(r.valor) || 0;
        const estado = r.estado === "pago" || r.estado === "Pago" ? "Pago"
          : r.estado === "falhado" || r.estado === "Falhado" ? "Falhado"
          : "Pendente";
        return {
          id: r.id,
          clinica: clientesMap.get(r.cliente_id) ?? "—",
          plano: r.plano ?? "—",
          valor: `€${v}`,
          valorNum: v,
          data: r.criado_em ? new Date(r.criado_em).toLocaleDateString("pt-PT") : "—",
          estado: estado as "Pago" | "Falhado" | "Pendente",
          metodo: r.metodo ?? "—",
        };
      });
      setPagamentos(mapped);
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  const filtered = tab === "todos" ? pagamentos : pagamentos.filter(p => {
    if (tab === "pagos") return p.estado === "Pago";
    if (tab === "falhados") return p.estado === "Falhado";
    return p.estado === "Pendente";
  });
  const total = filtered.reduce((acc, p) => acc + p.valorNum, 0);

  const receitaMes = pagamentos.filter(p => p.estado === "Pago").reduce((a, p) => a + p.valorNum, 0);
  const sucessos = pagamentos.filter(p => p.estado === "Pago").length;
  const falhados = pagamentos.filter(p => p.estado === "Falhado").length;

  const kpis = [
    { label: "Receita Este Mês", value: receitaMes, prefix: "€", icon: TrendingUp },
    { label: "Pagamentos Bem-sucedidos", value: sucessos, icon: CheckCircle2 },
    { label: "Pagamentos Falhados", value: falhados, icon: XCircle, badge: "bg-red-500/20 text-red-400 border-red-500/30", badgeText: "Atenção" },
  ];

  const estadoBadge = (e: string) => {
    if (e === "Pago") return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    if (e === "Falhado") return "bg-red-500/20 text-red-400 border-red-500/30";
    return "bg-amber-500/20 text-amber-400 border-amber-500/30";
  };

  return (
    <FadeIn>
      <h2 className="font-display text-2xl font-bold mb-6">Pagamentos</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {kpis.map((k, i) => (
          <div key={i} className="gradient-border rounded-xl p-6 bg-card transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><k.icon size={20} className="text-primary" /></div>
              <span className="text-sm text-muted-foreground">{k.label}</span>
            </div>
            <p className="font-display text-2xl font-bold"><NumberTicker value={k.value} prefix={k.prefix} /></p>
            {k.badge && <Badge className={`text-[10px] mt-1 ${k.badge}`}>{k.badgeText}</Badge>}
          </div>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="pagos">Pagos</TabsTrigger>
          <TabsTrigger value="falhados">Falhados</TabsTrigger>
          <TabsTrigger value="pendentes">Pendentes</TabsTrigger>
        </TabsList>
        <TabsContent value={tab}>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState icon={CreditCard} title="Nenhum pagamento encontrado" description="Não existem pagamentos para este filtro." />
          ) : (
          <div className="gradient-border rounded-xl bg-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-left">
                  <th className="p-4 font-medium">Clínica</th>
                  <th className="p-4 font-medium">Plano</th>
                  <th className="p-4 font-medium">Valor</th>
                  <th className="p-4 font-medium hidden md:table-cell">Data</th>
                  <th className="p-4 font-medium">Estado</th>
                  <th className="p-4 font-medium hidden md:table-cell">Método</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className={`border-b border-border/50 ${p.estado === "Falhado" ? "bg-red-500/5" : ""}`}>
                    <td className="p-4 font-medium">{p.clinica}</td>
                    <td className="p-4"><Badge className="text-[10px] bg-muted text-muted-foreground">{p.plano}</Badge></td>
                    <td className="p-4">{p.valor}</td>
                    <td className="p-4 text-muted-foreground hidden md:table-cell">{p.data}</td>
                    <td className="p-4"><Badge className={`text-[10px] ${estadoBadge(p.estado)}`}>{p.estado}</Badge></td>
                    <td className="p-4 text-muted-foreground hidden md:table-cell">{p.metodo}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-border">
                  <td className="p-4 font-semibold" colSpan={2}>Total</td>
                  <td className="p-4 font-semibold" colSpan={4}>€{total.toLocaleString("pt-PT")}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          )}
        </TabsContent>
      </Tabs>
    </FadeIn>
  );
}
