import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import FadeIn from "@/components/FadeIn";
import AnimatedCounter from "@/components/AnimatedCounter";
import { motion } from "framer-motion";
import {
  AlertTriangle, CalendarOff, Users, TrendingDown,
  Zap, BarChart3, Scale, Shield,
  Bot, Calendar, Bell, FileText,
  UserCheck, Heart, Crown, Phone,
  ArrowRight, CheckCircle2, Quote, Star, Clock
} from "lucide-react";

/* ─── Typewriter ─── */
function Typewriter({ text, speed = 40 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState("");
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (idx < text.length) {
      const t = setTimeout(() => { setDisplayed(p => p + text[idx]); setIdx(i => i + 1); }, speed);
      return () => clearTimeout(t);
    }
  }, [idx, text, speed]);
  return <span>{displayed}<span className="animate-pulse">|</span></span>;
}

/* ─── Shimmer Button ─── */
const ShimmerButton = ({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { className?: string }) => (
  <button className={`relative overflow-hidden rounded-lg px-8 py-3 font-semibold transition-all active:scale-95 duration-100 ${className}`} {...props}>
    <span className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12" />
    <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
  </button>
);

/* ─── Aurora Background ─── */
const AuroraBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/15 blur-[120px] animate-[aurora1_8s_ease-in-out_infinite]" />
    <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-accent/10 blur-[100px] animate-[aurora2_10s_ease-in-out_infinite]" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-primary/8 blur-[80px] animate-[aurora3_12s_ease-in-out_infinite]" />
    <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
  </div>
);

/* ─── Infinite Scroll Banner ─── */
const metrics = ["89% taxa de comparência", "312 mensagens respondidas", "34 no-shows evitados", "94% taxa de confirmação", "€4.260 receita estimada", "99% taxa de resposta", "8 min tempo de resolução"];
const InfiniteScroll = () => (
  <div className="overflow-hidden border-y border-border bg-card/50 py-4">
    <div className="flex animate-[scroll_20s_linear_infinite] gap-8 whitespace-nowrap">
      {[...metrics, ...metrics].map((m, i) => (
        <span key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
          {m}
        </span>
      ))}
    </div>
  </div>
);

/* ─── Spotlight Card ─── */
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

const painPoints = [
  { icon: AlertTriangle, title: "Desorganização Operacional", desc: "Processos manuais, informação dispersa e equipas sobrecarregadas." },
  { icon: CalendarOff, title: "Cancelamentos e No-Shows", desc: "Perdas recorrentes por falta de sistemas de confirmação automatizados." },
  { icon: Users, title: "Sobrecarga Humana", desc: "Colaboradores a fazer tarefas que sistemas deveriam executar." },
  { icon: TrendingDown, title: "Sem Sistemas Escaláveis", desc: "Crescer significa contratar mais. E mais. E mais." },
];

const differentials = [
  { icon: Zap, title: "Método Proprietário", desc: "Framework testado e refinado em dezenas de negócios." },
  { icon: BarChart3, title: "Resultados Mensuráveis", desc: "Métricas claras de impacto desde o primeiro mês." },
  { icon: Scale, title: "Escalabilidade Real", desc: "Cresça sem aumentar proporcionalmente a equipa." },
  { icon: Shield, title: "Consultoria Verdadeira", desc: "Não vendemos software. Construímos sistemas sob medida." },
];

const stats = [
  { value: 89, suffix: "%", label: "Redução de no-shows" },
  { value: 40, suffix: "+", label: "Negócios automatizados" },
  { value: 12, suffix: "h", label: "Poupadas por semana" },
  { value: 98, suffix: "%", label: "Taxa de satisfação" },
];

const testimonials = [
  { quote: "A Flowen transformou completamente a forma como gerimos a nossa clínica. Passámos de 30% de faltas para menos de 5%.", name: "Dra. Ana Ferreira", role: "Diretora Clínica", company: "Clínica Saúde Plus", stars: 5 },
  { quote: "Antes da Flowen, perdíamos horas por dia em agendamentos manuais. Agora o sistema faz tudo sozinho, 24 horas por dia.", name: "Ricardo Santos", role: "CEO", company: "PhysioCenter", stars: 5 },
  { quote: "O ROI foi visível logo no primeiro mês. A equipa agora foca-se no que realmente importa: os nossos pacientes.", name: "Carla Mendes", role: "Gestora de Operações", company: "Dental Pro", stars: 5 },
];

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
    highlight: false, order: "order-2 md:order-1", unavailable: false,
  },
  {
    name: "Scale", subtitle: "Crescimento Estruturado", includes: "Inclui tudo do Prime +",
    price: "€299/mês",
    setup: "+ €899 de setup (única vez)",
    features: [
      { icon: UserCheck, text: "Agente de Gestão de Prioridades" },
      { icon: Heart, text: "Agente de Follow-Up e Relacionamento" },
    ],
    result: "Operações escaláveis e melhor retenção de clientes.",
    highlight: true, order: "order-1 md:order-2", unavailable: false,
  },
  {
    name: "Executive", subtitle: "Controlo Total", includes: "Inclui tudo do Scale +",
    features: [
      { icon: Crown, text: "Secretária Virtual V3 completa" },
      { icon: Phone, text: "Chamadas WhatsApp + Fixo" },
      { icon: Shield, text: "Faturação MBway + Verificação" },
      { icon: Calendar, text: "Google Calendar anti-conflitos" },
    ],
    result: "Operação de negócio quase autónoma.",
    highlight: false, order: "order-3", unavailable: true,
  },
];

