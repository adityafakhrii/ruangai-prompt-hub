import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const About = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Tentang Kami"
        description="Tentang RuangAI Prompt Hub - Platform berbagi prompt AI terbaik Indonesia"
      />
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto prose dark:prose-invert">
          <h1 className="text-4xl font-bold mb-6">Tentang Kami</h1>
          <p className="text-lg mb-4">
            RuangAI Prompt Hub adalah platform komunitas terdepan di Indonesia yang didedikasikan untuk berbagi, 
            menemukan, dan mengembangkan prompt Artificial Intelligence (AI) berkualitas tinggi.
          </p>
          <p className="mb-4">
            Kami percaya bahwa kunci untuk membuka potensi penuh dari teknologi AI seperti ChatGPT, Midjourney, 
            dan Gemini terletak pada kemampuan untuk menyusun instruksi atau "prompt" yang efektif.
          </p>
          <h2 className="text-2xl font-semibold mt-8 mb-4">Visi Kami</h2>
          <p className="mb-4">
            Membangun ekosistem kreatif di mana setiap orang dapat belajar dan menguasai teknologi AI 
            melalui kolaborasi dan berbagi pengetahuan.
          </p>
          <h2 className="text-2xl font-semibold mt-8 mb-4">Misi Kami</h2>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Menyediakan repositori prompt yang terkurasi dan berkualitas.</li>
            <li>Memfasilitasi pembelajaran penggunaan AI yang efektif.</li>
            <li>Menghubungkan para antusias dan profesional AI di Indonesia.</li>
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
