import FadeIn from "@/components/FadeIn";

const sections = [
  {
    title: "1. Responsável pelo Tratamento",
    body: (
      <>
        <p><span className="text-muted-foreground">Nome:</span> Flowen</p>
        <p><span className="text-muted-foreground">Email:</span> centralflowen@gmail.com</p>
        <p className="text-muted-foreground italic">(Morada e NIF serão adicionados posteriormente)</p>
      </>
    ),
  },
  {
    title: "2. Dados que Recolhemos",
    body: (
      <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
        <li>Nome e email quando preenche o formulário de contacto</li>
        <li>Dados de utilização do serviço de automação contratado</li>
        <li>Dados de agendamentos e comunicações processadas automaticamente</li>
      </ul>
    ),
  },
  {
    title: "3. Finalidade do Tratamento",
    body: (
      <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
        <li>Responder a pedidos de contacto</li>
        <li>Prestar o serviço de automação contratado</li>
        <li>Enviar comunicações relacionadas com o serviço</li>
      </ul>
    ),
  },
  {
    title: "4. Base Legal",
    body: (
      <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
        <li>Execução de contrato para clientes activos</li>
        <li>Consentimento para pedidos de contacto</li>
        <li>Interesse legítimo para melhoria do serviço</li>
      </ul>
    ),
  },
  {
    title: "5. Partilha de Dados",
    body: (
      <p className="text-muted-foreground">
        Os seus dados não são vendidos nem partilhados com terceiros, excepto fornecedores essenciais
        para a prestação do serviço sujeitos a acordos de confidencialidade.
      </p>
    ),
  },
  {
    title: "6. Retenção de Dados",
    body: (
      <p className="text-muted-foreground">
        Dados conservados pelo período necessário à prestação do serviço e cumprimento de obrigações
        legais, ou até solicitação de eliminação.
      </p>
    ),
  },
  {
    title: "7. Os Seus Direitos (RGPD)",
    body: (
      <>
        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
          <li>Acesso aos dados pessoais</li>
          <li>Rectificação de dados incorrectos</li>
          <li>Eliminação dos dados</li>
          <li>Portabilidade dos dados</li>
          <li>Oposição ao tratamento</li>
          <li>
            Reclamação à CNPD (
            <a href="https://www.cnpd.pt" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.cnpd.pt</a>
            )
          </li>
        </ul>
        <p className="mt-3 text-sm">
          Para exercer direitos:{" "}
          <a href="mailto:centralflowen@gmail.com" className="text-primary hover:underline">centralflowen@gmail.com</a>
        </p>
      </>
    ),
  },
  {
    title: "8. Cookies",
    body: (
      <p className="text-muted-foreground">
        Utilizamos apenas cookies essenciais para o funcionamento. Sem cookies de rastreamento ou
        publicidade.
      </p>
    ),
  },
  {
    title: "9. Alterações",
    body: (
      <p className="text-muted-foreground">
        Esta política pode ser actualizada. Data da última actualização indicada no topo.
      </p>
    ),
  },
];

const Privacidade = () => (
  <div className="min-h-screen pt-24 pb-16">
    <div className="container max-w-3xl px-4">
      <FadeIn>
        <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-3">Legal</p>
        <h1 className="font-display text-3xl sm:text-5xl font-bold mb-4">
          Política de Privacidade — Flowen
        </h1>
        <p className="text-sm text-muted-foreground mb-12">Última actualização: Abril 2026</p>
      </FadeIn>

      <div className="space-y-8">
        {sections.map((s, i) => (
          <FadeIn key={i} delay={i * 0.05}>
            <section className="gradient-border rounded-xl p-6 bg-card">
              <h2 className="font-display text-xl font-semibold mb-3">{s.title}</h2>
              <div className="text-sm leading-relaxed space-y-2">{s.body}</div>
            </section>
          </FadeIn>
        ))}
      </div>
    </div>
  </div>
);

export default Privacidade;