import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Loader2, LayoutDashboard, Bookmark, ShieldCheck, LogOut, ChevronRight } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Profile = () => {
  const { user, loading, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const fullName = user?.user_metadata?.full_name || "Pengguna RuangAI";

  return (
    <div className="min-h-screen bg-background pb-24">
      <SEO
        title="Profil Saya"
        description="Kelola profil dan pengaturan akun RuangAI Prompt Hub Anda."
      />
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-md">
        {/* User Header */}
        <div className="flex flex-col items-center mb-8">
          <Avatar className="h-24 w-24 mb-4 border-2 border-primary">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="text-2xl bg-primary/10 text-primary">
              {fullName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-xl font-bold text-center mb-1">{fullName}</h1>
          <p className="text-sm text-muted-foreground text-center mb-4">{user?.email}</p>
        </div>

        {/* Menu Links */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
            <a 
              href="https://ruangai.codepolitan.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors border-b border-border/50 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full text-blue-600 dark:text-blue-400">
                  <LayoutDashboard className="h-5 w-5" />
                </div>
                <span className="font-medium">Dashboard RuangAI</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </a>

            <Link 
              to="/prompt-tersimpan"
              className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors border-b border-border/50 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full text-purple-600 dark:text-purple-400">
                  <Bookmark className="h-5 w-5" />
                </div>
                <span className="font-medium">
                  Prompt Tersimpan
                  <span className="ml-2 bg-secondary text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold leading-none">New</span>
                </span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Link>

            {isAdmin && (
              <Link 
                to="/admin/verification"
                className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors border-b border-border/50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-full text-orange-600 dark:text-orange-400">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <span className="font-medium">Verifikasi Prompt</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>
            )}
          </div>

          <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm mt-6">
            <button 
              onClick={handleSignOut}
              className="w-full flex items-center justify-between p-4 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-red-600 dark:text-red-400"
            >
              <div className="flex items-center gap-3">
                <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full">
                  <LogOut className="h-5 w-5" />
                </div>
                <span className="font-medium">Keluar</span>
              </div>
              <ChevronRight className="h-5 w-5 text-red-400/50" />
            </button>
          </div>
          
          <Link to="/changelog" className="text-center text-xs text-muted-foreground mt-16 hover:text-primary transition-colors block w-fit mx-auto">
            RuangAI Prompt Hub v1.0.0
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Profile;
