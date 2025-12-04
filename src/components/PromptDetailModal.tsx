import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Share2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

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
    additionalInfo?: string;
    copyCount?: number;
  } | null;
  onCopy: () => void;
}

const PromptDetailModal = ({ open, onOpenChange, prompt, onCopy }: PromptDetailModalProps) => {
  const { toast } = useToast();

  if (!prompt) return null;

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] bg-popover text-popover-foreground border-border">
        <DialogHeader>
          <div className="flex justify-between items-start pr-8">
            <div>
              <DialogTitle className="text-2xl font-bold text-heading">
                {prompt.title}
              </DialogTitle>
              {prompt.creatorName && (
                <p className="text-sm text-muted-foreground mt-1">Oleh: {prompt.creatorName}</p>
              )}
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
              <div className="bg-muted p-4 rounded-lg">
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
                onClick={() => window.open('https://chat.openai.com', '_blank')}
              >
                <img src="https://cdn.oaistatic.com/assets/favicon-180x180-od45eci6.webp" alt="ChatGPT" className="h-4 w-4 mr-2" loading="lazy" />
                Buka di ChatGPT
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-border hover:border-primary hover:text-primary"
                onClick={() => window.open('https://gemini.google.com', '_blank')}
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
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default PromptDetailModal;