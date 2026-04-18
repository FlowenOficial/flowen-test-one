import { useState, useEffect } from "react";
import FadeIn from "@/components/FadeIn";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NumberTicker } from "@/components/NumberTicker";
import { FileText, Download, BarChart3 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import EmptyState from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

const chartStyle = { background: "hsl(220,30%,8%)", border: "1px solid hsl(220,20%,18%)", borderRadius: 8 };

interface Report {
  id: string | number;
  mes: string;
  consultas: number;
  comparencia: string;
  noShows: number;
  receita: string;
  estado: string;
  weeks: { name: string; c: number }[];
}

export default function DashboardRelatorios() {
  const { clienteId } = useAuth();
  const [year, setYear] = useState("2026");
  const [detail, setDetail] = useState<Report | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clienteId) { setLoading(false); return; }
    let active = true;
    (async () => {
      setLoading(true);
      const { data: rows, error } = await supabase
        .from("relatorios_mensais")
        .select("*")
        .eq("cliente_id", clienteId)
        .order("created_at", { ascending: false });
      if (!active) return;
      if (error) { console.error(error); setLoading(false); return; }
      const mapped: Report[] = (rows || []).map((r: any) => ({
        id: r.id,
        mes: r.mes ?? r.periodo ?? "—",
        consultas: r.consultas ?? 0,
        comparencia: r.comparencia ? `${r.comparencia}%` : "—",
        noShows: r.no_shows ?? r.noshows ?? 0,
        receita: r.receita ? `€${r.receita}` : "—",
        estado: r.estado ?? "disponivel",
        weeks: Array.isArray(r.weeks) ? r.weeks : [],
      }));
      setReports(mapped);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [clienteId]);

  const current = reports[0];
  const kpis = current ? [
    { label: "Consultas Realizadas", value: current.consultas },
    { label: "Taxa de Comparência", value: parseInt(current.comparencia) || 0, suffix: "%" },
    { label: "No-Shows Evitados", value: current.noShows },
    { label: "Receita Estimada", value: parseInt(current.receita.replace(/[^0-9]/g, "")) || 0, prefix: "€" },
  ] : [];

  return (
    <FadeIn>
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-2xl font-bold">Relatórios Mensais</h2>
          {current && <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">Relatório de {current.mes} disponível</Badge>}
        </div>
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="2024">2024</SelectItem>
            <SelectItem value="2025">2025</SelectItem>
            <SelectItem value="2026">2026</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      ) : reports.length === 0 ? (
        <EmptyState icon={FileText} title="Sem relatórios disponíveis" description="Os relatórios mensais aparecerão aqui assim que estiverem prontos." />
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {kpis.map((k, i) => (
              <div key={i} className="gradient-border rounded-xl p-6 bg-card transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BarChart3 size={20} className="text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">{k.label}</span>
                </div>
                <p className="font-display text-2xl font-bold"><NumberTicker value={k.value} prefix={k.prefix} suffix={k.suffix} /></p>
              </div>
            ))}
          </div>

          {/* Chart */}
          {current && current.weeks.length > 0 && (
            <div className="gradient-border rounded-xl p-6 bg-card mb-8">
              <h3 className="font-display font-semibold mb-4">Consultas por Semana — {current.mes}</h3>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={current.weeks}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,20%,18%)" />
                    <XAxis dataKey="name" stroke="hsl(215,15%,60%)" fontSize={12} />
                    <YAxis stroke="hsl(215,15%,60%)" fontSize={12} />
                    <Tooltip contentStyle={chartStyle} />
                    <Bar dataKey="c" fill="hsl(216,100%,56%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Reports table */}
          <div className="gradient-border rounded-xl bg-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-left">
                  <th className="p-4 font-medium">Mês</th>
                  <th className="p-4 font-medium">Consultas</th>
                  <th className="p-4 font-medium hidden sm:table-cell">Comparência</th>
                  <th className="p-4 font-medium hidden sm:table-cell">No-Shows Evitados</th>
                  <th className="p-4 font-medium hidden md:table-cell">Receita Est.</th>
                  <th className="p-4 font-medium">Estado</th>
                  <th className="p-4" />
                </tr>
              </thead>
              <tbody>
                {reports.map(r => (
                  <tr key={r.id} className="border-b border-border/50">
                    <td className="p-4 font-medium">{r.mes}</td>
                    <td className="p-4">{r.consultas}</td>
                    <td className="p-4 hidden sm:table-cell">{r.comparencia}</td>
                    <td className="p-4 hidden sm:table-cell">{r.noShows}</td>
                    <td className="p-4 hidden md:table-cell">{r.receita}</td>
                    <td className="p-4">
                      <Badge className={`text-[10px] ${r.estado === "disponivel" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-amber-500/20 text-amber-400 border-amber-500/30"}`}>
                        {r.estado === "disponivel" ? "Disponível" : "A gerar..."}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Button variant="outline" size="sm" disabled={r.estado !== "disponivel"} onClick={() => setDetail(r)}>Ver</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Detail Sheet */}
      <Sheet open={!!detail} onOpenChange={() => setDetail(null)}>
        <SheetContent className="bg-card border-border overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-display">{detail?.mes}</SheetTitle>
          </SheetHeader>
          {detail && (
            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted text-center">
                  <p className="font-display text-xl font-bold">{detail.consultas}</p>
                  <p className="text-xs text-muted-foreground">Consultas</p>
                </div>
                <div className="p-3 rounded-lg bg-muted text-center">
                  <p className="font-display text-xl font-bold">{detail.comparencia}</p>
                  <p className="text-xs text-muted-foreground">Comparência</p>
                </div>
                <div className="p-3 rounded-lg bg-muted text-center">
                  <p className="font-display text-xl font-bold">{detail.noShows}</p>
                  <p className="text-xs text-muted-foreground">No-Shows Evitados</p>
                </div>
                <div className="p-3 rounded-lg bg-muted text-center">
                  <p className="font-display text-xl font-bold">{detail.receita}</p>
                  <p className="text-xs text-muted-foreground">Receita Est.</p>
                </div>
              </div>
              {detail.weeks.length > 0 && (
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={detail.weeks}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,20%,18%)" />
                      <XAxis dataKey="name" stroke="hsl(215,15%,60%)" fontSize={11} />
                      <YAxis stroke="hsl(215,15%,60%)" fontSize={11} />
                      <Bar dataKey="c" fill="hsl(216,100%,56%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              <Button variant="outline" className="w-full" disabled>
                <Download size={16} /> Descarregar PDF
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </FadeIn>
  );
}
