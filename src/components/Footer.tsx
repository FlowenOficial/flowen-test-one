const Footer = () => (
  <footer className="border-t border-border bg-background py-12">
    <div className="container">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-display text-lg font-bold gradient-text mb-3">Flowen</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Automação operacional e sistemas inteligentes para clínicas e negócios locais.
          </p>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold mb-3 text-foreground">Navegação</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <a href="/" className="hover:text-primary transition-colors">Início</a>
            <a href="/pacotes" className="hover:text-primary transition-colors">Pacotes</a>
            <a href="/sobre" className="hover:text-primary transition-colors">Sobre</a>
            <a href="/contacto" className="hover:text-primary transition-colors">Contacto</a>
          </div>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold mb-3 text-foreground">Contacto</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <span>centralflowen@gmail.com</span>
            <span>Lisboa, Portugal</span>
          </div>
        </div>
      </div>
      <div className="mt-10 pt-6 border-t border-border text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Flowen. Todos os direitos reservados.
      </div>
    </div>
  </footer>
);

export default Footer;
