import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface PromptCardProps {
  id: number;
  title: string;
  category: string;
  prompt: string;
  fullPrompt: string;
  imageUrl: string;
  creatorName?: string;
  onCopy: () => void;
  onClick: () => void;
}

const PromptCard = ({ title, category, prompt, fullPrompt, imageUrl, creatorName, onCopy, onClick }: PromptCardProps) => {
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
      whileHover={{ boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }}
      className="group relative bg-card border border-border rounded-xl overflow-hidden cursor-pointer transition-all hover:border-primary hover:shadow-[var(--shadow-card-hover)] flex flex-col h-full"
      onClick={onClick}
    >
      {/* Preview Image - Fixed height for uniform cards */}
      <div className="relative h-40 w-full overflow-hidden bg-muted">
        {imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
            <span className="text-4xl opacity-30">📝</span>
          </div>
        )}
        <Badge className="absolute top-3 left-3 bg-black/50 hover:bg-black/70 backdrop-blur-md text-white border-none">
          {category}
        </Badge>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3 flex-1 flex flex-col">
        <div>
          <h3 className="font-semibold text-lg text-heading line-clamp-1" title={title}>
            {title}
          </h3>
          {creatorName && creatorName !== 'Unknown' && (
            <p className="text-xs text-muted-foreground mt-1">
              Oleh: {creatorName}
            </p>
          )}
          {(creatorName === 'Unknown' || !creatorName) && (
             <p className="text-xs text-muted-foreground mt-1">
              Oleh: Pengguna RuangAI
            </p>
          )}
        </div>

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
              <img src="https://cdn.oaistatic.com/assets/favicon-180x180-od45eci6.webp" alt="ChatGPT" className="h-5 w-5" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="rounded-lg border-border hover:border-primary hover:text-primary w-9 h-9"
              onClick={(e) => handleOpenAI(e, 'https://gemini.google.com/app', 'Gemini')}
              title="Copy & Open Gemini"
            >
              <img src="https://www.gstatic.com/lamda/images/gemini_sparkle_aurora_33f86dc0c0257da337c63.svg" alt="Gemini" className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PromptCard;
