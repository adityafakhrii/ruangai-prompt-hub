import { Home, Sparkles, BarChart2, Bookmark, User, FileText } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const BottomNav = () => {
  const { user } = useAuth();
  const location = useLocation();

  const navItems = [
    {
      icon: Home,
      label: "Home",
      path: "/",
    },
    {
      icon: Sparkles,
      label: "Viral",
      path: "/paling-banyak-copy",
    },
    {
      icon: FileText,
      label: "Prompt Saya",
      path: "/prompt-saya",
    },
    {
      icon: BarChart2,
      label: "Rank",
      path: "/leaderboard",
      badge: "New"
    },
    {
      icon: User,
      label: "Profile",
      path: user ? "/profile" : "/auth",
    },
  ];

  return (
    <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] w-[90%] max-w-sm">
      <div className="bg-background/80 backdrop-blur-xl border border-border/50 rounded-full shadow-2xl px-6 py-4 flex justify-between items-center ring-1 ring-white/20 dark:ring-white/10">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 transition-all duration-300",
                isActive
                  ? "text-primary scale-110"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <item.icon className={cn("h-6 w-6", item.label === "Rank" && "rotate-0")} />
                {/* @ts-ignore */}
                {item.badge && (
                  <span className="absolute -top-1.5 -right-2 bg-secondary text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold leading-none border-2 border-background">
                    {/* @ts-ignore */}
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="sr-only">{item.label}</span>
              <span 
                className={cn(
                  "absolute -bottom-2 w-1.5 h-1.5 rounded-full bg-primary transition-all duration-300",
                  isActive ? "opacity-100 scale-100" : "opacity-0 scale-0"
                )} 
              />
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
