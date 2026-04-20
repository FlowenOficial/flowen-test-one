import { useState } from "react";
import FadeIn from "@/components/FadeIn";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Plus, LifeBuoy, Loader2 } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardSupport() {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !desc.trim()) return;
    setStatus("sending");
    try {
      const res = await fetch("https://formspree.io/f/xjgjrjde", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ assunto: title, mensagem: desc, email: user?.email || "—" }),
      });
      if (res.ok) {
        setStatus("success");
        setTitle("");
        setDesc("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <FadeIn>
      <h2 className="font-display text-2xl font-bold mb-6">Suporte</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="gradient-border rounded-xl p-6 bg-card">
          <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
            <Plus size={18} className="text-primary" /> Novo Ticket
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input placeholder="Assunto do problema" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Textarea placeholder="Descreva o problema em detalhe..." rows={4} value={desc} onChange={(e) => setDesc(e.target.value)} />
            <Button variant="hero" type="submit" className="w-full" disabled={status === "sending"}>
              {status === "sending" ? <><Loader2 size={16} className="animate-spin mr-2" /> A enviar...</> : "Submeter Ticket"}
            </Button>
            {status === "success" && (
              <p className="text-xs text-emerald-400">Ticket enviado com sucesso! Responderemos em breve.</p>
            )}
            {status === "error" && (
              <p className="text-xs text-destructive">Erro ao enviar. Tenta novamente.</p>
            )}
          </form>
          <p className="text-xs text-muted-foreground mt-3">
            A IA tentará resolver automaticamente. Se não conseguir, será agendada uma reunião.
          </p>
        </div>
        <div className="lg:col-span-2">
          <h3 className="font-display font-semibold mb-2">Os Seus Tickets</h3>
          <div className="gradient-border rounded-xl bg-card">
            <EmptyState
              icon={LifeBuoy}
              title="Sem tickets abertos"
              description="Submete um ticket acima e a nossa equipa responderá em breve."
            />
          </div>
        </div>
      </div>
    </FadeIn>
  );
}
