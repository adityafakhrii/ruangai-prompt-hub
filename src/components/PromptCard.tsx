import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, Bot, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface PromptCardProps {
  id: number;
  title: string;
  category: string;
  prompt: string;
  fullPrompt: string;
  imageUrl: string;
  onCopy: () => void;
  onClick: () => void;
}

const PromptCard = ({ title, category, prompt, fullPrompt, imageUrl, onCopy, onClick }: PromptCardProps) => {
  const { toast } = useToast();

  const handleOpenAI = (e: React.MouseEvent, url: string, name: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(fullPrompt);
    toast({
      title: "Prompt disalin!",
      description: `Prompt disalin. Membuka ${name}...`,
    });
    window.open(url, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      className="group relative bg-card border border-border rounded-xl overflow-hidden cursor-pointer transition-all hover:border-primary hover:shadow-[var(--shadow-card-hover)] flex flex-col h-full"
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
        <Badge className="absolute top-3 left-3 bg-black/50 hover:bg-black/70 backdrop-blur-md text-white border-none">
          {category}
        </Badge>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3 flex-1 flex flex-col">
        <h3 className="font-semibold text-lg text-heading line-clamp-1" title={title}>
          {title}
        </h3>

        {/* Prompt Preview */}
        <p className="text-sm line-clamp-3 leading-relaxed flex-1">
          {prompt}
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
              <Bot className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="rounded-lg border-border hover:border-primary hover:text-primary w-9 h-9"
              onClick={(e) => handleOpenAI(e, 'https://gemini.google.com/app', 'Gemini')}
              title="Copy & Open Gemini"
            >
              <Sparkles className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PromptCard;
