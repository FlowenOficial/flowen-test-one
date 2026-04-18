import { useState, useEffect } from "react";
import FadeIn from "@/components/FadeIn";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, CreditCard, Bell, Settings } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Notification {
  id: string | number;
  type: "escalacao" | "pagamento" | "sistema" | "plano_actualizado";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const iconMap = {
  escalacao: AlertTriangle,
  pagamento: CreditCard,
  sistema: Settings,
  plano_actualizado: Bell,
};

function mapTipo(t: string | undefined): Notification["type"] {
  if (t === "escalacao") return "escalacao";
  if (t === "pagamento") return "pagamento";
  if (t === "plano_actualizado") return "plano_actualizado";
  return "sistema";
}

export default function DashboardNotificacoes() {
  const { clienteId } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("todas");

  useEffect(() => {
    if (!clienteId) { setLoading(false); return; }
    let active = true;
    (async () => {
      setLoading(true);
      const { data: rows, error } = await supabase
        .from("notificacoes")
        .select("*")
        .eq("cliente_id", clienteId)
        .order("criado_em", { ascending: false });
      if (!active) return;
      if (error) { console.error(error); setLoading(false); return; }
      const mapped: Notification[] = (rows || []).map((r: any) => ({
        id: r.id,
        type: mapTipo(r.tipo),
        title: r.titulo ?? "Notificação",
        message: r.mensagem ?? "",
        time: r.criado_em ? new Date(r.criado_em).toLocaleString("pt-PT") : "—",
        read: !!r.lida,
      }));
      setNotifications(mapped);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [clienteId]);

  const markAllRead = async () => {
    if (!clienteId) return;
    const { error } = await supabase.from("notificacoes").update({ lida: true }).eq("cliente_id", clienteId);
    if (error) { toast.error("Erro ao actualizar."); return; }
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success("Todas as notificações marcadas como lidas.");
  };

  const filtered = tab === "todas" ? notifications : notifications.filter(n => {
    if (tab === "escalacoes") return n.type === "escalacao";
    if (tab === "pagamentos") return n.type === "pagamento";
    return n.type === "sistema" || n.type === "plano_actualizado";
  });

  return (
    <FadeIn>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold">Notificações</h2>
        <Button variant="outline" size="sm" onClick={markAllRead}>
          <Bell size={14} /> Marcar todas como lidas
        </Button>
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="escalacoes">Escalações</TabsTrigger>
          <TabsTrigger value="pagamentos">Pagamentos</TabsTrigger>
          <TabsTrigger value="sistema">Sistema</TabsTrigger>
        </TabsList>
        <TabsContent value={tab}>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState icon={Bell} title="Nenhuma notificação" description="Estás a par de tudo. Novas notificações aparecerão aqui." />
          ) : (
          <div className="space-y-2">
            {filtered.map(n => {
              const Icon = iconMap[n.type];
              return (
                <div key={n.id} className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${n.read ? "bg-card border-border" : "bg-primary/5 border-primary/20"}`}>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${n.type === "escalacao" ? "bg-amber-500/10" : n.type === "pagamento" ? "bg-emerald-500/10" : "bg-primary/10"}`}>
                    <Icon size={16} className={n.type === "escalacao" ? "text-amber-400" : n.type === "pagamento" ? "text-emerald-400" : "text-primary"} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{n.time}</span>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                </div>
              );
            })}
          </div>
          )}
        </TabsContent>
      </Tabs>
    </FadeIn>
  );
}
