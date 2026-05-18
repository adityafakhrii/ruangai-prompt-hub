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
      <main className="flex-grow container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-16">
          {/* Header Section */}
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
              Tentang RuangAI
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              RuangAI Prompt Hub adalah platform komunitas terdepan di Indonesia yang didedikasikan untuk berbagi, 
              menemukan, dan mengembangkan prompt Artificial Intelligence (AI) berkualitas tinggi.
            </p>
          </div>

          {/* Intro Section */}
          <section className="bg-card rounded-2xl p-8 shadow-sm border border-border/50 text-center">
            <p className="text-xl leading-relaxed text-muted-foreground">
              Kami percaya bahwa kunci untuk membuka potensi penuh dari teknologi AI seperti ChatGPT, Midjourney, 
              dan Gemini terletak pada kemampuan untuk menyusun instruksi atau <span className="font-semibold text-foreground">"prompt"</span> yang efektif.
            </p>
          </section>

          {/* Visi & Misi */}
          <div className="grid md:grid-cols-2 gap-8">
            <section className="bg-card rounded-2xl p-8 shadow-sm border border-border/50 h-full">
              <h2 className="text-2xl font-bold mb-6">Visi Kami</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Membangun ekosistem kreatif di mana setiap orang dapat belajar dan menguasai teknologi AI 
                melalui kolaborasi dan berbagi pengetahuan.
              </p>
            </section>

            <section className="bg-card rounded-2xl p-8 shadow-sm border border-border/50 h-full">
              <h2 className="text-2xl font-bold mb-6">Misi Kami</h2>
              <ul className="space-y-4">
                {[
                  "Menyediakan repositori prompt yang terkurasi dan berkualitas.",
                  "Memfasilitasi pembelajaran penggunaan AI yang efektif.",
                  "Menghubungkan para antusias dan profesional AI di Indonesia."
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-lg text-muted-foreground">
                    <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
