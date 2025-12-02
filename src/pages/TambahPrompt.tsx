import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect } from "react";

const categories = [
  "Image", "Video", "Persona", "Vibe Coding", "Baby", "Cinematic", 
  "Conceptual", "Couple", "Fashion", "Portrait", "Food", "Illustration"
];

const TambahPrompt = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [promptText, setPromptText] = useState("");
  const [fullPrompt, setFullPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isViral, setIsViral] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "Anda harus login terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("prompts").insert({
      user_id: user.id,
      title,
      category,
      prompt_text: promptText,
      full_prompt: fullPrompt,
      image_url: imageUrl || null,
      is_viral: isViral,
    });

    if (error) {
      toast({
        title: "Gagal menambahkan prompt",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Prompt berhasil ditambahkan!",
        description: "Prompt Anda telah dipublikasikan.",
      });
      navigate('/');
    }

    setLoading(false);
  };

  if (authLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-foreground">Loading...</p>
    </div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-2">Tambah Prompt Baru</h1>
          <p className="text-lightText mb-8">
            Bagikan prompt AI terbaik Anda dengan komunitas
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Judul Prompt</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Cinematic Portrait Photography"
                required
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Kategori</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prompt-text">Prompt Singkat (Preview)</Label>
              <Textarea
                id="prompt-text"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Deskripsi singkat prompt (maks 3 baris)..."
                required
                rows={3}
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="full-prompt">Full Prompt</Label>
              <Textarea
                id="full-prompt"
                value={fullPrompt}
                onChange={(e) => setFullPrompt(e.target.value)}
                placeholder="Tulis full prompt lengkap di sini..."
                required
                rows={8}
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image-url">URL Gambar (opsional)</Label>
              <Input
                id="image-url"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="bg-input border-border"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is-viral"
                checked={isViral}
                onCheckedChange={setIsViral}
              />
              <Label htmlFor="is-viral" className="cursor-pointer">
                Tandai sebagai Prompt Viral
              </Label>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary/90"
                disabled={loading}
              >
                {loading ? "Menyimpan..." : "Publikasikan Prompt"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-border"
                onClick={() => navigate('/')}
              >
                Batal
              </Button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TambahPrompt;
