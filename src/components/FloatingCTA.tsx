import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const FloatingCTA = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed bottom-24 md:bottom-6 right-6 z-40"
    >
      <Button
        size="lg"
        className="rounded-full bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-lg hover:shadow-xl transition-all px-6"
        onClick={() => window.open('https://ruangai.id', '_blank')}
      >
        Belajar Prompt
        <ExternalLink className="ml-2 h-4 w-4" />
      </Button>
    </motion.div>
  );
};

export default FloatingCTA;
