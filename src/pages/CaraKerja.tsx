import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const CaraKerja = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Cara Kerja"
        description="Panduan cara menggunakan RuangAI Prompt Hub"
      />
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">Cara Kerja RuangAI</h1>
          
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="bg-card p-6 rounded-lg shadow-sm border border-border text-center">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
              <h3 className="text-xl font-semibold mb-3">Temukan Prompt</h3>
              <p className="text-muted-foreground">
                Jelajahi ribuan prompt yang telah dikurasi untuk berbagai kebutuhan, mulai dari penulisan, coding, hingga desain visual.
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg shadow-sm border border-border text-center">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
              <h3 className="text-xl font-semibold mb-3">Salin & Gunakan</h3>
              <p className="text-muted-foreground">
                Salin prompt pilihanmu dengan satu klik. Gunakan langsung di ChatGPT, Midjourney, Gemini, atau tools AI lainnya.
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg shadow-sm border border-border text-center">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
              <h3 className="text-xl font-semibold mb-3">Bagikan Karyamu</h3>
              <p className="text-muted-foreground">
                Punya prompt andalan? Bagikan ke komunitas dan bantu orang lain memaksimalkan potensi AI mereka.
              </p>
            </div>
          </div>

          <div className="mt-16 p-8 bg-muted rounded-xl">
            <h2 className="text-2xl font-bold mb-4 text-center">Tips Menggunakan Prompt</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <span className="font-bold text-primary">•</span>
                <p>Berikan konteks yang jelas pada AI agar hasil lebih akurat.</p>
              </div>
              <div className="flex gap-4">
                <span className="font-bold text-primary">•</span>
                <p>Gunakan kata kunci spesifik yang relevan dengan tujuanmu.</p>
              </div>
              <div className="flex gap-4">
                <span className="font-bold text-primary">•</span>
                <p>Jangan ragu untuk memodifikasi prompt agar sesuai dengan kebutuhan spesifikmu.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CaraKerja;
