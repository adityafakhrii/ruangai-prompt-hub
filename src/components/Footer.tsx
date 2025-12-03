import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border bg-background mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-semibold text-foreground mb-3">Tentang</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm text-lightText hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/cara-kerja" className="text-sm text-lightText hover:text-foreground transition-colors">
                  Cara Kerja
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-3">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy-policy" className="text-sm text-lightText hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="text-sm text-lightText hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-3">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="text-sm text-lightText hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-sm text-lightText hover:text-foreground transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-3">Follow Us</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://instagram.com/ruangai.id" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-lightText hover:text-foreground transition-colors"
                >
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-border">
          <p className="text-center text-sm text-lightText">
            © {currentYear} RuangAI Prompt. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
