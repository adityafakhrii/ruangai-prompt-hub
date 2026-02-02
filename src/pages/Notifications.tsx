import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchUserPromptReviews, PromptReviewNotification } from "@/lib/notificationQueries";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, MessageSquare, Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Notifications = () => {
  const [reviews, setReviews] = useState<PromptReviewNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadReviews = async () => {
      if (!user) return;
      setLoading(true);
      const { data } = await fetchUserPromptReviews(user.id);
      if (data) {
        setReviews(data);
      }
      setLoading(false);
    };

    loadReviews();
  }, [user]);

  if (!user && !loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold mb-4">Login Diperlukan</h1>
            <Button onClick={() => navigate("/auth")}>Login Sekarang</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Notifikasi"
        description="Lihat review dan aktivitas terbaru pada prompt Anda."
      />
      <Navbar />

      <div className="container mx-auto px-4 py-12 flex-1">
        <div className="flex items-center gap-3 mb-8">
          <Bell className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Notifikasi</h1>
        </div>

        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-20 bg-muted/20 rounded-lg">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-xl text-muted-foreground">
                Belum ada notifikasi baru.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Review dari pengguna lain akan muncul di sini.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Review Terbaru</h2>
              {reviews.map((review) => (
                <Card key={review.id} className="overflow-hidden hover:bg-muted/5 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-10 w-10 border border-border">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {review.profiles?.email?.substring(0, 2).toUpperCase() || "??"}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                          <p className="font-medium text-foreground">
                            <span className="font-bold">{review.profiles?.email || "Pengguna"}</span> memberikan review pada{" "}
                            <span className="text-primary font-medium">"{review.prompts.title}"</span>
                          </p>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDistanceToNow(new Date(review.created_at), { addSuffix: true, locale: id })}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1 mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300 dark:text-gray-600"
                              }`}
                            />
                          ))}
                        </div>
                        
                        <p className="text-sm text-foreground/80 bg-muted/30 p-3 rounded-md">
                          "{review.comment}"
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Notifications;
