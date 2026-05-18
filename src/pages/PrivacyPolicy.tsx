import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const PrivacyPolicy = () => {
  const lastUpdated = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Kebijakan Privasi"
        description="Kebijakan Privasi RuangAI Prompt Hub"
      />
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-foreground">
              Kebijakan Privasi
            </h1>
            <p className="text-muted-foreground text-lg">
              Terakhir diperbarui: {lastUpdated}
            </p>
          </div>

          <div className="space-y-8">
            <section className="bg-card rounded-xl p-6 md:p-8 shadow-sm border border-border/50">
              <h2 className="text-2xl font-bold mb-4">1. Pendahuluan</h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                Kami di RuangAI ("kami", "kita", atau "milik kami") menghargai privasi Anda dan berkomitmen untuk melindungi data pribadi Anda. 
                Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi Anda.
              </p>
            </section>

            <section className="bg-card rounded-xl p-6 md:p-8 shadow-sm border border-border/50">
              <h2 className="text-2xl font-bold mb-4">2. Informasi yang Kami Kumpulkan</h2>
              <p className="text-muted-foreground leading-relaxed text-lg mb-4">
                Kami dapat mengumpulkan informasi berikut:
              </p>
              <ul className="space-y-3">
                {[
                  "Informasi akun (nama, email, password terenkripsi)",
                  "Prompt yang Anda bagikan dan interaksi dengan konten",
                  "Data penggunaan dan analitik teknis"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-muted-foreground text-lg">
                    <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="bg-card rounded-xl p-6 md:p-8 shadow-sm border border-border/50">
              <h2 className="text-2xl font-bold mb-4">3. Penggunaan Informasi</h2>
              <p className="text-muted-foreground leading-relaxed text-lg mb-4">
                Informasi yang kami kumpulkan digunakan untuk:
              </p>
              <ul className="grid md:grid-cols-2 gap-4">
                {[
                  "Menyediakan dan memelihara layanan kami",
                  "Meningkatkan pengalaman pengguna",
                  "Mengirimkan pembaruan penting terkait layanan",
                  "Mencegah penyalahgunaan platform"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-muted-foreground text-lg bg-background p-4 rounded-lg border border-border/50">
                    <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="bg-card rounded-xl p-6 md:p-8 shadow-sm border border-border/50">
              <h2 className="text-2xl font-bold mb-4">4. Keamanan Data</h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                Kami menerapkan langkah-langkah keamanan yang wajar untuk melindungi informasi Anda dari akses, 
                pengungkapan, perubahan, atau perusakan yang tidak sah.
              </p>
            </section>

            <section className="bg-card rounded-xl p-6 md:p-8 shadow-sm border border-border/50">
              <h2 className="text-2xl font-bold mb-4">5. Hubungi Kami</h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, silakan hubungi kami melalui halaman Kontak.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
