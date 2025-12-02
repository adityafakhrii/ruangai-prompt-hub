import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, ExternalLink } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PromptDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prompt: {
    title: string;
    category: string;
    prompt: string;
    imageUrl: string;
    fullPrompt: string;
    creatorName?: string;
  } | null;
  onCopy: () => void;
}

const PromptDetailModal = ({ open, onOpenChange, prompt, onCopy }: PromptDetailModalProps) => {
  if (!prompt) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] bg-popover text-popover-foreground border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-heading">
            {prompt.title}
          </DialogTitle>
          {prompt.creatorName && (
            <p className="text-sm text-muted-foreground mt-1">Oleh: {prompt.creatorName}</p>
          )}
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
                <img src="https://cdn.oaistatic.com/assets/favicon-180x180-od45eci6.webp" alt="ChatGPT" className="h-4 w-4 mr-2" />
                Buka di ChatGPT
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-border hover:border-primary hover:text-primary"
                onClick={() => window.open('https://gemini.google.com', '_blank')}
              >
                <img src="https://www.gstatic.com/lamda/images/gemini_sparkle_aurora_33f86dc0c0257da337c63.svg" alt="Gemini" className="h-4 w-4 mr-2" />
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
