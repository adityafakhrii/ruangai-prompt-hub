import { Info } from "lucide-react";

const InfoBar = () => {
  const currentDate = new Date().toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <section className="w-full py-4">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 px-4 py-3 bg-primary-ultraLight border border-borderLight rounded-lg">
          <Info className="h-5 w-5 text-heading flex-shrink-0" />
          <p className="text-sm text-heading">
            Prompt terus di-update berkala. Update terakhir: {currentDate}.
            Disclaimer: Hak cipta prompt ini dilindungi. Kami tidak bertanggung jawab atas penyalahgunaan, dan tidak boleh diperjualbelikan.
          </p>
        </div>
      </div>
    </section>
  );
};

export default InfoBar;
