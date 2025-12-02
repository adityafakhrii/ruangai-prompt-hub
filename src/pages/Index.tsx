import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import CategoryFilter from "@/components/CategoryFilter";
import SearchBar from "@/components/SearchBar";
import InfoBar from "@/components/InfoBar";
import PromptCard from "@/components/PromptCard";
import PromptDetailModal from "@/components/PromptDetailModal";
import LoginModal from "@/components/LoginModal";
import FloatingCTA from "@/components/FloatingCTA";
import Footer from "@/components/Footer";

// Mock data for prompts
const mockPrompts = [
  {
    id: 1,
    title: "Cinematic Portrait Photography",
    category: "Portrait",
    prompt: "Create a professional cinematic portrait with dramatic lighting...",
    fullPrompt: "Create a professional cinematic portrait with dramatic lighting, shallow depth of field, warm color grading. Subject should be positioned with rule of thirds, soft natural light from window creating Rembrandt lighting pattern. Camera settings: 85mm f/1.4, ISO 400. Style: Editorial magazine quality.",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop",
  },
  {
    id: 2,
    title: "Product Photography Setup",
    category: "Image",
    prompt: "Professional product photography with clean white background...",
    fullPrompt: "Professional product photography with clean white background, studio lighting setup with key light at 45 degrees, fill light opposite side, rim light from behind. High-key lighting for clean commercial look. Camera: 100mm macro, f/11, ISO 100. Post-processing: Slight color correction, sharp details.",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop",
  },
  {
    id: 3,
    title: "AI Assistant Persona",
    category: "Persona",
    prompt: "Act as a professional business consultant with 10 years experience...",
    fullPrompt: "Act as a professional business consultant with 10 years experience in digital transformation. Your communication style is professional yet approachable. You provide strategic insights backed by data and real-world examples. Always structure your responses with clear action items and consider both short-term and long-term implications.",
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=600&fit=crop",
  },
  {
    id: 4,
    title: "Cinematic Drone Shot",
    category: "Video",
    prompt: "Epic aerial drone shot descending through clouds at golden hour...",
    fullPrompt: "Epic aerial drone shot descending through clouds at golden hour, revealing a stunning coastal landscape. Camera movement: Slow descending spiral with slight forward push. Settings: 4K 24fps, ND16 filter, manual exposure locked. Color grade: Warm tones with crushed blacks and lifted highlights for that cinematic look.",
    imageUrl: "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&h=600&fit=crop",
  },
  {
    id: 5,
    title: "React Component Generator",
    category: "Vibe Coding",
    prompt: "Generate a reusable React component with TypeScript...",
    fullPrompt: "Generate a reusable React component with TypeScript that follows best practices: functional component with proper typing, custom hooks for logic separation, memoization where appropriate, accessibility features (ARIA labels), responsive design with Tailwind CSS, comprehensive prop validation, JSDoc comments for documentation.",
    imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop",
  },
  {
    id: 6,
    title: "Fashion Editorial Style",
    category: "Fashion",
    prompt: "High fashion editorial shoot with avant-garde styling...",
    fullPrompt: "High fashion editorial shoot with avant-garde styling. Composition: Dynamic angular poses, unconventional framing. Lighting: High contrast with colored gels (magenta/cyan). Location: Urban industrial setting. Styling: Bold geometric shapes, metallic textures. Camera: 50mm f/1.2, shot on medium format. Post: Saturated colors, film grain, vignette.",
    imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=600&fit=crop",
  },
];

const Index = () => {
  const [selectedPrompt, setSelectedPrompt] = useState<typeof mockPrompts[0] | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [copyCount, setCopyCount] = useState(0);
  const { toast } = useToast();

  const handleCopy = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast({
      title: "Prompt disalin!",
      description: "Prompt berhasil disalin ke clipboard.",
    });

    const newCount = copyCount + 1;
    setCopyCount(newCount);

    if (newCount >= 3) {
      setIsLoginModalOpen(true);
      setCopyCount(0);
    }
  };

  const handleCardClick = (prompt: typeof mockPrompts[0]) => {
    setSelectedPrompt(prompt);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CategoryFilter />
      <SearchBar />
      <InfoBar />
      
      {/* Prompt Grid */}
      <section className="w-full py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockPrompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                {...prompt}
                onCopy={() => handleCopy(prompt.fullPrompt)}
                onClick={() => handleCardClick(prompt)}
              />
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <FloatingCTA />

      {/* Modals */}
      <PromptDetailModal
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        prompt={selectedPrompt}
        onCopy={() => selectedPrompt && handleCopy(selectedPrompt.fullPrompt)}
      />
      <LoginModal
        open={isLoginModalOpen}
        onOpenChange={setIsLoginModalOpen}
      />
    </div>
  );
};

export default Index;
