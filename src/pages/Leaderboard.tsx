import { useState, useEffect } from "react";
import { fetchLeaderboard } from "@/lib/promptQueries";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingCTA from "@/components/FloatingCTA";
import SEO from "@/components/SEO";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Medal, Crown, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface LeaderboardEntry {
  profiles_id: string;
  email: string;
  prompt_count: number;
}

const Leaderboard = () => {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const { data: leaderboardData } = await fetchLeaderboard(50);
      if (leaderboardData) {
        setData(leaderboardData as LeaderboardEntry[]);
      }
      setLoading(false);
    };

    loadData();
  }, []);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 1:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-amber-700" />;
      default:
        return <span className="text-lg font-bold w-6 text-center text-muted-foreground">{index + 1}</span>;
    }
  };

  const getMilestoneBadge = (count: number) => {
    if (count >= 50) return <Badge className="bg-yellow-500 hover:bg-yellow-600">Gold Creator</Badge>;
    if (count >= 25) return <Badge className="bg-gray-400 hover:bg-gray-500">Silver Creator</Badge>;
    if (count >= 10) return <Badge className="bg-amber-700 hover:bg-amber-800">Bronze Creator</Badge>;
    return null;
  };

  const maskEmail = (email: string): string => {
    const atIndex = email.indexOf('@');
    if (atIndex === -1) return email;
    const [localPart, domain] = email.split('@');
    return `${localPart.substring(0, 3)}***@${domain}`;
  };

  const handleShare = async () => {
    const shareText = "Cek Leaderboard Kontributor Terbaik di RuangAI Prompt Hub! 🏆\nhttps://raiprompt.adityafakhri.com/leaderboard";

    if (navigator.share) {
      try {
        await navigator.share({
          title: "RuangAI Prompt Leaderboard",
          text: shareText,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      navigator.clipboard.writeText(shareText);
      toast({
        title: "Link disalin!",
        description: "Link leaderboard berhasil disalin.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Leaderboard Kontributor"
        description="Top kontributor prompt AI di RuangAI. Lihat siapa yang paling aktif berbagi!"
      />
      <Navbar />

      <div className="container mx-auto px-4 py-12 flex-1">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-2">
              Leaderboard
            </h1>
            <p className="text-lightText text-lg">
              Para pahlawan komunitas yang paling aktif berbagi prompt
            </p>
          </div>
          <Button onClick={handleShare} variant="outline" className="gap-2">
            <Share2 className="w-4 h-4" />
            Share Leaderboard
          </Button>
        </div>

        {/* Promo Banner */}
        <div className="bg-gradient-to-r from-primary/20 to-secondary/20 p-6 rounded-xl border border-primary/20 mb-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-heading mb-2">🎁 Reward Spesial Kontributor</h3>
              <p className="text-foreground/80">
                Sudah upload <strong>10 prompt verified</strong>? Anda berhak mendapatkan <strong>1 Token Kelas Gratis!</strong>
              </p>
            </div>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground whitespace-nowrap"
              onClick={() => window.open('https://instagram.com/ruangai.id', '_blank')}
            >
              Klaim via DM Instagram
            </Button>
          </div>
        </div>

        {/* Leaderboard Table */}
        <Card>
          <CardHeader>
            <CardTitle>Top Kontributor</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {data.map((entry, index) => (
                  <div
                    key={entry.profiles_id}
                    className={`flex items-center p-3 md:p-4 rounded-lg border transition-colors ${index < 3 ? "bg-muted/30 border-primary/20" : "bg-card border-border"
                      }`}
                  >
                    <div className="flex items-center justify-center w-8 md:w-10 mr-2 md:mr-4 flex-shrink-0">
                      {getRankIcon(index)}
                    </div>

                    <Avatar className="h-8 w-8 md:h-10 md:w-10 mr-2 md:mr-4 border-2 border-background flex-shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs md:text-base">
                        {entry.email.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0 mr-2 md:mr-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold truncate text-foreground text-sm md:text-base">
                          {maskEmail(entry.email)}
                        </p>
                        {getMilestoneBadge(entry.prompt_count)}
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-xl md:text-2xl font-bold text-primary">{entry.prompt_count}</span>
                      <span className="text-[10px] md:text-xs text-muted-foreground block">Prompts</span>
                    </div>
                  </div>
                ))}

                {data.length === 0 && (
                  <div className="text-center py-10 text-muted-foreground">
                    Belum ada data kontributor.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />
      <FloatingCTA />
    </div>
  );
};

export default Leaderboard;
