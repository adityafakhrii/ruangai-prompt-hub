import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, ExternalLink, Bookmark } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";

interface PromptDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prompt: {
    title: string;
    category: string;
    prompt: string;
    imageUrl: string;
    fullPrompt: string;
  } | null;
  onCopy: () => void;
}

const PromptDetailModal = ({ open, onOpenChange, prompt, onCopy }: PromptDetailModalProps) => {
  const [isBookmarked, setIsBookmarked] = useState(false);

  if (!prompt) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] bg-popover text-popover-foreground border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-heading flex items-center justify-between">
            {prompt.title}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsBookmarked(!isBookmarked)}
              className="hover:text-primary"
            >
              <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-primary text-primary' : ''}`} />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-6 pr-4">
            {/* Category */}
            <Badge className="bg-primary-light text-heading">
              {prompt.category}
            </Badge>

            {/* Preview Image */}
            <div className="rounded-xl overflow-hidden">
              <img
                src={prompt.imageUrl}
                alt={prompt.title}
                className="w-full aspect-video object-cover"
              />
            </div>

            {/* Full Prompt */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-heading">Full Prompt</h3>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {prompt.fullPrompt}
                </p>
              </div>
            </div>

            {/* Output Example */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-heading">Output Example</h3>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm">
                  Output preview akan ditampilkan di sini berdasarkan hasil generate dari prompt.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={onCopy}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Prompt
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-border hover:border-primary hover:text-primary"
                onClick={() => window.open('https://chat.openai.com', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Buka di ChatGPT
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-border hover:border-primary hover:text-primary"
                onClick={() => window.open('https://gemini.google.com', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Buka di Gemini
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default PromptDetailModal;
