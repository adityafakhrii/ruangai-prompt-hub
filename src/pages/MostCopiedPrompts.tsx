import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { fetchMostCopiedPromptsWithCreator, PromptWithCreator } from "@/lib/promptQueries";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PromptCard from "@/components/PromptCard";
import PromptDetailModal from "@/components/PromptDetailModal";
import LoginModal from "@/components/LoginModal";
import FloatingCTA from "@/components/FloatingCTA";
import SkeletonCard from "@/components/SkeletonCard";
import SEO from "@/components/SEO";

const MostCopiedPrompts = () => {
  const [prompts, setPrompts] = useState<PromptWithCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrompt, setSelectedPrompt] = useState<{
    title: string;
    category: string;
    prompt: string;
    fullPrompt: string;
    imageUrl: string;
    copyCount?: number;
  } | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [copyCount, setCopyCount] = useState(0);

  const { toast } = useToast();
  const { user } = useAuth();

  const fetchPrompts = useCallback(async () => {
    setLoading(true);

    const { data, error } = await fetchMostCopiedPromptsWithCreator(100);

    if (error) {
      toast({
        title: "Error",
        description: "Gagal memuat prompt paling banyak dicopy",
        variant: "destructive",
      });
    } else {
      setPrompts(data || []);
    }

    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  const handleCopy = async (promptId: string, fullPrompt: string) => {
    navigator.clipboard.writeText(fullPrompt);

    await supabase.rpc('increment_copy_count', { prompt_id: promptId });

    toast({
      title: "Prompt disalin!",
      description: "Prompt berhasil disalin ke clipboard.",
    });

    if (!user) {
      const newCount = copyCount + 1;
      setCopyCount(newCount);
      if (newCount >= 3) {
        setIsLoginModalOpen(true);
        setCopyCount(0);
      }
    }
  };

  const handleCardClick = (prompt: PromptWithCreator) => {
    setSelectedPrompt({
      title: prompt.title,
      category: prompt.category,
      prompt: prompt.full_prompt,
      fullPrompt: prompt.full_prompt,
      imageUrl: prompt.image_url,
      copyCount: prompt.copy_count,
    });
    setIsDetailModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Prompt Viral"
        description="Daftar prompt AI yang paling banyak disalin dan digunakan oleh komunitas RuangAI."
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "Prompt Viral - RuangAI Prompt Hub",
          "description": "Daftar prompt AI yang paling banyak disalin dan digunakan oleh komunitas RuangAI."
        }}
      />
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Prompt Viral Paling Banyak Copy</h1>
          <p className="text-lightText text-lg">
            Prompt dengan jumlah copy tertinggi dari komunitas
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : prompts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-lightText">Belum ada prompt yang banyak dicopy</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {prompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                id={parseInt(prompt.id)}
                title={prompt.title}
                category={prompt.category}
                fullPrompt={prompt.full_prompt}
                imageUrl={prompt.image_url}
                copyCount={prompt.copy_count}
                onCopy={() => handleCopy(prompt.id, prompt.full_prompt)}
                onClick={() => handleCardClick(prompt)}
              />
            ))}
          </div>
        )}
      </div>

      <Footer />
      <FloatingCTA />

      <PromptDetailModal
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        prompt={selectedPrompt}
        onCopy={() => {
          if (selectedPrompt) {
            const originalPrompt = prompts.find(p => p.full_prompt === selectedPrompt.fullPrompt);
            if (originalPrompt) {
              handleCopy(originalPrompt.id, selectedPrompt.fullPrompt);
            }
          }
        }}
      />
      <LoginModal
        open={isLoginModalOpen}
        onOpenChange={setIsLoginModalOpen}
      />
    </div>
  );
};

export default MostCopiedPrompts;
