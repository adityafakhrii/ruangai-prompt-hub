import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import CategoryFilter from "@/components/CategoryFilter";
import SearchBar from "@/components/SearchBar";
import InfoBar from "@/components/InfoBar";
import PromptCard from "@/components/PromptCard";
import PromptDetailModal from "@/components/PromptDetailModal";
import LoginModal from "@/components/LoginModal";
import FloatingCTA from "@/components/FloatingCTA";
import Footer from "@/components/Footer";

interface Prompt {
  id: string;
  title: string;
  category: string;
  prompt_text: string;
  full_prompt: string;
  image_url: string | null;
  copy_count: number;
  created_at: string;
}

const Index = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [filteredPrompts, setFilteredPrompts] = useState<Prompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [copyCount, setCopyCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("trending");
  
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchPrompts();
  }, []);

  useEffect(() => {
    filterAndSortPrompts();
  }, [prompts, searchQuery, selectedCategory, sortBy]);

  const fetchPrompts = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from("prompts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Gagal memuat prompts",
        variant: "destructive",
      });
    } else {
      setPrompts(data || []);
    }

    setLoading(false);
  };

  const filterAndSortPrompts = () => {
    let filtered = [...prompts];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.prompt_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Sort
    switch (sortBy) {
      case "terbaru":
        // Already sorted by created_at desc from query
        break;
      case "viral":
        filtered.sort((a, b) => (b.copy_count || 0) - (a.copy_count || 0));
        break;
      case "most-copied":
        filtered.sort((a, b) => (b.copy_count || 0) - (a.copy_count || 0));
        break;
      case "trending":
      default:
        // Mix of recency and copy count
        filtered.sort((a, b) => {
          const scoreA = (a.copy_count || 0) * 0.7 + (new Date(a.created_at).getTime() / 1000000);
          const scoreB = (b.copy_count || 0) * 0.7 + (new Date(b.created_at).getTime() / 1000000);
          return scoreB - scoreA;
        });
    }

    setFilteredPrompts(filtered);
  };

  const handleCopy = async (promptId: string, fullPrompt: string) => {
    navigator.clipboard.writeText(fullPrompt);
    
    // Increment copy count
    const { error } = await supabase
      .from("prompts")
      .update({ copy_count: prompts.find(p => p.id === promptId)?.copy_count! + 1 })
      .eq("id", promptId);

    toast({
      title: "Prompt disalin!",
      description: "Prompt berhasil disalin ke clipboard.",
    });

    // Refresh prompts to get updated copy count
    fetchPrompts();

    if (!user) {
      const newCount = copyCount + 1;
      setCopyCount(newCount);
      if (newCount >= 3) {
        setIsLoginModalOpen(true);
        setCopyCount(0);
      }
    }
  };

  const handleCardClick = (prompt: Prompt) => {
    setSelectedPrompt({
      title: prompt.title,
      category: prompt.category,
      prompt: prompt.prompt_text,
      fullPrompt: prompt.full_prompt,
      imageUrl: prompt.image_url || "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=600&fit=crop",
    });
    setIsDetailModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CategoryFilter 
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
      <SearchBar 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />
      <InfoBar />
      
      {/* Prompt Grid */}
      <section className="w-full py-8">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-96 bg-card animate-pulse rounded-xl" />
              ))}
            </div>
          ) : filteredPrompts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-2xl text-lightText">
                {searchQuery || selectedCategory
                  ? "Tidak ada prompt yang sesuai dengan filter"
                  : "Belum ada prompt. Jadilah yang pertama menambahkan!"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPrompts.map((prompt) => (
                <PromptCard
                  key={prompt.id}
                  id={parseInt(prompt.id)}
                  title={prompt.title}
                  category={prompt.category}
                  prompt={prompt.prompt_text}
                  imageUrl={prompt.image_url || "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=600&fit=crop"}
                  onCopy={() => handleCopy(prompt.id, prompt.full_prompt)}
                  onClick={() => handleCardClick(prompt)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
      <FloatingCTA />

      {/* Modals */}
      <PromptDetailModal
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        prompt={selectedPrompt}
        onCopy={() => selectedPrompt && handleCopy(selectedPrompt.id, selectedPrompt.fullPrompt)}
      />
      <LoginModal
        open={isLoginModalOpen}
        onOpenChange={setIsLoginModalOpen}
      />
    </div>
  );
};

export default Index;
