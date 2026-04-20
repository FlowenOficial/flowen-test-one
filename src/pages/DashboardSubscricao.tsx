import FadeIn from "@/components/FadeIn";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePlan, PLAN_LABELS } from "@/contexts/PlanContext";
import { CreditCard, Receipt } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardSubscricao() {
  const { currentPlan } = usePlan();
  const { plano } = useAuth();
  const planoReal = (plano?.toLowerCase() as keyof typeof PLAN_LABELS) || currentPlan;

  return (
    <FadeIn>
      <h2 className="font-display text-2xl font-bold mb-6">Subscrição</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="gradient-border rounded-xl p-6 bg-card space-y-4">
          <h3 className="font-display font-semibold">Plano Atual</h3>
          <div className="flex items-center gap-3">
            <Badge className="bg-primary/20 text-primary border-primary/30">{PLAN_LABELS[planoReal] || PLAN_LABELS[currentPlan]}</Badge>
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Ativo</Badge>
          </div>
          {planoReal === "prime" && (
            <Button variant="hero" size="sm" disabled>Upgrade para Scale</Button>
          )}
          {planoReal === "scale" && (
            <Button variant="hero" size="sm" disabled>Upgrade para Executive</Button>
          )}
        </div>
        <div className="gradient-border rounded-xl p-6 bg-card space-y-4">
          <h3 className="font-display font-semibold">Método de Pagamento</h3>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              <CreditCard size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Método de pagamento não configurado</p>
              <p className="text-xs text-muted-foreground">Será disponibilizado em breve.</p>
            </div>
          </div>
          <Button variant="outline" size="sm" disabled>Gerir Pagamento</Button>
        </div>
      </div>

      <div className="gradient-border rounded-xl bg-card">
        <h3 className="font-display font-semibold p-6 pb-0">Histórico de Pagamentos</h3>
        <EmptyState
          icon={Receipt}
          title="Sem pagamentos registados"
          description="O histórico de pagamentos aparecerá aqui quando o Stripe estiver configurado."
        />
      </div>
    </FadeIn>
  );
}
