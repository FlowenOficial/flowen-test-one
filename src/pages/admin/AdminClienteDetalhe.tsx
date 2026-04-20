import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import FadeIn from "@/components/FadeIn";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard } from "lucide-react";
import { mockClients } from "./adminData";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  TODAS_SECCOES, getConfigSeccoes, saveConfigSeccoes, type ConfigSeccoes, type Seccao,
} from "@/lib/seccoes";

type PlanOption = "Prime" | "Scale" | "Executive";

const mockPayments = [
  { mes: "Março 2026", valor: "€199", estado: "Pago" },
  { mes: "Fevereiro 2026", valor: "€199", estado: "Pago" },
  { mes: "Janeiro 2026", valor: "€199", estado: "Pago" },
  { mes: "Dezembro 2025", valor: "€199", estado: "Pago" },
];

const mockEscalacoes = [
  { paciente: "Maria Santos", motivo: "Receita urgente", data: "12 Abr, 14:32", status: "pendente" },
  { paciente: "João Costa", motivo: "Faturação incorreta", data: "11 Abr, 13:15", status: "resolvido" },
  { paciente: "Ana Silva", motivo: "Alteração de horário", data: "10 Abr, 11:40", status: "resolvido" },
  { paciente: "Pedro Reis", motivo: "Dúvida tratamento", data: "09 Abr, 16:22", status: "resolvido" },
];

const planBadgeClass = (p: string) =>
  p === "Executive" ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
    : p === "Scale" ? "bg-primary/20 text-primary border-primary/30"
    : "bg-muted text-muted-foreground";

const seccaoGroups: { label: string; tipo: Seccao["tipo"] }[] = [
  { label: "Navegação Principal", tipo: "sidebar_principal" },
  { label: "Área de Conta", tipo: "sidebar_conta" },
  { label: "Funcionalidades", tipo: "sidebar_feature" },
];

