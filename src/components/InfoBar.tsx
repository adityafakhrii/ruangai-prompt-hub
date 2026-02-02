import { Info, X, ChevronRight } from "lucide-react";
import { useState } from "react";

const InfoBar = () => {
  const [isVisible, setIsVisible] = useState(true);

  const currentDate = new Date().toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  if (!isVisible) return null;

  return (
    <div className="w-full bg-secondary text-white py-1.5 md:py-2">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-2 relative">
          {/* Content */}
          <div className="flex items-center gap-2 text-center justify-center whitespace-nowrap overflow-hidden pr-6">
            <span className="bg-primary text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0">
              Info
            </span>
            <p className="text-[10px] sm:text-sm text-slate-100 leading-tight truncate">
              Prompt terus di-update berkala. Update terakhir: <span className="font-medium text-white">{currentDate}</span>.
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={() => setIsVisible(false)}
            className="absolute right-0 p-1 rounded-full hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Tutup info"
          >
            <X className="h-3 w-3 md:h-4 md:w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoBar;
