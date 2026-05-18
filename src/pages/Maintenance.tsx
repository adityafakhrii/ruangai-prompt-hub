import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Maintenance = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/10 to-secondary/10 flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center space-y-8">
        {/* Image Section */}
        <div className="relative mx-auto max-w-[300px]">
          <img 
            src="https://ltdwpaciulpophywcuam.supabase.co/storage/v1/object/public/shared-images/1779078037387-hn1x70.webp" 
            alt="Maintenance" 
            className="w-full rounded-2xl"
          />
        </div>

        {/* Text Content - Fun "Main Tenis" Copy */}
        <div className="space-y-4">
          <h1 className="text-3xl md:text-5xl font-bold text-foreground">
            Mohon Maaf
          </h1>
          <h2 className="text-2xl md:text-4xl font-bold text-primary">
            Kami sedang main tenis*
          </h2>
          <p className="text-xs text-muted-foreground italic">
            *main tenis = maintenance
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed pt-2">
            Tim kami sedang meningkatkan sistem untuk memberikan pengalaman yang lebih canggih dan nyaman untuk Anda.
          </p>
        </div>

        {/* Button */}
        <div className="pt-4">
          <Button 
            onClick={() => window.location.href = "https://ruangai.id"} 
            className="w-full sm:w-auto gap-2 h-12 px-8 text-base bg-primary hover:bg-primary/90"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali ke RuangAI
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
