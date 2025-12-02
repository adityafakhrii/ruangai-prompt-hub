import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Bookmark, Share2, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

interface PromptCardProps {
  id: number;
  title: string;
  category: string;
  prompt: string;
  imageUrl: string;
  onCopy: () => void;
  onClick: () => void;
}

const PromptCard = ({ title, category, prompt, imageUrl, onCopy, onClick }: PromptCardProps) => {
  const [isBookmarked, setIsBookmarked] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      className="group relative bg-card border border-border rounded-xl overflow-hidden cursor-pointer transition-all hover:border-primary hover:shadow-[var(--shadow-card-hover)]"
      onClick={onClick}
    >
      {/* Preview Image */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        <img 
          src={imageUrl} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Category Badge */}
        <Badge className="bg-primary-light text-heading hover:bg-primary-light">
          {category}
        </Badge>

        {/* Prompt Preview */}
        <p className="text-sm text-lightText line-clamp-3 leading-relaxed">
          {prompt}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          <Button 
            size="sm" 
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            Generate
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            className="rounded-lg border-border hover:border-primary hover:text-primary"
            onClick={(e) => {
              e.stopPropagation();
              onCopy();
            }}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant="ghost"
            className="rounded-lg hover:text-primary"
            onClick={(e) => {
              e.stopPropagation();
              setIsBookmarked(!isBookmarked);
            }}
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-primary text-primary' : ''}`} />
          </Button>
          <Button 
            size="sm" 
            variant="ghost"
            className="rounded-lg hover:text-primary"
            onClick={(e) => e.stopPropagation()}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default PromptCard;
