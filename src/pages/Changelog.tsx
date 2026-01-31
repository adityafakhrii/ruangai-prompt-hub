import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowLeft, 
  Calendar,
  Rocket,
  Shield,
  Star,
  Zap,
  Layout
} from "lucide-react";
import { motion } from "framer-motion";

interface Release {
  version: string;
  date: string;
  title: string;
  changes: string[];
  type: 'major' | 'minor' | 'patch';
}

const releases: Release[] = [
  {
    version: "v1.0.0",
    date: "29 Jan 2026",
    title: "Stable Release & UI Polish",
    changes: [
      "Peningkatan UI/UX pada halaman Leaderboard",
      "Optimasi responsivitas tampilan mobile",
      "Penambahan opsi pengurutan (sorting) prompt",
      "Perbaikan bug minor pada tampilan teks"
    ],
    type: "major"
  },
  {
    version: "v0.9.0",
    date: "23 Jan 2026",
    title: "Dark Mode & Community Features",
    changes: [
      "Fitur Dark Mode / Light Mode",
      "Sistem Bookmark untuk menyimpan prompt favorit",
      "Fitur Review dan Rating untuk prompt",
      "Peluncuran halaman Leaderboard"
    ],
    type: "minor"
  },
  {
    version: "v0.8.0",
    date: "19 Jan 2026",
    title: "Verification System & Admin Tools",
    changes: [
      "Sistem Verifikasi Prompt (Pending, Verified, Rejected)",
      "Dashboard Admin untuk manajemen prompt",
      "Penambahan Banner Pengumuman (Announcement Banner)",
      "Filter status verifikasi pada list prompt"
    ],
    type: "minor"
  },
  {
    version: "v0.7.0",
    date: "07 Jan 2026",
    title: "Enhanced UI Components",
    changes: [
      "Redesain komponen Kartu Prompt (PromptCard)",
      "Tampilan detail prompt dengan Modal (PromptDetailModal)",
      "Optimasi upload gambar dengan kompresi otomatis",
      "Peningkatan performa rendering list prompt"
    ],
    type: "minor"
  },
  {
    version: "v0.6.0",
    date: "20 Dec 2025",
    title: "Security & Infrastructure",
    changes: [
      "Implementasi Secure Image Upload dengan Signed URLs",
      "Migrasi dan optimasi skema Database Supabase",
      "Validasi ketat untuk ukuran dan tipe file upload",
      "Refactor struktur data prompt"
    ],
    type: "minor"
  },
  {
    version: "v0.5.0",
    date: "15 Dec 2025",
    title: "Authentication Integration",
    changes: [
      "Integrasi sistem autentikasi JWT dengan RuangAI",
      "Perbaikan alur login eksternal (Codepolitan/Heroic)",
      "Optimasi SEO dengan JSON-LD dan meta tags",
      "Perbaikan redirect setelah login"
    ],
    type: "minor"
  },
  {
    version: "v0.1.0",
    date: "02 Dec 2025",
    title: "Initial Beta Release",
    changes: [
      "Peluncuran versi Beta publik",
      "Fitur dasar: Pencarian, Copy Prompt, Kategori",
      "Halaman profil pengguna",
      "Halaman informasi (About, Terms, Privacy)"
    ],
    type: "patch"
  }
];

const getIcon = (title: string) => {
  if (title.includes("Stable") || title.includes("Beta")) return <Rocket className="w-5 h-5 text-blue-500" />;
  if (title.includes("Security") || title.includes("Verification") || title.includes("Auth")) return <Shield className="w-5 h-5 text-green-500" />;
  if (title.includes("UI") || title.includes("Mode")) return <Layout className="w-5 h-5 text-purple-500" />;
  if (title.includes("Community")) return <Star className="w-5 h-5 text-yellow-500" />;
  return <Zap className="w-5 h-5 text-orange-500" />;
};

const getBadgeVariant = (type: Release['type']) => {
  switch (type) {
    case 'major': return 'default';
    case 'minor': return 'secondary';
    default: return 'outline';
  }
};

const Changelog = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <SEO 
        title="Riwayat Pembaruan" 
        description="Catatan perubahan dan pembaruan aplikasi RuangAI Prompt Hub." 
      />
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Riwayat Pembaruan</h1>
            <p className="text-muted-foreground text-sm">Log aktivitas pengembangan aplikasi</p>
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-200px)] pr-4">
          <div className="relative border-l border-border ml-4 md:ml-6 space-y-12">
            {releases.map((release, index) => (
              <div key={release.version} className="relative pb-4">
                {/* Timeline Dot */}
                <div className="absolute -left-[21px] md:-left-[29px] top-1 bg-background border border-border p-1 rounded-full z-10">
                  <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-primary animate-pulse' : 'bg-muted-foreground/30'}`} />
                </div>

                <div className="pl-6 md:pl-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all hover:border-primary/50 group"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors">
                          {getIcon(release.title)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-lg font-bold text-foreground">
                              {release.version}
                            </h2>
                            <Badge variant={getBadgeVariant(release.type)} className="text-[10px] h-5 px-1.5 uppercase">
                              {release.type}
                            </Badge>
                          </div>
                          <h3 className="text-sm font-medium text-muted-foreground">
                            {release.title}
                          </h3>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full w-fit">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{release.date}</span>
                      </div>
                    </div>
                    
                    <ul className="space-y-2">
                      {release.changes.map((change, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/80 leading-relaxed">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/50 shrink-0" />
                          <span>{change}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default Changelog;
