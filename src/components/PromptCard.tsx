import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Clock, XCircle, BadgeCheck, Bookmark, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface PromptCardProps {
  id: string;
  title: string;
  category: string;
  fullPrompt: string;
  imageUrl: string;
  additionalInfo?: string;
  copyCount?: number;
  creatorEmail?: string | null;
  status?: 'pending' | 'verified' | 'rejected';
  onCopy: () => void;
  onClick: () => void;
  priority?: boolean;
  isBookmarked?: boolean;
  onToggleBookmark?: (e: React.MouseEvent) => void;
  averageRating?: number;
  reviewCount?: number;
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

const PromptCard = ({ title, category, fullPrompt, imageUrl, additionalInfo, copyCount = 0, creatorEmail, status, onCopy, onClick, priority = false, isBookmarked = false, onToggleBookmark, averageRating, reviewCount }: PromptCardProps) => {
  const { toast } = useToast();

  // Compute creator display name: use masked email if available, otherwise "Teman RAI"
  const creatorDisplayName = creatorEmail ? maskEmail(creatorEmail) : "Teman RAI";

  const handleOpenAI = (e: React.MouseEvent, url: string, name: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(fullPrompt);
    toast({
      title: "Prompt disalin!",
      description: `Prompt disalin. Membuka ${name}...`,
    });
    window.open(url, '_blank');
  };

  const hasImage = imageUrl && imageUrl.trim() !== '';

  const StatusBadge = () => {
    if (!status) return null;

    if (status === 'verified') {
      return (
        <div title="Verified">
          <BadgeCheck className="w-5 h-5 text-white fill-blue-500" />
        </div>
      );
    }
    if (status === 'pending') {
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 gap-1">
          <Clock className="w-3 h-3" />
          <span className="text-[10px] font-bold uppercase">Pending</span>
        </Badge>
      );
    }
    if (status === 'rejected') {
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="w-3 h-3" />
          <span className="text-[10px] font-bold uppercase">Rejected</span>
        </Badge>
      );
    }
    return null;
  };

  const RatingDisplay = () => {
    // Show rating if it exists, or if reviewCount > 0 (even if rating is 0)
    // But usually if reviewCount > 0, rating should be >= 1 unless 0 stars is possible.
    // If no reviews, we might want to hide it, or show "0.0 (0)" if desired.
    // The user said "seluruhnya di semua card prompt", which implies they want to see it always?
    // Let's assume they want to see it even if it's 0 if they said "all cards".
    // But usually empty states are hidden. Let's stick to hiding if null/undefined.
    // However, checking if averageRating is 0:
    if (averageRating === undefined || averageRating === null) return null;

    return (
      <div className="flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400 font-medium bg-yellow-50 dark:bg-yellow-900/20 px-1.5 py-0.5 rounded-md border border-yellow-200 dark:border-yellow-800/50">
        <Star className="w-3 h-3 fill-yellow-500 dark:fill-yellow-400 text-yellow-500 dark:text-yellow-400" />
        <span>{Number(averageRating).toFixed(1)}</span>
        <span className="text-muted-foreground dark:text-gray-400 ml-0.5">({reviewCount || 0})</span>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }}
      className="group relative bg-card border border-border rounded-xl overflow-hidden cursor-pointer transition-all hover:border-primary hover:shadow-[var(--shadow-card-hover)] flex flex-col h-full"
      onClick={onClick}
    >
      {hasImage ? (
        <>
          {/* Preview Image - Fixed height for uniform cards */}
          <div className="relative aspect-video w-full overflow-hidden bg-muted">
            <img
              src={imageUrl}
              alt={title}
              loading={priority ? "eager" : "lazy"}
              decoding={priority ? "sync" : "async"}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Bookmark Button Overlay */}
            {onToggleBookmark && (
              <div className="absolute top-2 right-2 z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-black/20 hover:bg-black/40 text-white rounded-full h-8 w-8 backdrop-blur-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleBookmark(e);
                  }}
                >
                  <Bookmark className={`w-5 h-5 ${isBookmarked ? "fill-blue-500 text-blue-500" : "text-white"}`} />
                </Button>
              </div>
            )}
          </div>

          {/* Content with image */}
          <div className="p-4 space-y-2 flex-1 flex flex-col">
            <div>
              {/* Row 1: Category + Verified */}
              <div className="flex flex-wrap gap-2 items-center mb-1">
                <Badge className="w-fit bg-primary/10 hover:bg-primary/20 text-primary border-none">
                  {category}
                </Badge>
                <StatusBadge />
              </div>

              {/* Row 2: Title */}
              <h3 className="font-semibold text-lg text-heading line-clamp-1" title={title}>
                {title}
              </h3>

              {/* Row 3: Creator */}
              <p className="text-xs text-muted-foreground mt-1">Creator: {creatorDisplayName}</p>

              {/* Row 4: Rating + Copied */}
              <div className="flex items-center gap-2 mt-2">
                <RatingDisplay />
                {copyCount !== undefined && (
                  <Badge variant="default" className="shrink-0 text-[10px] px-1.5 h-5">
                    {copyCount} copied
                  </Badge>
                )}
              </div>
            </div>

            {/* Additional Info */}
            {additionalInfo && (
              <p className="text-xs text-muted-foreground italic line-clamp-1">
                {additionalInfo}
              </p>
            )}

            {/* Prompt Preview */}
            <p className="text-sm line-clamp-3 leading-relaxed flex-1 break-words">
              {fullPrompt}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-4 mt-auto">
              <Button
                size="sm"
                className="flex-1 bg-secondary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onCopy();
                }}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>

              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant="outline"
                  className="rounded-lg border-border hover:border-primary hover:text-primary w-9 h-9"
                  onClick={(e) => handleOpenAI(e, 'https://chatgpt.com/', 'ChatGPT')}
                  title="Copy & Open ChatGPT"
                >
                  <img src="https://cdn.oaistatic.com/assets/favicon-180x180-od45eci6.webp" alt="ChatGPT" className="h-5 w-5" loading="lazy" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="rounded-lg border-border hover:border-primary hover:text-primary w-9 h-9"
                  onClick={(e) => handleOpenAI(e, 'https://gemini.google.com/app', 'Gemini')}
                  title="Copy & Open Gemini"
                >
                  <img src="https://www.gstatic.com/lamda/images/gemini_sparkle_aurora_33f86dc0c0257da337c63.svg" alt="Gemini" className="h-5 w-5" loading="lazy" />
                </Button>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* No Image Layout - Show category, title, creator, prompt directly */
        <div className="p-4 space-y-2 flex-1 flex flex-col">
          {/* Content */}
          <div>
            {/* Row 1: Category + Verified + Bookmark (aligned in one row) */}
            <div className="flex justify-between items-center gap-2 mb-1">
              <div className="flex flex-wrap gap-2 items-center">
                <Badge className="w-fit bg-primary/10 hover:bg-primary/20 text-primary border-none">
                  {category}
                </Badge>
                <StatusBadge />
              </div>
              {onToggleBookmark && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-black/20 hover:bg-black/40 text-white rounded-full h-8 w-8 backdrop-blur-sm shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleBookmark(e);
                  }}
                >
                  <Bookmark className={`w-5 h-5 ${isBookmarked ? "fill-blue-500 text-blue-500" : "text-white"}`} />
                </Button>
              )}
            </div>

            {/* Row 2: Title */}
            <h3 className="font-semibold text-lg text-heading line-clamp-2" title={title}>
              {title}
            </h3>

            {/* Row 3: Creator */}
            <p className="text-xs text-muted-foreground mt-1">Creator: {creatorDisplayName}</p>

            {/* Row 4: Rating + Copied */}
            <div className="flex items-center gap-2 mt-2">
              <RatingDisplay />
              {copyCount !== undefined && (
                <Badge variant="default" className="shrink-0 text-[10px] px-1.5 h-5">
                  {copyCount} copied
                </Badge>
              )}
            </div>
          </div>

          {/* Additional Info */}
          {additionalInfo && (
            <p className="text-xs text-muted-foreground italic line-clamp-1">
              {additionalInfo}
            </p>
          )}

          {/* Prompt Preview - More lines when no image */}
          <p className="text-sm line-clamp-5 leading-relaxed flex-1">
            {fullPrompt}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-4 mt-auto">
            <Button
              size="sm"
              className="flex-1 bg-secondary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-sm"
              onClick={(e) => {
                e.stopPropagation();
                onCopy();
              }}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            {/* Same buttons as above */}
            <div className="flex gap-1">
              <Button
                size="icon"
                variant="outline"
                className="rounded-lg border-border hover:border-primary hover:text-primary w-9 h-9"
                onClick={(e) => handleOpenAI(e, 'https://chatgpt.com/', 'ChatGPT')}
                title="Copy & Open ChatGPT"
              >
                <img src="https://cdn.oaistatic.com/assets/favicon-180x180-od45eci6.webp" alt="ChatGPT" className="h-5 w-5" loading="lazy" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="rounded-lg border-border hover:border-primary hover:text-primary w-9 h-9"
                onClick={(e) => handleOpenAI(e, 'https://gemini.google.com/app', 'Gemini')}
                title="Copy & Open Gemini"
              >
                <img src="https://www.gstatic.com/lamda/images/gemini_sparkle_aurora_33f86dc0c0257da337c63.svg" alt="Gemini" className="h-5 w-5" loading="lazy" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default PromptCard;
