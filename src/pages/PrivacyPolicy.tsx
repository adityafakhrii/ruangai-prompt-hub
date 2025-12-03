import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Kebijakan Privasi"
        description="Kebijakan Privasi RuangAI Prompt Hub"
      />
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto prose dark:prose-invert">
          <h1 className="text-4xl font-bold mb-8">Kebijakan Privasi</h1>
          
          <p className="text-muted-foreground mb-6">Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <h3>1. Pendahuluan</h3>
          <p>
            Kami di RuangAI ("kami", "kita", atau "milik kami") menghargai privasi Anda dan berkomitmen untuk melindungi data pribadi Anda. 
            Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi Anda.
          </p>

          <h3>2. Informasi yang Kami Kumpulkan</h3>
          <p>
            Kami dapat mengumpulkan informasi berikut:
          </p>
          <ul>
            <li>Informasi akun (nama, email, password terenkripsi)</li>
            <li>Prompt yang Anda bagikan dan interaksi dengan konten</li>
            <li>Data penggunaan dan analitik teknis</li>
          </ul>

          <h3>3. Penggunaan Informasi</h3>
          <p>
            Informasi yang kami kumpulkan digunakan untuk:
          </p>
          <ul>
            <li>Menyediakan dan memelihara layanan kami</li>
            <li>Meningkatkan pengalaman pengguna</li>
            <li>Mengirimkan pembaruan penting terkait layanan</li>
            <li>Mencegah penyalahgunaan platform</li>
          </ul>

          <h3>4. Keamanan Data</h3>
          <p>
            Kami menerapkan langkah-langkah keamanan yang wajar untuk melindungi informasi Anda dari akses, 
            pengungkapan, perubahan, atau perusakan yang tidak sah.
          </p>

          <h3>5. Hubungi Kami</h3>
          <p>
            Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, silakan hubungi kami melalui halaman Kontak.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
