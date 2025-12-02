import { Badge } from "@/components/ui/badge";
import { Image, Video, User, Code, Palette, Camera, Film, Lightbulb, Heart, Users } from "lucide-react";
import { motion } from "framer-motion";

const mainCategories = [
  { name: "Image", icon: Image, isNew: false },
  { name: "Video", icon: Video, isNew: true },
  { name: "Persona", icon: User, isNew: false },
  { name: "Vibe Coding", icon: Code, isNew: true },
];

const additionalCategories = [
  { name: "Baby", icon: Heart },
  { name: "Cinematic", icon: Film },
  { name: "Conceptual", icon: Lightbulb },
  { name: "Couple", icon: Users },
  { name: "Fashion", icon: Palette },
  { name: "Portrait", icon: Camera },
];

const CategoryFilter = () => {
  return (
    <section className="w-full py-8" id="kategori">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-foreground mb-6">Kategori</h2>
        
        {/* Main Categories */}
        <div className="flex flex-wrap gap-3 mb-8">
          {mainCategories.map((category, index) => (
            <motion.button
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -2 }}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary-light text-heading rounded-full font-medium hover:shadow-lg transition-all"
            >
              <category.icon className="h-4 w-4" />
              {category.name}
              {category.isNew && (
                <Badge variant="secondary" className="ml-1 text-xs bg-secondary text-white">
                  New
                </Badge>
              )}
            </motion.button>
          ))}
        </div>

        {/* Additional Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {additionalCategories.map((category, index) => (
            <motion.button
              key={category.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.05 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="relative overflow-hidden rounded-xl aspect-square bg-card border border-border hover:border-primary transition-all group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 opacity-50 group-hover:opacity-70 transition-opacity" />
              <div className="relative h-full flex flex-col items-center justify-center gap-2 p-4">
                <category.icon className="h-8 w-8 text-foreground group-hover:text-primary transition-colors" />
                <span className="text-sm font-medium text-foreground">{category.name}</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryFilter;
