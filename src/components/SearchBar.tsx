import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  keywords?: string[];
}

const SearchBar = ({ searchQuery, onSearchChange, keywords = [] }: SearchBarProps) => {
  return (
    <section className="w-full py-6 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari di judul dan isi prompt..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-12 h-12 bg-input border-border text-foreground placeholder:text-muted-foreground rounded-xl"
            />
          </div>
          
          {/* Keyword Suggestions */}
          {keywords.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground mr-1">Kata kunci populer:</span>
              {keywords.map((keyword) => (
                <Badge
                  key={keyword}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => onSearchChange(keyword)}
                >
                  {keyword}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SearchBar;
