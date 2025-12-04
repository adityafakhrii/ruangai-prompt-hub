import { Badge } from "@/components/ui/badge";
import { Image, Video, User, Code, Briefcase } from "lucide-react";
import { motion } from "framer-motion";

const mainCategories = [
  { name: "Image", icon: Image, isNew: false },
  { name: "Video", icon: Video, isNew: false },
  { name: "Persona", icon: User, isNew: false },
  { name: "Vibe Coding", icon: Code, isNew: false },
  { name: "Produktivitas", icon: Briefcase, isNew: true },
];

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const CategoryFilter = ({ selectedCategory, onSelectCategory }: CategoryFilterProps) => {
  return (
    <section className="w-full py-8" id="kategori">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-foreground mb-6">Kategori</h2>

        {/* Main Categories */}
        <div className="flex flex-wrap gap-3">
          {mainCategories.map((category, index) => (
            <motion.button
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -2 }}
              onClick={() => onSelectCategory(selectedCategory === category.name ? "" : category.name)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium hover:shadow-lg transition-all ${selectedCategory === category.name
                ? "bg-primary text-primary-foreground"
                : "bg-primary-light text-heading"
                }`}
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
      </div>
    </section>
  );
};

export default CategoryFilter;
