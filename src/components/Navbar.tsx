import { Button } from "@/components/ui/button";
import { LogOut, Menu, ArrowLeft, Bell, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, NavLink } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";

const Navbar = () => {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const getLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm transition-colors ${isActive ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}`;

  const getMobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-base py-2 transition-colors ${isActive ? 'text-foreground font-bold' : 'text-muted-foreground hover:text-foreground'}`;

  const closeSheet = () => setIsOpen(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <a href="/" className="flex items-center gap-2 text-xl font-bold text-foreground">
              <img src="/iconbiru.png" alt="RuangAI Logo" className="h-11 w-10 mr-1" />
              <span className="hidden sm:inline">RuangAI Prompt</span>
              <span className="sm:hidden">RuangAI</span>
            </a>
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <NavLink to="/" className={getLinkClass}>
                Home
              </NavLink>
              <NavLink to="/paling-banyak-copy" className={getLinkClass}>
                Prompt Viral
              </NavLink>
              {user && (
                <>
                  <NavLink to="/prompt-saya" className={getLinkClass}>
                    Prompt Saya
                  </NavLink>
                  <NavLink to="/prompt-tersimpan" className={getLinkClass}>
                    Tersimpan
                  </NavLink>
                </>
              )}
              {isAdmin && (
                <NavLink to="/admin/verification" className={getLinkClass}>
                  Verifikasi Prompt
                </NavLink>
              )}
            </div>
          </div>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => navigate('/leaderboard')}
              title="Leaderboard"
            >
              <TrendingUp className="h-5 w-5" />
            </Button>
            <ThemeToggle />
            {user ? (
              <>
                <a
                  href="https://ruangai.codepolitan.com/"
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mr-4 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Dashboard
                </a>
                {/* Notification bell - hidden until feature is ready
                <Button
                  variant="ghost"
                  size="icon"
                  className="mr-2 text-muted-foreground hover:text-foreground"
                  onClick={() => navigate('/notifikasi')}
                >
                  <Bell className="h-5 w-5" />
                </Button>
                */}
                <span className="text-sm font-medium text-foreground mr-2">
                  {user.user_metadata?.full_name || user.email}
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

          {/* Mobile Menu Trigger */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle className="flex items-center">
                    <div className="flex items-center gap-2">
                      <img src="/iconbiru.png" alt="RuangAI Logo" className="h-8 w-8" />
                      RuangAI Prompt
                    </div>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-6 mt-8">
                  <div className="flex flex-col gap-4">
                    <NavLink to="/" className={getMobileLinkClass} onClick={closeSheet}>
                      Home
                    </NavLink>
                    <NavLink to="/paling-banyak-copy" className={getMobileLinkClass} onClick={closeSheet}>
                      Prompt Viral
                    </NavLink>
                    {user && (
                      <>
                        <NavLink to="/prompt-saya" className={getMobileLinkClass} onClick={closeSheet}>
                          Prompt Saya
                        </NavLink>
                        <NavLink to="/prompt-tersimpan" className={getMobileLinkClass} onClick={closeSheet}>
                          Tersimpan
                        </NavLink>
                        {/* Notifikasi - hidden until feature is ready
                        <NavLink to="/notifikasi" className={getMobileLinkClass} onClick={closeSheet}>
                          Notifikasi
                        </NavLink>
                        */}
                      </>
                    )}
                    {isAdmin && (
                      <NavLink to="/admin/verification" className={getMobileLinkClass} onClick={closeSheet}>
                        Verifikasi Prompt
                      </NavLink>
                    )}
                  </div>

                  <div className="h-px bg-border" />

                  {/* Leaderboard & Theme Toggle */}
                  <div className="flex items-center justify-end gap-2 py-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        navigate('/leaderboard');
                        closeSheet();
                      }}
                      title="Leaderboard"
                    >
                      <TrendingUp className="h-5 w-5" />
                    </Button>
                    <ThemeToggle />
                  </div>

                  <div className="flex flex-col gap-4">
                    {user ? (
                      <>
                        <a
                          href="https://ruangai.codepolitan.com/"
                          className="flex items-center gap-2 text-base font-medium text-muted-foreground hover:text-foreground py-2 transition-colors"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Dashboard
                        </a>
                        <span className="text-sm font-medium text-foreground py-2">
                          {user.user_metadata?.full_name || user.email}
                        </span>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => {
                            signOut();
                            closeSheet();
                          }}
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Logout
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="default"
                        className="w-full"
                        onClick={() => {
                          navigate('/auth');
                          closeSheet();
                        }}
                      >
                        Login
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav >
  );
};

export default Navbar;
