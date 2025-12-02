import { Button } from "@/components/ui/button";
import { Sparkles, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <a href="/" className="flex items-center gap-2 text-xl font-bold text-foreground">
              <Sparkles className="h-6 w-6 text-primary" />
              RuangAI Prompt
            </a>
            <div className="hidden md:flex items-center gap-6">
              <a href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Home
              </a>
              <a href="/#kategori" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Kategori
              </a>
              <a href="/viral" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Prompt Viral
              </a>
              <a href="/tambah" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Tambah Prompt
              </a>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {user.email}
                </span>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="rounded-full"
                  onClick={signOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Button 
                size="sm" 
                variant="outline" 
                className="rounded-full"
                onClick={() => navigate('/auth')}
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
