import { useState, useEffect } from "react";
import FadeIn from "@/components/FadeIn";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NumberTicker } from "@/components/NumberTicker";
import { Users, TrendingUp, AlertTriangle, CreditCard } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const revenueData = [
  { name: "Out", receita: 1800 }, { name: "Nov", receita: 2100 }, { name: "Dez", receita: 1950 },
  { name: "Jan", receita: 2200 }, { name: "Fev", receita: 2540 }, { name: "Mar", receita: 2748 },
];
const escalWeekly = [
  { name: "S1", value: 5 }, { name: "S2", value: 3 }, { name: "S3", value: 6 }, { name: "S4", value: 4 },
  { name: "S5", value: 7 }, { name: "S6", value: 3 }, { name: "S7", value: 2 }, { name: "S8", value: 4 },
];
const chartStyle = { background: "hsl(220,30%,8%)", border: "1px solid hsl(220,20%,18%)", borderRadius: 8 };

interface Cliente {
  id: number;
  clinica: string;
  plano: string;
  estado: string;
  escalacoes: number;
  proximaFaturacao: string;
}

export default function AdminOverview() {
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Cliente[]>([]);
  const [totals, setTotals] = useState({ clientes: 0, escalacoes: 0, receita: 0, falhados: 0 });

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const [cliResp, escResp, payResp] = await Promise.all([
        supabase.from("clientes").select("*"),
        supabase.from("escalacoes").select("id, estado, status"),
        supabase.from("pagamentos").select("valor, estado"),
      ]);
      if (!active) return;
      const cliList: Cliente[] = (cliResp.data || []).map((r: any) => ({
        id: r.cliente_id ?? r.id,
        clinica: r.nome_clinica ?? r.nome ?? "—",
        plano: r.plano ?? "Prime",
        estado: r.estado ?? "Ativo",
        escalacoes: 0,
        proximaFaturacao: r.proxima_faturacao ?? "—",
      }));
      setClients(cliList);

      const totalReceita = (payResp.data || [])
        .filter((p: any) => (p.estado === "Pago" || p.estado === "pago"))
        .reduce((a: number, p: any) => a + (Number(p.valor) || 0), 0);
      const falhados = (payResp.data || []).filter((p: any) => p.estado === "Falhado" || p.estado === "falhado").length;

      setTotals({
        clientes: cliList.length,
        escalacoes: (escResp.data || []).length,
        receita: totalReceita,
        falhados,
      });
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />)}
        </div>
        <div className="h-64 rounded-xl bg-muted animate-pulse" />
      </div>
    );
  }

  const kpis = [
    { label: "Clientes Activos", value: totals.clientes, icon: Users, badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", badgeText: "Activos" },
    { label: "Receita Este Mês", value: totals.receita, icon: TrendingUp, prefix: "€", trend: "+8%" },
    { label: "Escalações Este Mês", value: totals.escalacoes, icon: AlertTriangle },
    { label: "Pagamentos em Falta", value: totals.falhados, icon: CreditCard, badge: totals.falhados > 0 ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", badgeText: totals.falhados > 0 ? "Em falta" : "Tudo ok" },
  ];

  return (
    <FadeIn>
      <h2 className="font-display text-2xl font-bold mb-6">Visão Geral</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((k, i) => (
          <div key={i} className="gradient-border rounded-xl p-6 bg-card transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] hover:border-primary/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <k.icon size={20} className="text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">{k.label}</span>
            </div>
            <p className="font-display text-2xl font-bold mb-1">
              <NumberTicker value={k.value} prefix={k.prefix} />
            </p>
            {k.trend && <p className="text-xs text-emerald-400">{k.trend}</p>}
            {k.badge && <Badge className={`text-[10px] mt-1 ${k.badge}`}>{k.badgeText}</Badge>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="gradient-border rounded-xl p-6 bg-card">
          <h3 className="font-display font-semibold mb-4">Receita por Mês</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,20%,18%)" />
                <XAxis dataKey="name" stroke="hsl(215,15%,60%)" fontSize={12} />
                <YAxis stroke="hsl(215,15%,60%)" fontSize={12} />
                <Tooltip contentStyle={chartStyle} />
                <Bar dataKey="receita" fill="hsl(216,100%,56%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="gradient-border rounded-xl p-6 bg-card">
          <h3 className="font-display font-semibold mb-4">Escalações por Semana</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={escalWeekly}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,20%,18%)" />
                <XAxis dataKey="name" stroke="hsl(215,15%,60%)" fontSize={12} />
                <YAxis stroke="hsl(215,15%,60%)" fontSize={12} />
                <Tooltip contentStyle={chartStyle} />
                <Line type="monotone" dataKey="value" stroke="hsl(216,100%,56%)" strokeWidth={2} dot={{ fill: "hsl(216,100%,56%)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="gradient-border rounded-xl bg-card overflow-x-auto">
        <h3 className="font-display font-semibold p-6 pb-0">Clientes</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground text-left">
              <th className="p-4 font-medium">Clínica</th>
              <th className="p-4 font-medium">Plano</th>
              <th className="p-4 font-medium">Estado</th>
              <th className="p-4 font-medium hidden md:table-cell">Escalações</th>
              <th className="p-4 font-medium hidden md:table-cell">Próxima Faturação</th>
              <th className="p-4" />
            </tr>
          </thead>
          <tbody>
            {clients.map(c => {
              const planBadge = c.plano === "Executive" || c.plano === "executive" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : c.plano === "Scale" || c.plano === "scale" ? "bg-primary/20 text-primary border-primary/30" : "bg-muted text-muted-foreground";
              return (
                <tr key={c.id} className="border-b border-border/50">
                  <td className="p-4 font-medium">{c.clinica}</td>
                  <td className="p-4"><Badge className={`text-[10px] ${planBadge}`}>{c.plano}</Badge></td>
                  <td className="p-4"><Badge className={`text-[10px] ${c.estado === "Ativo" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}`}>{c.estado}</Badge></td>
                  <td className="p-4 hidden md:table-cell">{c.escalacoes}</td>
                  <td className="p-4 hidden md:table-cell text-muted-foreground">{c.proximaFaturacao}</td>
                  <td className="p-4"><Link to={`/admin/clientes/${c.id}`}><Button variant="outline" size="sm">Ver</Button></Link></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Follow-ups Este Mês — Por Clínica (mock summary) */}
      <div className="gradient-border rounded-xl bg-card overflow-x-auto mt-8">
        <h3 className="font-display font-semibold p-6 pb-0">Follow-ups Este Mês — Por Clínica</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground text-left">
              <th className="p-4 font-medium">Clínica</th>
              <th className="p-4 font-medium">Confirmações</th>
              <th className="p-4 font-medium hidden md:table-cell">Lembretes D-1</th>
              <th className="p-4 font-medium hidden md:table-cell">Pós-Consulta</th>
              <th className="p-4 font-medium hidden md:table-cell">Reengajamento</th>
              <th className="p-4 font-medium hidden md:table-cell">Alertas Risco</th>
              <th className="p-4 font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c, i) => {
              const seed = (c.id * 7) % 20;
              const conf = seed; const lemb = Math.max(0, seed - 1);
              const pos = Math.max(0, seed - 4); const ree = Math.max(0, Math.floor(seed / 3));
              const ale = Math.max(0, Math.floor(seed / 8));
              return (
                <tr key={i} className="border-b border-border/50">
                  <td className="p-4 font-medium">{c.clinica}</td>
                  <td className="p-4">{conf}</td>
                  <td className="p-4 hidden md:table-cell">{lemb}</td>
                  <td className="p-4 hidden md:table-cell">{pos}</td>
                  <td className="p-4 hidden md:table-cell">{ree}</td>
                  <td className="p-4 hidden md:table-cell">{ale}</td>
                  <td className="p-4 font-medium">{conf + lemb + pos + ree + ale}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </FadeIn>
  );
}
