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
    <div className="w-full bg-secondary text-white py-2.5">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-3 relative">
          {/* Content */}
          <div className="flex items-center gap-2 text-center">
            <span className="bg-primary text-white text-xs font-semibold px-2 py-0.5 rounded-full">
              Info
            </span>
            <p className="text-xs sm:text-sm text-slate-100">
              Prompt terus di-update berkala. Update terakhir: <span className="font-medium text-white">{currentDate}</span>. Hak cipta prompt ini dilindungi.
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={() => setIsVisible(false)}
            className="absolute right-0 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Tutup info"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoBar;
