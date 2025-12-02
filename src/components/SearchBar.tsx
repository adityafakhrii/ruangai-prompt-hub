import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

const SearchBar = () => {
  return (
    <section className="w-full py-6 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari prompt atau kata kunci..."
              className="pl-12 h-12 bg-input border-border text-foreground placeholder:text-muted-foreground rounded-xl"
            />
          </div>
          <Select defaultValue="trending">
            <SelectTrigger className="w-full md:w-[200px] h-12 bg-input border-border rounded-xl">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="trending">Trending</SelectItem>
              <SelectItem value="terbaru">Terbaru</SelectItem>
              <SelectItem value="viral">Viral</SelectItem>
              <SelectItem value="most-copied">Paling banyak dicopy</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </section>
  );
};

export default SearchBar;
