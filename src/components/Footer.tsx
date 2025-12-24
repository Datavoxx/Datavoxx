import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t border-border/50 bg-background/50 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Datavoxx. Alla rättigheter förbehållna.
          </p>
          <nav className="flex items-center gap-6">
            <Link 
              to="/integritetspolicy" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Integritetspolicy
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
