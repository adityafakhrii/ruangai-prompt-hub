import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Share2, Star, Send } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useReviews } from "@/hooks/useReviews";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

interface PromptDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prompt: {
    id: string;
    title: string;
    category: string;
    prompt: string;
    imageUrl: string;
    fullPrompt: string;
    additionalInfo?: string;
    copyCount?: number;
    creatorEmail?: string | null;
    averageRating?: number;
    reviewCount?: number;
  } | null;
  onCopy: () => void;
}

// Utility function to mask email for privacy
// e.g., adityafakhri@gmail.com → adi******@g****.com
const maskEmail = (email: string): string => {
  const atIndex = email.indexOf('@');
  if (atIndex === -1) return email;

  const [localPart, domain] = email.split('@');
  const dotIndex = domain.lastIndexOf('.');

  if (dotIndex === -1) return email;

  const domainName = domain.substring(0, dotIndex);
  const domainExt = domain.substring(dotIndex);

  // Show first 3 chars of local part (or less if shorter)
  const visibleLocal = localPart.substring(0, 3);
  const maskedLocal = visibleLocal + '*'.repeat(Math.max(0, localPart.length - 3));

  // Show first 1 char of domain name
  const visibleDomain = domainName.substring(0, 1);
  const maskedDomain = visibleDomain + '*'.repeat(Math.max(0, domainName.length - 1));

  return `${maskedLocal}@${maskedDomain}${domainExt}`;
};

const PromptDetailModal = ({ open, onOpenChange, prompt, onCopy }: PromptDetailModalProps) => {
  const { toast } = useToast();
  const { reviews, userReview, loading: loadingReviews, submitting, loadReviews, addReview } = useReviews(prompt?.id || "");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (open && prompt?.id) {
      loadReviews();
      setRating(0);
      setComment("");
    }
  }, [open, prompt?.id, loadReviews]);

  if (!prompt) return null;

  // Compute masked creator display name
  const creatorDisplayName = prompt.creatorEmail ? maskEmail(prompt.creatorEmail) : "Teman RAI";

  const handleShare = async () => {
    const shareText = `${prompt.fullPrompt}\n\nPrompt diambil dari https://raiprompt.adityafakhri.com/`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: prompt.title,
          text: shareText,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback for devices that don't support navigator.share
      navigator.clipboard.writeText(shareText);
      toast({
        title: "Link disalin!",
        description: "Teks share telah disalin ke clipboard karena browser Anda tidak mendukung fitur share native."
      });
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] bg-popover text-popover-foreground border-border">
        <DialogHeader>
          <div className="flex justify-between items-start pr-8">
            <div>
              <DialogTitle className="text-2xl font-bold text-heading">
                {prompt.title}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Creator: {creatorDisplayName}
              </p>
              {prompt.averageRating && prompt.averageRating > 0 ? (
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  <span className="font-medium">{Number(prompt.averageRating).toFixed(1)}</span>
                  <span className="text-muted-foreground text-sm">({prompt.reviewCount || 0} ulasan)</span>
                </div>
              ) : null}
            </div>
            {prompt.copyCount !== undefined && (
              <Badge variant="default" className="shrink-0">
                {prompt.copyCount} copied
              </Badge>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-6 pr-4">
            {/* Category */}
            <Badge className="bg-primary-light text-heading">
              {prompt.category}
            </Badge>

            {/* Preview Image - Full image without cropping */}
            {prompt.imageUrl && (
              <div className="rounded-xl overflow-hidden bg-muted">
                <img
                  src={prompt.imageUrl}
                  alt={prompt.title}
                  className="w-full h-auto object-contain max-h-[400px]"
                  loading="lazy"
                />
              </div>
            )}

            {/* Additional Info */}
            {prompt.additionalInfo && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-heading">Keterangan Tambahan</h3>
                <p className="text-sm text-muted-foreground italic">
                  {prompt.additionalInfo}
                </p>
              </div>
            )}

            {/* Full Prompt */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-heading">Full Prompt</h3>
              <div className="bg-muted p-4 rounded-lg select-none cursor-default">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {prompt.fullPrompt}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pb-4">
              <Button
                className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                onClick={onCopy}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Prompt
              </Button>

              <Button
                variant="outline"
                className="flex-1 border-border hover:border-primary hover:text-primary"
                onClick={() => {
                  onCopy(); // Copy the prompt first
                  window.open('https://chat.openai.com', '_blank'); // Then open link
                }}
              >
                <img src="https://cdn.oaistatic.com/assets/favicon-180x180-od45eci6.webp" alt="ChatGPT" className="h-4 w-4 mr-2" loading="lazy" />
                Buka di ChatGPT
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-border hover:border-primary hover:text-primary"
                onClick={() => {
                  onCopy(); // Copy the prompt first
                  window.open('https://gemini.google.com', '_blank'); // Then open link
                }}
              >
                <img src="https://www.gstatic.com/lamda/images/gemini_sparkle_aurora_33f86dc0c0257da337c63.svg" alt="Gemini" className="h-4 w-4 mr-2" loading="lazy" />
                Buka di Gemini
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="border-border hover:border-primary hover:text-primary w-10 shrink-0"
                onClick={handleShare}
                title="Share"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            <Separator />

            {/* Reviews Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-heading">Ulasan & Rating</h3>
              
              {/* Review Form */}
              {!userReview ? (
                <div className="bg-muted/50 p-4 rounded-lg space-y-4">
                  <h4 className="font-medium text-sm">Berikan Ulasan Anda</h4>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-6 h-6 cursor-pointer transition-colors ${
                          star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                        onClick={() => setRating(star)}
                      />
                    ))}
                  </div>
                  <Textarea
                    placeholder="Tulis ulasan Anda (minimal 10 karakter)..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="bg-background"
                  />
                  <Button 
                    onClick={handleSubmitReview} 
                    disabled={submitting || rating === 0 || comment.length < 10}
                    size="sm"
                  >
                    {submitting ? "Mengirim..." : "Kirim Ulasan"}
                    <Send className="w-3 h-3 ml-2" />
                  </Button>
                </div>
              ) : (
                <div className="bg-primary/10 p-4 rounded-lg">
                  <p className="text-sm font-medium mb-2">Ulasan Anda</p>
                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= userReview.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm">{userReview.comment}</p>
                </div>
              )}

              {/* Reviews List */}
              <div className="space-y-4 pt-2">
                {loadingReviews ? (
                  <p className="text-sm text-muted-foreground">Memuat ulasan...</p>
                ) : reviews.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Belum ada ulasan.</p>
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className="border-b border-border pb-4 last:border-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback>{review.profiles?.email?.substring(0, 2).toUpperCase() || "U"}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">
                          {review.profiles?.email ? maskEmail(review.profiles.email) : "User"}
                        </span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3 h-3 ${
                              star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default PromptDetailModal;
