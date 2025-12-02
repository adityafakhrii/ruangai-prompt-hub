import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

const FloatingCTA = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1 }}
      className="fixed bottom-6 right-6 z-50"
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
