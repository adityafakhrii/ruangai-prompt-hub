import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const TermsOfService = () => {
  const lastUpdated = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Syarat dan Ketentuan"
        description="Syarat dan Ketentuan Penggunaan RuangAI Prompt Hub"
      />
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-foreground">
              Syarat dan Ketentuan
            </h1>
            <p className="text-muted-foreground text-lg">
              Terakhir diperbarui: {lastUpdated}
            </p>
          </div>

          <div className="space-y-8">
            <section className="bg-card rounded-xl p-6 md:p-8 shadow-sm border border-border/50">
              <h2 className="text-2xl font-bold mb-4">1. Persetujuan Syarat</h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                Dengan mengakses atau menggunakan layanan RuangAI, Anda menyetujui untuk terikat oleh Syarat dan Ketentuan ini. 
                Jika Anda tidak setuju, mohon untuk tidak menggunakan layanan kami.
              </p>
            </section>

            <section className="bg-card rounded-xl p-6 md:p-8 shadow-sm border border-border/50">
              <h2 className="text-2xl font-bold mb-4">2. Akun Pengguna</h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                Untuk mengakses fitur tertentu, Anda mungkin perlu mendaftar akun. Anda bertanggung jawab untuk menjaga kerahasiaan 
                akun Anda dan semua aktivitas yang terjadi di bawah akun tersebut.
              </p>
            </section>

            <section className="bg-card rounded-xl p-6 md:p-8 shadow-sm border border-border/50">
              <h2 className="text-2xl font-bold mb-4">3. Konten Pengguna</h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                Anda mempertahankan hak atas konten (prompt) yang Anda bagikan, namun Anda memberikan lisensi kepada RuangAI 
                untuk menampilkan, mendistribusikan, dan mempromosikan konten tersebut di platform kami.
              </p>
            </section>

            <section className="bg-card rounded-xl p-6 md:p-8 shadow-sm border border-border/50">
              <h2 className="text-2xl font-bold mb-4">4. Larangan Penggunaan</h2>
              <p className="text-muted-foreground leading-relaxed text-lg mb-4">
                Anda dilarang menggunakan layanan ini untuk:
              </p>
              <ul className="space-y-3">
                {[
                  "Tindakan ilegal atau melanggar hukum",
                  "Menyebarkan konten berbahaya, SARA, atau pornografi",
                  "Mencoba merusak atau mengganggu keamanan sistem"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-muted-foreground text-lg">
                    <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="bg-card rounded-xl p-6 md:p-8 shadow-sm border border-border/50">
              <h2 className="text-2xl font-bold mb-4">5. Perubahan Layanan</h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                Kami berhak untuk mengubah atau menghentikan layanan sewaktu-waktu tanpa pemberitahuan sebelumnya.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;