const Index = () => {
  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <AuroraBackground />

        <div className="container relative z-10 pt-24 md:pt-24 px-4">
          <FadeIn>
            <div className="max-w-3xl">
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-medium mb-6 md:mb-8"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <Zap size={14} />
                Automação Operacional para Negócios
              </motion.div>
              <h1 className="font-display text-3xl sm:text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-6">
                Processos repetitivos{" "}
                <span className="gradient-text-animated">não são para humanos.</span>
                <br />
                Sistemas sim.
              </h1>
              <p className="text-base sm:text-xl text-muted-foreground max-w-xl mb-8 md:mb-10 leading-relaxed">
                <Typewriter text="Ajudamos clínicas e negócios locais a escalar sem contratar mais pessoal. Automação inteligente, sistemas sob medida." />
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link to="/pacotes" className="w-full sm:w-auto">
                  <ShimmerButton className="bg-primary text-primary-foreground glow-blue w-full sm:w-auto min-h-[48px]">
                    Ver Pacotes <ArrowRight size={18} />
                  </ShimmerButton>
                </Link>
                <Link to="/contacto" className="w-full sm:w-auto">
                  <ShimmerButton className="border border-primary/50 text-primary w-full sm:w-auto min-h-[48px]">
                    Falar Connosco
                  </ShimmerButton>
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:block"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-1.5">
            <motion.div className="w-1.5 h-1.5 rounded-full bg-primary" animate={{ y: [0, 16, 0] }} transition={{ duration: 2, repeat: Infinity }} />
          </div>
        </motion.div>
      </section>

      {/* Infinite Scroll Banner */}
      <InfiniteScroll />

      {/* Stats Bar */}
      <section className="py-12 md:py-16 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="text-center">
                  <div className="font-display text-3xl sm:text-5xl font-bold text-primary glow-text mb-2">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-16 md:py-24 border-b border-border">
        <div className="container px-4">
          <FadeIn>
            <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-3">O Problema</p>
            <h2 className="font-display text-2xl sm:text-4xl font-bold mb-4">O seu negócio está preso a processos manuais?</h2>
            <p className="text-muted-foreground max-w-lg mb-12 md:mb-16">A maioria dos negócios locais enfrenta os mesmos bloqueios operacionais.</p>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {painPoints.map((item, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <motion.div className="gradient-border rounded-xl p-5 md:p-6 bg-card h-full group" whileHover={{ y: -4, transition: { duration: 0.2 } }}>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <item.icon size={20} className="text-primary" />
                  </div>
                  <h3 className="font-display font-semibold mb-2 text-base">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="py-16 md:py-24 bg-secondary/30 relative overflow-hidden">
        <motion.div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/5 blur-[100px] pointer-events-none" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 6, repeat: Infinity }} />
        <div className="container relative z-10 px-4">
          <FadeIn>
            <div className="max-w-2xl mx-auto text-center">
              <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-3">A Solução</p>
              <h2 className="font-display text-2xl sm:text-4xl font-bold mb-6">Sistemas que trabalham enquanto a sua equipa descansa.</h2>
              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-8">
                A Flowen constrói sistemas de automação operacional completos — agentes inteligentes que atendem, agendam, cobram, relembram e reportam. Tudo sem intervenção humana.
              </p>
              <Link to="/pacotes">
                <ShimmerButton className="bg-primary text-primary-foreground glow-blue min-h-[48px]">
                  Explorar Soluções <ArrowRight size={18} />
                </ShimmerButton>
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Packages Preview */}
      <section className="py-16 md:py-24 border-t border-border">
        <div className="container px-4">
          <FadeIn>
            <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-3">Pacotes</p>
            <h2 className="font-display text-2xl sm:text-4xl font-bold mb-12 md:mb-16">Escolha o nível de automação certo.</h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <SpotlightCard className={`rounded-xl h-full ${pkg.order}`}>
                  <motion.div
                    className={`rounded-xl p-6 md:p-8 h-full flex flex-col ${
                      pkg.unavailable ? "opacity-60" : ""
                    } ${
                      pkg.highlight
                        ? "bg-primary/10 border-2 border-primary/50 glow-blue"
                        : "gradient-border bg-card"
                    }`}
                    whileHover={pkg.unavailable ? {} : { y: -6, transition: { duration: 0.25 } }}
                  >
                    {pkg.unavailable && (
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-4">
                        <Clock size={14} className="text-amber-400" />
                        <span className="text-xs font-medium text-amber-400">⏳ Temporariamente Indisponível</span>
                      </div>
                    )}
                    {pkg.highlight && (
                      <span className="text-xs font-semibold text-primary bg-primary/20 px-3 py-1 rounded-full self-start mb-4">Mais Popular</span>
                    )}
                    <h3 className="font-display text-2xl font-bold mb-1">{pkg.name}</h3>
                    <p className="text-sm text-muted-foreground mb-6">{pkg.subtitle}</p>
                    {!pkg.unavailable && pkg.price && (
                      <div className="mb-5">
                        <p className="font-display text-3xl font-bold text-primary">{pkg.price}</p>
                        <p className="text-xs text-muted-foreground mt-1">{pkg.setup}</p>
                      </div>
                    )}
                    {pkg.includes && <p className="text-xs text-primary font-medium mb-4">{pkg.includes}</p>}
                    <div className="flex-1 space-y-3 mb-6">
                      {pkg.features.map((f, j) => (
                        <div key={j} className="flex items-start gap-3">
                          <f.icon size={16} className="text-primary mt-0.5 shrink-0" />
                          <span className="text-sm text-secondary-foreground">{f.text}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-muted mb-6">
                      <CheckCircle2 size={16} className="text-primary mt-0.5 shrink-0" />
                      <span className="text-xs text-muted-foreground">{pkg.result}</span>
                    </div>
                    {pkg.unavailable ? (
                      <Button variant="heroOutline" className="w-full min-h-[48px]" disabled title="O plano Executive estará disponível em breve.">
                        Em Breve
                      </Button>
                    ) : (
                      <Link to="/contacto" className="w-full">
                        <ShimmerButton className={`w-full min-h-[48px] ${pkg.highlight ? "bg-primary text-primary-foreground glow-blue" : "border border-primary/50 text-primary"}`}>
                          Falar Connosco
                        </ShimmerButton>
                      </Link>
                    )}
                  </motion.div>
                </SpotlightCard>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24 bg-secondary/30 border-t border-border">
        <div className="container px-4">
          <FadeIn>
            <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-3">Testemunhos</p>
            <h2 className="font-display text-2xl sm:text-4xl font-bold mb-12 md:mb-16">O que dizem os nossos clientes.</h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <FadeIn key={i} delay={i * 0.12}>
                <motion.div className="gradient-border rounded-xl p-6 md:p-8 bg-card h-full flex flex-col" whileHover={{ y: -4, transition: { duration: 0.2 } }}>
                  <Quote size={24} className="text-primary/40 mb-4" />
                  <p className="text-secondary-foreground leading-relaxed mb-6 flex-1">"{t.quote}"</p>
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: t.stars }).map((_, j) => (
                      <Star key={j} size={14} className="text-primary fill-primary" />
                    ))}
                  </div>
                  <div>
                    <p className="font-display font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role} · {t.company}</p>
                  </div>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Differentials */}
      <section className="py-16 md:py-24 border-t border-border">
        <div className="container px-4">
          <FadeIn>
            <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-3">Porquê a Flowen</p>
            <h2 className="font-display text-2xl sm:text-4xl font-bold mb-12 md:mb-16">O que nos distingue.</h2>
          </FadeIn>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {differentials.map((item, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <motion.div className="text-center group" whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}>
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                    <item.icon size={20} className="text-primary md:w-6 md:h-6" />
                  </div>
                  <h3 className="font-display font-semibold mb-2 text-sm md:text-base">{item.title}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 border-t border-border relative overflow-hidden">
        <motion.div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none" animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 4, repeat: Infinity }} />
        <div className="container relative z-10 px-4">
          <FadeIn>
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="font-display text-2xl sm:text-4xl font-bold mb-6">Pronto para automatizar o seu negócio?</h2>
              <p className="text-muted-foreground text-base sm:text-lg mb-8 md:mb-10">Agende uma consulta gratuita e descubra como a Flowen pode transformar as suas operações.</p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Link to="/contacto" className="w-full sm:w-auto">
                  <ShimmerButton className="bg-primary text-primary-foreground glow-blue w-full sm:w-auto min-h-[48px] text-base px-10 py-6">
                    Falar Connosco <ArrowRight size={18} />
                  </ShimmerButton>
                </Link>
                <Link to="/pacotes" className="w-full sm:w-auto">
                  <ShimmerButton className="border border-primary/50 text-primary w-full sm:w-auto min-h-[48px] text-base px-10 py-6">
                    Ver Pacotes
                  </ShimmerButton>
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
};

export default Index;
