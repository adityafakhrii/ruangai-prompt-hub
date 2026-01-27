import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useBookmarks } from "@/hooks/useBookmarks";
import { fetchBookmarkedPromptsWithCreator, PromptWithCreator } from "@/lib/promptQueries";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PromptCard from "@/components/PromptCard";
import PromptDetailModal from "@/components/PromptDetailModal";
import FloatingCTA from "@/components/FloatingCTA";
import SkeletonCard from "@/components/SkeletonCard";
import SEO from "@/components/SEO";
import SearchBar from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SavedPrompts = () => {
  const [prompts, setPrompts] = useState<PromptWithCreator[]>([]);
  const [filteredPrompts, setFilteredPrompts] = useState<PromptWithCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrompt, setSelectedPrompt] = useState<{
    id: string;
    title: string;
    category: string;
    prompt: string;
    fullPrompt: string;
    imageUrl: string;
    copyCount?: number;
    creatorEmail?: string | null;
    averageRating?: number;
    reviewCount?: number;
  } | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [categories, setCategories] = useState<string[]>([]);

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

      // Extract unique categories
      const uniqueCategories = Array.from(new Set(fetchedPrompts.map(p => p.category).filter((c): c is string => !!c)));
      setCategories(uniqueCategories as string[]);
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

  // Filter prompts based on search and category
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

    if (selectedCategory && selectedCategory !== "all") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    setFilteredPrompts(result);
  }, [prompts, searchQuery, selectedCategory]);

  const handleCopy = async (promptId: string, fullPrompt: string) => {
    navigator.clipboard.writeText(fullPrompt);
    await supabase.rpc('increment_copy_count', { prompt_id: promptId });
    toast({
      title: "Prompt disalin!",
      description: "Prompt berhasil disalin ke clipboard.",
    });
  };

  const handleCardClick = (prompt: PromptWithCreator) => {
    setSelectedPrompt({
      id: prompt.id,
      title: prompt.title,
      category: prompt.category,
      prompt: prompt.full_prompt,
      fullPrompt: prompt.full_prompt,
      imageUrl: prompt.image_url || "",
      copyCount: prompt.copy_count,
      creatorEmail: prompt.profiles?.email || null,
      averageRating: prompt.average_rating,
      reviewCount: prompt.review_count,
    });
    setIsDetailModalOpen(true);
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
          <h1 className="text-4xl font-bold text-foreground mb-2">Prompt Tersimpan</h1>
          <p className="text-muted-foreground text-lg">
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full md:w-auto min-w-[150px]">
                <Filter className="w-4 h-4 mr-2" />
                {selectedCategory === "all" ? "Semua Kategori" : selectedCategory}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSelectedCategory("all")}>
                Semua Kategori
              </DropdownMenuItem>
              {categories.map((category) => (
                <DropdownMenuItem
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
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
              {searchQuery || selectedCategory !== "all"
                ? "Tidak ada prompt yang sesuai filter"
                : "Belum ada prompt yang disimpan"}
            </p>
            {!searchQuery && selectedCategory === "all" && (
              <Button onClick={() => navigate("/")} variant="outline">
                Jelajahi Prompt
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredPrompts.map((prompt) => (
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
        onCopy={() => selectedPrompt && handleCopy(selectedPrompt.id, selectedPrompt.fullPrompt)}
      />
    </div>
  );
};

export default SavedPrompts;
