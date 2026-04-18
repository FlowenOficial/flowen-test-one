import { useState, useEffect } from "react";
import FadeIn from "@/components/FadeIn";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NumberTicker } from "@/components/NumberTicker";
import {
  CalendarCheck, AlertTriangle, TrendingUp, CreditCard,
  Calendar, Phone,
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/EmptyState";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const weeklyAttendance = [
  { name: "Sem 1", value: 82 }, { name: "Sem 2", value: 86 }, { name: "Sem 3", value: 84 },
  { name: "Sem 4", value: 91 }, { name: "Sem 5", value: 88 }, { name: "Sem 6", value: 89 },
  { name: "Sem 7", value: 87 }, { name: "Sem 8", value: 92 },
];

const chartTooltipStyle = { background: "hsl(220,30%,8%)", border: "1px solid hsl(220,20%,18%)", borderRadius: 8 };

interface Escalacao {
  id: string | number;
  paciente: string;
  hora: string;
  status: "pendente" | "resolvido";
}

interface PendingAppt {
  id: string | number;
  nome: string;
  tipo: string;
  hora: string;
}

export default function DashboardOverview() {
  const { clienteId } = useAuth();
  const [escalacoes, setEscalacoes] = useState<Escalacao[]>([]);
  const [pendentes, setPendentes] = useState<PendingAppt[]>([]);
  const [agendamentosCount, setAgendamentosCount] = useState(0);
  const [escalacoesPendentes, setEscalacoesPendentes] = useState(0);
  const [weeklyAppts, setWeeklyAppts] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clienteId) { setLoading(false); return; }
    let active = true;
    (async () => {
      setLoading(true);
      const [escResp, agResp] = await Promise.all([
        supabase.from("escalacoes").select("*").eq("cliente_id", clienteId).order("criado_em", { ascending: false }),
        supabase.from("agendamentos").select("*").eq("cliente_id", clienteId),
      ]);
      if (!active) return;

      const escRows = escResp.data || [];
      const escMapped: Escalacao[] = escRows.slice(0, 5).map((r: any) => ({
        id: r.id,
        paciente: r.paciente ?? r.nome_paciente ?? "—",
        hora: r.criado_em ? new Date(r.criado_em).toLocaleString("pt-PT") : "—",
        status: (r.estado ?? r.status ?? "pendente") as "pendente" | "resolvido",
      }));
      setEscalacoes(escMapped);
      setEscalacoesPendentes(escRows.filter((r: any) => (r.estado ?? r.status) === "pendente").length);

      const agRows = agResp.data || [];
      setAgendamentosCount(agRows.length);

      // pending tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split("T")[0];
      const pend: PendingAppt[] = agRows
        .filter((r: any) => {
          const status = (r.estado ?? r.status ?? "").toLowerCase();
          if (!status.includes("pend")) return false;
          const dt = r.data_marcacao ? new Date(r.data_marcacao).toISOString().split("T")[0] : "";
          return dt === tomorrowStr;
        })
        .slice(0, 4)
        .map((r: any) => {
          const dt = r.data_marcacao ? new Date(r.data_marcacao) : null;
          return {
            id: r.id,
            nome: r.paciente ?? r.nome_paciente ?? "—",
            tipo: r.tipo ?? r.servico ?? "Consulta",
            hora: dt ? dt.toTimeString().slice(0, 5) : "—",
          };
        });
      setPendentes(pend);

      // weekly appointments — last 8 weeks
      const weeks: { name: string; value: number }[] = [];
      const now = new Date();
      for (let i = 7; i >= 0; i--) {
        const start = new Date(now);
        start.setDate(now.getDate() - (i + 1) * 7);
        const end = new Date(now);
        end.setDate(now.getDate() - i * 7);
        const count = agRows.filter((r: any) => {
          if (!r.data_marcacao) return false;
          const d = new Date(r.data_marcacao);
          return d >= start && d < end;
        }).length;
        weeks.push({ name: `Sem ${8 - i}`, value: count });
      }
      setWeeklyAppts(weeks);

      setLoading(false);
    })();
    return () => { active = false; };
  }, [clienteId]);

  const markResolved = async (id: number | string) => {
    const { error } = await supabase.from("escalacoes").update({ estado: "resolvido" }).eq("id", id);
    if (error) { toast.error("Erro ao actualizar."); return; }
    setEscalacoes(prev => prev.map(e => e.id === id ? { ...e, status: "resolvido" } : e));
    setEscalacoesPendentes(p => Math.max(0, p - 1));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 rounded bg-muted animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />)}
        </div>
      </div>
    );
  }

  const kpis = [
    { label: "Agendamentos Este Mês", value: agendamentosCount, icon: CalendarCheck, trend: "Total acumulado", trendColor: "text-emerald-400" },
    { label: "No-Shows Evitados", value: 0, icon: AlertTriangle, trend: "Este mês", trendColor: "text-primary" },
    { label: "Escalações Pendentes", value: escalacoesPendentes, icon: TrendingUp, badge: true, badgeColor: escalacoesPendentes > 0 ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", badgeText: escalacoesPendentes > 0 ? `${escalacoesPendentes} pendentes` : "Tudo resolvido" },
    { label: "Próxima Faturação", value: 129, icon: CreditCard, isText: true, displayText: "—", badge: true, badgeColor: "bg-primary/20 text-primary border-primary/30", badgeText: "Em breve" },
  ];

  return (
    <FadeIn>
      <h2 className="font-display text-2xl font-bold mb-6">Visão Geral</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi, i) => (
          <div key={i} className="gradient-border rounded-xl p-6 bg-card transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] hover:border-primary/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <kpi.icon size={20} className="text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">{kpi.label}</span>
            </div>
            <p className="font-display text-2xl font-bold mb-1">
              {kpi.isText ? kpi.displayText : <NumberTicker value={kpi.value} />}
            </p>
            {kpi.trend && <p className={`text-xs ${kpi.trendColor}`}>{kpi.trend}</p>}
            {kpi.badge && (
              <Badge className={`text-[10px] mt-1 ${kpi.badgeColor}`}>
                {kpi.badgeText}
              </Badge>
            )}
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="gradient-border rounded-xl p-6 bg-card transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]">
          <h3 className="font-display font-semibold mb-4">Agendamentos por Semana</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyAppts}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,20%,18%)" />
                <XAxis dataKey="name" stroke="hsl(215,15%,60%)" fontSize={12} />
                <YAxis stroke="hsl(215,15%,60%)" fontSize={12} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Bar dataKey="value" fill="hsl(216,100%,56%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="gradient-border rounded-xl p-6 bg-card transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]">
          <h3 className="font-display font-semibold mb-4">Taxa de Comparência (%)</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyAttendance}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,20%,18%)" />
                <XAxis dataKey="name" stroke="hsl(215,15%,60%)" fontSize={12} />
                <YAxis stroke="hsl(215,15%,60%)" fontSize={12} domain={[70, 100]} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Line type="monotone" dataKey="value" stroke="hsl(216,100%,56%)" strokeWidth={2} dot={{ fill: "hsl(216,100%,56%)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Confirmações Pendentes para Amanhã */}
      <div className="gradient-border rounded-xl p-6 bg-card transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] mb-8">
        <h3 className="font-display font-semibold mb-1">Confirmações Pendentes para Amanhã</h3>
        <p className="text-xs text-muted-foreground mb-4">Pacientes que ainda não confirmaram presença</p>
        {pendentes.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Todos os pacientes confirmaram presença para amanhã.</p>
        ) : (
        <div className="space-y-3">
          {pendentes.map(p => (
            <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{p.nome}</p>
                <p className="text-xs text-muted-foreground">{p.tipo} · {p.hora}</p>
              </div>
              <Badge className="text-[10px] bg-amber-500/20 text-amber-400 border-amber-500/30">Aguarda confirmação</Badge>
              <Button variant="outline" size="sm" className="text-xs shrink-0">
                <Phone size={14} className="mr-1" /> Contactar
              </Button>
            </div>
          ))}
        </div>
        )}
      </div>

      {/* Bottom panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="gradient-border rounded-xl p-6 bg-card transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]">
          <h3 className="font-display font-semibold mb-4">Últimas Escalações</h3>
          {escalacoes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Sem escalações recentes.</p>
          ) : (
          <div className="space-y-3">
            {escalacoes.map(e => (
              <div key={e.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{e.paciente}</p>
                  <p className="text-xs text-muted-foreground">{e.hora}</p>
                </div>
                <Badge className={`text-[10px] ${e.status === "resolvido" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-amber-500/20 text-amber-400 border-amber-500/30"}`}>
                  {e.status === "resolvido" ? "Resolvido" : "Pendente"}
                </Badge>
                {e.status === "pendente" && (
                  <Button variant="outline" size="sm" className="text-xs active:scale-95 transition-transform duration-100" onClick={() => markResolved(e.id)}>
                    Marcar Resolvido
                  </Button>
                )}
              </div>
            ))}
          </div>
          )}
        </div>

        <div className="gradient-border rounded-xl p-6 bg-card transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]">
          <h3 className="font-display font-semibold mb-4">Atividade Recente</h3>
          {escalacoes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Sem atividade recente.</p>
          ) : (
          <div className="space-y-3">
            {escalacoes.map((e) => (
              <div key={e.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted">
                <Calendar size={16} className="text-primary mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{e.paciente} — {e.status === "resolvido" ? "resolvida" : "nova escalação"}</p>
                  <p className="text-xs text-muted-foreground mt-1">{e.hora}</p>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      </div>
    </FadeIn>
  );
}
