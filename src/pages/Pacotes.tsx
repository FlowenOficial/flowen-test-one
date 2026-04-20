import FadeIn from "@/components/FadeIn";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useRef, useState } from "react";
import {
  Bot, Calendar, Bell, FileText,
  UserCheck, Heart, Crown, Phone,
  Shield, CheckCircle2, ArrowRight, Clock
} from "lucide-react";

const SpotlightCard = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (rect) setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };
  return (
    <div ref={ref} onMouseMove={handleMouseMove} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      className={`relative overflow-hidden ${className}`}>
      {hovered && (
        <div className="absolute pointer-events-none" style={{ left: pos.x - 150, top: pos.y - 150, width: 300, height: 300, background: "radial-gradient(circle, hsl(216 100% 56% / 0.15), transparent 70%)" }} />
      )}
      {children}
    </div>
  );
};

const packages = [
  {
    name: "Prime", subtitle: "Organização Inicial",
    price: "€199/mês",
    setup: "+ €799 de setup (única vez)",
    features: [
      { icon: Bot, text: "Agente de Atendimento Inteligente (24/7)" },
      { icon: Calendar, text: "Agente de Agendamento Automático" },
      { icon: Bell, text: "Agente Anti-No-Show (Lembretes)" },
      { icon: FileText, text: "Agente de Relatórios Mensais" },
    ],
    result: "Reduza no-shows e automatize o atendimento básico.",
    highlight: false, unavailable: false,
  },
  {
    name: "Scale", subtitle: "Crescimento Estruturado", includes: "Inclui tudo do Prime +",
    price: "€299/mês",
    setup: "+ €899 de setup (única vez)",
    features: [
      { icon: UserCheck, text: "Agente de Gestão de Prioridades e Urgências" },
      { icon: Heart, text: "Agente de Follow-Up e Relacionamento" },
    ],
    result: "Operações escaláveis e melhor retenção de clientes.",
    highlight: true, unavailable: false,
  },
  {
    name: "Executive", subtitle: "Controlo Total", includes: "Inclui tudo do Scale +",
    features: [
      { icon: Crown, text: "Secretária Virtual V3 completa" },
      { icon: Phone, text: "Chamadas WhatsApp + Fixo integradas" },
      { icon: Shield, text: "Faturação MBway com verificação antes do agendamento" },
      { icon: Calendar, text: "Google Calendar com sistema anti-conflitos" },
      { icon: Bell, text: "Lembretes automáticos e follow-ups" },
      { icon: UserCheck, text: "Escalação para humano quando necessário" },
      { icon: FileText, text: "Relatórios financeiros automatizados" },
    ],
    result: "Operação de negócio quase autónoma.",
    highlight: false, unavailable: true,
  },
];

const Pacotes = () => (
  <div className="min-h-screen pt-24 pb-16">
    <div className="container px-4">
      <FadeIn>
        <div className="max-w-2xl mb-16">
          <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-3">Pacotes</p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
            Escolha o nível de automação certo para o seu negócio.
          </h1>
          <p className="text-muted-foreground text-lg">
            Cada pacote é desenhado para uma fase diferente de maturidade operacional.
          </p>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {packages.map((pkg, i) => (
          <FadeIn key={i} delay={i * 0.1}>
            <SpotlightCard className="rounded-xl h-full">
              <div className={`rounded-xl p-8 h-full flex flex-col ${
                pkg.unavailable ? "opacity-60" : ""
              } ${
                pkg.highlight
                  ? "bg-primary/10 border-2 border-primary/50 glow-blue"
                  : "gradient-border bg-card"
              }`}>
                {pkg.unavailable && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-4">
                    <Clock size={14} className="text-amber-400" />
                    <span className="text-xs font-medium text-amber-400">⏳ Temporariamente Indisponível</span>
                  </div>
                )}
                {pkg.highlight && (
                  <span className="text-xs font-semibold text-primary bg-primary/20 px-3 py-1 rounded-full self-start mb-4">
                    Mais Popular
                  </span>
                )}
                <h2 className="font-display text-3xl font-bold mb-1">{pkg.name}</h2>
                <p className="text-sm text-muted-foreground mb-6">{pkg.subtitle}</p>
                {!pkg.unavailable && pkg.price && (
                  <div className="mb-5">
                    <p className="font-display text-4xl font-bold text-primary">{pkg.price}</p>
                    <p className="text-xs text-muted-foreground mt-1">{pkg.setup}</p>
                  </div>
                )}
                {pkg.includes && (
                  <p className="text-xs text-primary font-medium mb-4">{pkg.includes}</p>
                )}
                <div className="flex-1 space-y-3 mb-6">
                  {pkg.features.map((f, j) => (
                    <div key={j} className="flex items-start gap-3">
                      <f.icon size={16} className="text-primary mt-0.5 shrink-0" />
                      <span className="text-sm text-secondary-foreground">{f.text}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-start gap-2 p-4 rounded-lg bg-muted mb-6">
                  <CheckCircle2 size={16} className="text-primary mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">{pkg.result}</span>
                </div>
                {pkg.unavailable ? (
                  <Button variant="heroOutline" className="w-full" size="lg" disabled title="O plano Executive estará disponível em breve.">
                    Em Breve
                  </Button>
                ) : (
                  <Link to="/contacto">
                    <Button variant={pkg.highlight ? "hero" : "heroOutline"} className="w-full active:scale-95 transition-transform duration-100" size="lg">
                      Falar Connosco <ArrowRight size={18} />
                    </Button>
                  </Link>
                )}
              </div>
            </SpotlightCard>
          </FadeIn>
        ))}
      </div>
    </div>
  </div>
);

export default Pacotes;
