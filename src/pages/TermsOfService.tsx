import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Syarat dan Ketentuan"
        description="Syarat dan Ketentuan Penggunaan RuangAI Prompt Hub"
      />
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto prose dark:prose-invert">
          <h1 className="text-4xl font-bold mb-8">Syarat dan Ketentuan</h1>
          
          <p className="text-muted-foreground mb-6">Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <h3>1. Persetujuan Syarat</h3>
          <p>
            Dengan mengakses atau menggunakan layanan RuangAI, Anda menyetujui untuk terikat oleh Syarat dan Ketentuan ini. 
            Jika Anda tidak setuju, mohon untuk tidak menggunakan layanan kami.
          </p>

          <h3>2. Akun Pengguna</h3>
          <p>
            Untuk mengakses fitur tertentu, Anda mungkin perlu mendaftar akun. Anda bertanggung jawab untuk menjaga kerahasiaan 
            akun Anda dan semua aktivitas yang terjadi di bawah akun tersebut.
          </p>

          <h3>3. Konten Pengguna</h3>
          <p>
            Anda mempertahankan hak atas konten (prompt) yang Anda bagikan, namun Anda memberikan lisensi kepada RuangAI 
            untuk menampilkan, mendistribusikan, dan mempromosikan konten tersebut di platform kami.
          </p>

          <h3>4. Larangan Penggunaan</h3>
          <p>
            Anda dilarang menggunakan layanan ini untuk:
          </p>
          <ul>
            <li>Tindakan ilegal atau melanggar hukum</li>
            <li>Menyebarkan konten berbahaya, SARA, atau pornografi</li>
            <li>Mencoba merusak atau mengganggu keamanan sistem</li>
          </ul>

          <h3>5. Perubahan Layanan</h3>
          <p>
            Kami berhak untuk mengubah atau menghentikan layanan sewaktu-waktu tanpa pemberitahuan sebelumnya.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;