export default function AdminClienteDetalhe() {
  const { id } = useParams();
  const client = mockClients.find(c => c.id === Number(id));
  const [estado, setEstado] = useState(client?.estado || "Ativo");
  const [plano, setPlano] = useState<PlanOption>(client?.plano || "Prime");
  const [selectedPlan, setSelectedPlan] = useState<PlanOption>(plano);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Section control state
  const [seccoes, setSeccoes] = useState<ConfigSeccoes>(() => getConfigSeccoes(Number(id)));

  if (!client) return <div className="p-8 text-center text-muted-foreground">Cliente não encontrado.</div>;

  const confirmPlanChange = () => {
    setPlano(selectedPlan);
    localStorage.setItem(`cliente_plano_${client.id}`, selectedPlan.toLowerCase());

    const key = `cliente_notificacoes_${client.id}`;
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    existing.unshift({
      id: Date.now().toString(),
      tipo: "plano_actualizado",
      titulo: "Plano actualizado",
      mensagem: `O teu plano foi actualizado para ${selectedPlan}. As novas funcionalidades já estão disponíveis.`,
      lida: false,
      data: "agora",
    });
    localStorage.setItem(key, JSON.stringify(existing));

    if (client.id === 1) localStorage.setItem("flowen_current_plan", selectedPlan.toLowerCase());

    toast.success(`Plano da ${client.clinica} actualizado para ${selectedPlan} com sucesso.`);
    setConfirmOpen(false);
  };

  const toggleSeccao = (seccaoId: string) => {
    setSeccoes(prev => ({
      ...prev,
      [seccaoId]: { ...prev[seccaoId], activa: !prev[seccaoId]?.activa },
    }));
  };

  const setSeccaoModo = (seccaoId: string, modo: "ocultar" | "em_breve") => {
    setSeccoes(prev => ({
      ...prev,
      [seccaoId]: { ...prev[seccaoId], modo },
    }));
  };

  const saveSeccoes = () => {
    saveConfigSeccoes(client.id, seccoes);
    toast.success(`Secções actualizadas para ${client.clinica}`);
  };

  return (
    <FadeIn>
      <Link to="/admin/clientes">
        <Button variant="ghost" size="sm" className="mb-4"><ArrowLeft size={16} /> Voltar</Button>
      </Link>
      <div className="flex items-center gap-3 mb-6">
        <h2 className="font-display text-2xl font-bold">{client.clinica}</h2>
        <Badge className={`text-[10px] ${planBadgeClass(plano)}`}>{plano}</Badge>
        <Badge className={`text-[10px] ${estado === "Ativo" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}`}>{estado}</Badge>
      </div>

      {/* Section Control Card */}
      <div className="gradient-border rounded-xl p-6 bg-card mb-6">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h3 className="font-display font-semibold">Controlo de Secções do Dashboard</h3>
            <p className="text-xs text-muted-foreground">Activa ou desactiva secções individuais para esta clínica</p>
          </div>
          <Button size="sm" onClick={saveSeccoes}>Guardar Alterações</Button>
        </div>
        <div className="space-y-6 mt-4">
          {seccaoGroups.map(group => {
            const items = TODAS_SECCOES.filter(s => s.tipo === group.tipo);
            return (
              <div key={group.tipo}>
                <h4 className="text-sm font-semibold text-muted-foreground mb-3">{group.label}</h4>
                <div className="space-y-3">
                  {items.map(s => {
                    const cfg = seccoes[s.id] || { activa: true, modo: "em_breve" as const };
                    return (
                      <div key={s.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted">
                        <Switch checked={cfg.activa} onCheckedChange={() => toggleSeccao(s.id)} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{s.label}</p>
                          <p className="text-xs text-muted-foreground">{s.descricao}</p>
                        </div>
                        <Badge className={`text-[10px] ${cfg.activa ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}`}>
                          {cfg.activa ? "Activo" : "Inactivo"}
                        </Badge>
                        {!cfg.activa && (
                          <Select value={cfg.modo} onValueChange={(v) => setSeccaoModo(s.id, v as "ocultar" | "em_breve")}>
                            <SelectTrigger className="w-48">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ocultar">Ocultar completamente</SelectItem>
                              <SelectItem value="em_breve">Mostrar como Em Breve</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="gradient-border rounded-xl p-6 bg-card space-y-3">
            <h3 className="font-display font-semibold">Informações</h3>
            <div className="text-sm space-y-2">
              <p><span className="text-muted-foreground">Email:</span> {client.email}</p>
              <p><span className="text-muted-foreground">Telefone:</span> {client.telefone}</p>
              <p><span className="text-muted-foreground">Data de Adesão:</span> {client.dataAdesao}</p>
              <p><span className="text-muted-foreground">Plano:</span> {plano}</p>
            </div>
          </div>
          <div className="gradient-border rounded-xl p-6 bg-card space-y-3">
            <h3 className="font-display font-semibold">Subscrição</h3>
            <div className="text-sm space-y-2">
              <p><span className="text-muted-foreground">Estado:</span> <Badge className={`text-[10px] ${estado === "Ativo" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}`}>{estado}</Badge></p>
              <p><span className="text-muted-foreground">Próxima Faturação:</span> {client.proximaFaturacao}</p>
              <p><span className="text-muted-foreground">Valor:</span> €{plano === "Executive" ? "349" : plano === "Scale" ? "199" : "129"}</p>
              <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                <CreditCard size={16} />
                <span>Método de pagamento não configurado</span>
              </div>
            </div>
            <Button variant={estado === "Ativo" ? "destructive" : "default"} size="sm" onClick={() => setEstado(e => e === "Ativo" ? "Suspenso" : "Ativo")}>
              {estado === "Ativo" ? "Suspender" : "Reativar"}
            </Button>

            {/* Plan Management */}
            <div className="pt-4 border-t border-border mt-4">
              <h4 className="text-sm font-semibold mb-3">Gestão de Plano</h4>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm text-muted-foreground">Plano Actual:</span>
                <Badge className={`text-[10px] ${planBadgeClass(plano)}`}>{plano}</Badge>
              </div>
              <div className="flex items-center gap-3">
                <Select value={selectedPlan} onValueChange={(v) => setSelectedPlan(v as PlanOption)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Prime">Prime</SelectItem>
                    <SelectItem value="Scale">Scale</SelectItem>
                    <SelectItem value="Executive">Executive</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  disabled={selectedPlan === plano}
                  onClick={() => setConfirmOpen(true)}
                >
                  Aplicar Alteração
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="gradient-border rounded-xl p-6 bg-card">
            <h3 className="font-display font-semibold mb-4">Escalações Recentes</h3>
            <div className="space-y-3">
              {mockEscalacoes.map((e, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{e.paciente}</p>
                    <p className="text-xs text-muted-foreground">{e.motivo} · {e.data}</p>
                  </div>
                  <Badge className={`text-[10px] ${e.status === "resolvido" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-amber-500/20 text-amber-400 border-amber-500/30"}`}>
                    {e.status === "resolvido" ? "Resolvido" : "Pendente"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
          <div className="gradient-border rounded-xl p-6 bg-card">
            <h3 className="font-display font-semibold mb-4">Histórico de Pagamentos</h3>
            <div className="space-y-3">
              {mockPayments.map((p, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <span className="text-sm">{p.mes}</span>
                  <span className="text-sm font-medium">{p.valor}</span>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">{p.estado}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Confirm plan change dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar alteração de plano</DialogTitle>
            <DialogDescription>
              Tens a certeza que queres mudar o plano da {client.clinica} de {plano} para {selectedPlan}? Esta alteração é imediata e o cliente terá acesso às novas funcionalidades de imediato.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end mt-4">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancelar</Button>
            <Button onClick={confirmPlanChange}>Confirmar Alteração</Button>
          </div>
        </DialogContent>
      </Dialog>
    </FadeIn>
  );
}
