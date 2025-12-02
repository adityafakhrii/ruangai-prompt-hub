import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, NavLink } from "react-router-dom";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const getLinkClass = ({ isActive }: { isActive: boolean }) => 
    `text-sm transition-colors ${isActive ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}`;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <a href="/" className="flex items-center gap-2 text-xl font-bold text-foreground">
              <img src="/iconbiru.png" alt="RuangAI Logo" className="h-11 w-10 mr-1" />
              RuangAI Prompt
            </a>
            <div className="hidden md:flex items-center gap-6">
              <NavLink to="/" className={getLinkClass}>
                Home
              </NavLink>
              <NavLink to="/viral" className={getLinkClass}>
                Prompt Viral
              </NavLink>
              {user && (
                <NavLink to="/prompt-saya" className={getLinkClass}>
                  Prompt Saya
                </NavLink>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <NavLink 
                  to="/profile"
                  className={({ isActive }) => 
                    `text-sm hidden sm:inline transition-colors mr-2 font-medium ${isActive ? 'text-primary font-bold' : 'text-foreground hover:text-primary'}`
                  }
                >
                  {user.user_metadata?.full_name || user.email}
                </NavLink>
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

