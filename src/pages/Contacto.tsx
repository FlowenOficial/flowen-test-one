import { useState } from "react";
import FadeIn from "@/components/FadeIn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { MessageCircle, Send, Mail, MapPin, Clock, Phone, CheckCircle2, Loader2 } from "lucide-react";

const Contacto = () => {
  const [form, setForm] = useState({ nome: "", email: "", telefone: "", assunto: "", mensagem: "" });
  const [privacy, setPrivacy] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const touch = (field: string) => setTouched(p => ({ ...p, [field]: true }));
  const errors = {
    nome: touched.nome && !form.nome.trim(),
    email: touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email),
    mensagem: touched.mensagem && form.mensagem.trim().length < 20,
    privacy: touched.privacy && !privacy,
  };

  const canSubmit = form.nome.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) && form.mensagem.trim().length >= 20 && privacy;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ nome: true, email: true, mensagem: true, privacy: true });
    if (!canSubmit) return;
    setStatus("sending");
    try {
      const res = await fetch("https://formspree.io/f/mvzdkpeb", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.nome, email: form.email, phone: form.telefone, subject: form.assunto, message: form.mensagem }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="container max-w-lg">
          <FadeIn>
            <div className="text-center p-8 rounded-xl gradient-border bg-card">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} className="text-emerald-400" />
              </div>
              <h2 className="font-display text-2xl font-bold mb-2">Mensagem enviada com sucesso!</h2>
              <p className="text-muted-foreground">Entraremos em contacto em breve.</p>
            </div>
          </FadeIn>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container">
        <FadeIn>
          <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-3">Contacto</p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">Fale connosco.</h1>
          <p className="text-muted-foreground text-lg mb-12">Preencha o formulário ou contacte-nos diretamente.</p>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Form (60%) */}
          <div className="lg:col-span-3">
            <FadeIn delay={0.1}>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome completo *</Label>
                  <Input id="nome" placeholder="O seu nome" value={form.nome}
                    onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                    onBlur={() => touch("nome")}
                    className={errors.nome ? "border-destructive" : ""} required />
                  {errors.nome && <p className="text-xs text-destructive">Nome é obrigatório.</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" placeholder="email@exemplo.pt" value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      onBlur={() => touch("email")}
                      className={errors.email ? "border-destructive" : ""} required />
                    {errors.email && <p className="text-xs text-destructive">Email inválido.</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input id="telefone" type="tel" placeholder="+351 ..." value={form.telefone}
                      onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Assunto</Label>
                  <Select value={form.assunto} onValueChange={v => setForm(f => ({ ...f, assunto: v }))}>
                    <SelectTrigger><SelectValue placeholder="Selecione um assunto" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pacotes">Quero saber mais sobre os pacotes</SelectItem>
                      <SelectItem value="tecnico">Tenho uma questão técnica</SelectItem>
                      <SelectItem value="demo">Quero uma demonstração</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mensagem">Mensagem *</Label>
                  <Textarea id="mensagem" placeholder="Descreva o que pretende automatizar... (mínimo 20 caracteres)" rows={5} value={form.mensagem}
                    onChange={e => setForm(f => ({ ...f, mensagem: e.target.value }))}
                    onBlur={() => touch("mensagem")}
                    className={errors.mensagem ? "border-destructive" : ""} required />
                  {errors.mensagem && <p className="text-xs text-destructive">Mínimo 20 caracteres.</p>}
                </div>

                <div className="flex items-start gap-2">
                  <Checkbox id="privacy" checked={privacy}
                    onCheckedChange={(c) => { setPrivacy(!!c); touch("privacy"); }} />
                  <Label htmlFor="privacy" className="text-sm text-muted-foreground leading-tight cursor-pointer">
                    Concordo com a{" "}
                    <a href="/privacidade" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      política de privacidade
                    </a>{" "}
                    *
                  </Label>
                </div>
                {errors.privacy && <p className="text-xs text-destructive">Deve concordar com a política de privacidade.</p>}

                {status === "error" && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive">
                    Ocorreu um erro. Tenta novamente ou contacta-nos directamente.
                  </div>
                )}

                <Button variant="hero" size="lg" type="submit" disabled={status === "sending"} className="w-full relative overflow-hidden">
                  <span className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12" />
                  <span className="relative z-10 flex items-center gap-2">
                    {status === "sending" ? <><Loader2 size={18} className="animate-spin" /> A enviar...</> : <><Send size={18} /> Enviar Mensagem</>}
                  </span>
                </Button>
              </form>
            </FadeIn>
          </div>

          {/* Info (40%) */}
          <div className="lg:col-span-2">
            <FadeIn delay={0.2}>
              <div className="space-y-6">
                <div className="gradient-border rounded-xl p-6 bg-card space-y-5">
                  <div className="flex items-start gap-3">
                    <Mail size={18} className="text-primary mt-0.5" />
                    <div><p className="text-sm font-medium">Email</p><p className="text-sm text-muted-foreground">centralflowen@gmail.com</p></div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone size={18} className="text-primary mt-0.5" />
                    <div><p className="text-sm font-medium">WhatsApp</p><p className="text-sm text-muted-foreground">+351 931 838 188</p></div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-primary mt-0.5" />
                    <div><p className="text-sm font-medium">Localização</p><p className="text-sm text-muted-foreground">Lisboa, Portugal</p></div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock size={18} className="text-primary mt-0.5" />
                    <div><p className="text-sm font-medium">Horário</p><p className="text-sm text-muted-foreground">Segunda a Sexta, 9h-20h</p></div>
                  </div>
                </div>

                <div className="gradient-border rounded-xl p-6 bg-card flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Clock size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Resposta garantida</p>
                    <p className="text-sm text-muted-foreground">Em 24h úteis</p>
                  </div>
                </div>

                <div className="text-center">
                  <a href="https://wa.me/351931838188" target="_blank" rel="noopener noreferrer">
                    <Button variant="heroOutline" size="lg" className="w-full">
                      <MessageCircle size={18} /> WhatsApp
                    </Button>
                  </a>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contacto;
