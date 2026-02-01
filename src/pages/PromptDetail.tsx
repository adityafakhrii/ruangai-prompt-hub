
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchPromptById, fetchPromptBySlug } from "@/lib/promptQueries";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Share2, Star, ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useReviews } from "@/hooks/useReviews";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { maskEmail, getOptimizedImageUrl, slugify } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PromptDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug || "");

  const { data: promptData, isLoading, error } = useQuery({
    queryKey: ['prompt', slug],
    queryFn: () => isUuid ? fetchPromptById(slug || "") : fetchPromptBySlug(slug || ""),
    enabled: !!slug
  });

  const prompt = promptData?.data;
  
  const { reviews, userReview, loading: loadingReviews, submitting, loadReviews, addReview } = useReviews(prompt?.id || "");

  useEffect(() => {
    if (prompt?.id) {
      loadReviews();
    }
  }, [prompt?.id, loadReviews]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !prompt) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Prompt tidak ditemukan</h1>
        <Button onClick={() => navigate("/")}>Kembali ke Beranda</Button>
      </div>
    );
  }

  const creatorDisplayName = prompt.profiles?.email ? maskEmail(prompt.profiles.email) : "Teman RAI";
  const optimizedImageUrl = prompt.image_url ? getOptimizedImageUrl(prompt.image_url, 800) : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.full_prompt);
    toast({
      title: "Prompt disalin!",
      description: "Prompt telah disalin ke clipboard.",
    });
  };

  const handleShare = async (platform?: string) => {
    const promptSlug = slugify(prompt.title);
    const shareUrl = `https://prompt.ruangai.id/prompt/${promptSlug}`;
    const shareText = `${prompt.title}\n\n${prompt.full_prompt}\n\nPrompt diambil dari ${shareUrl}`;
    
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(prompt.title);

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodedText}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodedText}`, '_blank');
        break;
      case 'threads':
        window.open(`https://threads.net/intent/post?text=${encodedText}`, '_blank');
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodedTitle}&body=${encodedText}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link disalin!",
          description: "Link halaman ini telah disalin ke clipboard."
        });
        break;
      default:
        if (navigator.share) {
          try {
            await navigator.share({
              title: prompt.title,
              text: shareText,
              url: shareUrl
            });
          } catch (error) {
            console.error("Error sharing:", error);
          }
        } else {
          navigator.clipboard.writeText(shareUrl);
          toast({
            title: "Link disalin!",
            description: "Link halaman ini telah disalin ke clipboard."
          });
        }
    }
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      toast({
        title: "Rating diperlukan",
        description: "Silakan pilih bintang 1-5.",
        variant: "destructive",
      });
      return;
    }
    if (comment.length < 10) {
      toast({
        title: "Komentar terlalu pendek",
        description: "Komentar minimal 10 karakter.",
        variant: "destructive",
      });
      return;
    }

    const success = await addReview(rating, comment);
    if (success) {
      setRating(0);
      setComment("");
    }
  };

  // Structured Data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": prompt.title,
    "image": optimizedImageUrl || "https://raiprompt.adityafakhri.com/iconbiru.png",
    "datePublished": prompt.created_at,
    "author": {
      "@type": "Person",
      "name": creatorDisplayName
    },
    "publisher": {
      "@type": "Organization",
      "name": "RuangAI Prompt Hub",
      "logo": {
        "@type": "ImageObject",
        "url": "https://raiprompt.adityafakhri.com/iconbiru.png"
      }
    },
    "description": prompt.full_prompt.substring(0, 150),
    "articleBody": prompt.full_prompt,
    "keywords": [prompt.category, "AI prompt", "ChatGPT", "Gemini", "Midjourney", "Prompt Engineering"].join(", ")
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title={`${prompt.title} - RuangAI Prompt Hub`}
        description={prompt.full_prompt.substring(0, 150)}
        ogImage={prompt.image_url || undefined}
        keywords={[prompt.category, "AI prompt", "ChatGPT", "Gemini", "Prompt Engineering"]}
        jsonLd={jsonLd}
      />
      <Navbar />
      
      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container max-w-6xl mx-auto py-8 px-4 md:px-6"
      >
        <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:text-primary" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </Button>

        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge className="bg-primary/10 hover:bg-primary/20 text-primary border-none">
                  {prompt.category}
                </Badge>
                {prompt.status === 'verified' && (
                  <Badge variant="outline" className="border-blue-200 text-blue-600 bg-blue-50">
                    Verified
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-heading">{prompt.title}</h1>
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <span>Oleh {creatorDisplayName}</span>
                <span>•</span>
                <span>{new Date(prompt.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              
              <div className="flex items-center gap-4 mt-4">
                 <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/10 px-2 py-1 rounded-md border border-yellow-100 dark:border-yellow-900/30">
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    <span className="font-bold text-yellow-700 dark:text-yellow-500">{Number(prompt.average_rating || 0).toFixed(1)}</span>
                    <span className="text-muted-foreground text-xs ml-1">({prompt.review_count || 0} ulasan)</span>
                  </div>
                  <div className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/10 px-2 py-1 rounded-md border border-blue-100 dark:border-blue-900/30">
                    <Copy className="w-3.5 h-3.5 text-blue-500" />
                    <span className="font-bold text-blue-700 dark:text-blue-500">{prompt.copy_count}</span>
                    <span className="text-muted-foreground text-xs ml-1">disalin</span>
                  </div>
              </div>
            </div>

            <div className="flex gap-2 shrink-0">
               <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Share2 className="h-4 w-4 mr-2" />
                    Bagikan
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleShare('whatsapp')}>WhatsApp</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare('twitter')}>Twitter / X</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare('copy')}>Salin Link</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button onClick={handleCopy}>
                <Copy className="h-4 w-4 mr-2" />
                Salin Prompt
              </Button>
            </div>
          </div>

          <Separator />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              {/* Image */}
              {optimizedImageUrl && (
                <div className="rounded-xl overflow-hidden bg-muted border border-border">
                  <img
                    src={optimizedImageUrl}
                    alt={prompt.title}
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}

              {/* Full Prompt */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Full Prompt</h3>
                <div className="bg-muted/50 p-6 rounded-xl border border-border relative group">
                  <p className="whitespace-pre-wrap leading-relaxed font-mono text-sm select-none">
                    {prompt.full_prompt}
                  </p>
                </div>
              </div>

              {/* Additional Info */}
              {prompt.additional_info && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Instruksi Tambahan</h3>
                  <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-900/30">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      {prompt.additional_info}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar / Reviews */}
            <div className="space-y-6">
               <div className="bg-card border border-border rounded-xl p-6 space-y-4 sticky top-24">
                  <h3 className="font-semibold text-lg">Quick Actions</h3>
                  <div className="grid grid-cols-1 gap-2">
                    <Button className="justify-start w-full" onClick={handleCopy}>
                       <Copy className="h-4 w-4 mr-2" />
                       Salin Prompt
                    </Button>
                    <Button variant="outline" className="justify-start" onClick={() => { handleCopy(); window.open('https://chat.openai.com', '_blank'); }}>
                       <img src="https://cdn.oaistatic.com/assets/favicon-180x180-od45eci6.webp" alt="ChatGPT" className="h-4 w-4 mr-2" />
                       Buka di ChatGPT
                    </Button>
                    <Button variant="outline" className="justify-start" onClick={() => { handleCopy(); window.open('https://gemini.google.com', '_blank'); }}>
                       <img src="https://www.gstatic.com/lamda/images/gemini_sparkle_aurora_33f86dc0c0257da337c63.svg" alt="Gemini" className="h-4 w-4 mr-2" />
                       Buka di Gemini
                    </Button>
                  </div>

                  <Separator />
                  
                  <h3 className="font-semibold text-lg">Ulasan ({reviews.length})</h3>
                  
                   {/* Review Form */}
                  {!userReview ? (
                    <div className="space-y-3">
                      <p className="text-xs text-muted-foreground">Bagaimana pengalaman Anda?</p>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 cursor-pointer transition-colors ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                            onClick={() => setRating(star)}
                          />
                        ))}
                      </div>
                      <Textarea
                        placeholder="Tulis ulasan..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="text-xs min-h-[80px]"
                      />
                      <p className="text-[10px] text-muted-foreground text-right">Minimal 10 karakter</p>
                      <Button size="sm" className="w-full" onClick={handleSubmitReview} disabled={submitting || rating === 0 || comment.length < 10}>
                        Kirim Ulasan
                      </Button>
                    </div>
                  ) : (
                    <div className="bg-muted/50 p-3 rounded-lg text-sm">
                      <p className="font-medium mb-1">Ulasan Anda</p>
                      <div className="flex gap-1 mb-1">
                         {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className={`w-3 h-3 ${star <= userReview.rating ? "fill-yellow-400 text-yellow-400" : "text-muted/30"}`} />
                        ))}
                      </div>
                      <p className="text-muted-foreground text-xs">{userReview.comment}</p>
                    </div>
                  )}

                  <div className="space-y-4 pt-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                     {reviews.slice(0, 5).map((review) => (
                        <div key={review.id} className="border-b border-border pb-3 last:border-0 last:pb-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Avatar className="w-5 h-5">
                              <AvatarFallback className="text-[10px]">{review.profiles?.email?.substring(0, 1).toUpperCase() || "U"}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-medium">
                              {review.profiles?.email ? maskEmail(review.profiles.email) : "User"}
                            </span>
                          </div>
                          <div className="flex gap-0.5 mb-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star key={star} className={`w-2.5 h-2.5 ${star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600"}`} />
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground">{review.comment}</p>
                        </div>
                     ))}
                     {reviews.length > 5 && (
                       <Button variant="link" size="sm" className="w-full text-xs h-auto p-0">Lihat semua ulasan</Button>
                     )}
                  </div>
               </div>
            </div>
          </div>
        </div>
      </motion.main>
      <Footer />
    </div>
  );
};

export default PromptDetail;
