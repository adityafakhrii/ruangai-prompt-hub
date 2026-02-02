import { useState, useEffect, useCallback, forwardRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useBookmarks } from "@/hooks/useBookmarks";
import { fetchBookmarkedPromptsWithCreator, PromptWithCreator } from "@/lib/promptQueries";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PromptCard from "@/components/PromptCard";
import FloatingCTA from "@/components/FloatingCTA";
import SkeletonCard from "@/components/SkeletonCard";
import SEO from "@/components/SEO";
import SearchBar from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { VirtuosoGrid } from "react-virtuoso";
import { slugify } from "@/lib/utils";

const SavedPrompts = () => {
  const [prompts, setPrompts] = useState<PromptWithCreator[]>([]);
  const [filteredPrompts, setFilteredPrompts] = useState<PromptWithCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const { toast } = useToast();
  const { user } = useAuth();
  const { bookmarkedIds, toggleBookmark } = useBookmarks();
  const navigate = useNavigate();

  const fetchPrompts = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await fetchBookmarkedPromptsWithCreator(user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Gagal memuat prompt tersimpan",
        variant: "destructive",
      });
    } else {
      const fetchedPrompts = data || [];
      setPrompts(fetchedPrompts);
    }

    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      fetchPrompts();
    } else {
      setLoading(false);
    }
  }, [user, fetchPrompts]);

  // Filter prompts based on search
  useEffect(() => {
    let result = prompts;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.full_prompt.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
      );
    }

    setFilteredPrompts(result);
  }, [prompts, searchQuery]);

  const handleCopy = async (promptId: string, fullPrompt: string) => {
    navigator.clipboard.writeText(fullPrompt);
    await supabase.rpc('increment_copy_count', { prompt_id: promptId });
    toast({
      title: "Prompt disalin!",
      description: "Prompt berhasil disalin ke clipboard.",
    });
  };

  const handleCardClick = (prompt: PromptWithCreator) => {
    navigate(`/prompt/${slugify(prompt.title)}`);
  };

  if (!user && !loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold mb-4">Login Diperlukan</h1>
            <p className="text-muted-foreground mb-6">
              Silakan login untuk melihat koleksi prompt tersimpan Anda.
            </p>
            <Button onClick={() => navigate("/auth")}>Login Sekarang</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Prompt Tersimpan"
        description="Koleksi prompt AI yang Anda simpan."
      />
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-2">Prompt Tersimpan</h1>
          <p className="text-muted-foreground text-sm md:text-lg">
            Koleksi prompt favorit Anda
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8 items-start md:items-center">
          <div className="flex-1 w-full">
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              placeholder="Cari di prompt tersimpan..."
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredPrompts.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 rounded-lg">
            <p className="text-2xl text-lightText mb-4">
              {searchQuery
                ? "Tidak ada prompt yang sesuai pencarian"
                : "Belum ada prompt yang disimpan"}
            </p>
            {!searchQuery && (
              <Button onClick={() => navigate("/")} variant="outline">
                Jelajahi Prompt
              </Button>
            )}
          </div>
        ) : (
          <VirtuosoGrid
            useWindowScroll
            totalCount={filteredPrompts.length}
            overscan={200}
            components={{
              List: forwardRef(({ style, children, ...props }: any, ref) => (
                <div
                  ref={ref}
                  {...props}
                  style={style}
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6 pb-20"
                >
                  {children}
                </div>
              )),
              Item: ({ children, ...props }) => (
                <div {...props} className="w-full h-full">
                  {children}
                </div>
              )
            }}
            itemContent={(index) => {
              const prompt = filteredPrompts[index];
              return (
                <PromptCard
                  key={prompt.id}
                  id={prompt.id}
                  title={prompt.title}
                  category={prompt.category}
                  fullPrompt={prompt.full_prompt}
                  imageUrl={prompt.image_url}
                  copyCount={prompt.copy_count}
                  creatorEmail={prompt.profiles?.email || null}
                  status={prompt.status}
                  onCopy={() => handleCopy(prompt.id, prompt.full_prompt)}
                  onClick={() => handleCardClick(prompt)}
                  isBookmarked={bookmarkedIds.has(prompt.id)}
                  onToggleBookmark={(e) => {
                    toggleBookmark(prompt.id);
                    // Remove from local state immediately for real-time UI update
                    setPrompts(prev => prev.filter(p => p.id !== prompt.id));
                  }}
                  averageRating={prompt.average_rating}
                  reviewCount={prompt.review_count}
                />
              );
            }}
          />
        )}
      </div>

      <Footer />
      <FloatingCTA />
    </div>
  );
};

export default SavedPrompts;
