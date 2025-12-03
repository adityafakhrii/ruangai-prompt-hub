import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="FAQ"
        description="Pertanyaan yang sering diajukan tentang RuangAI Prompt Hub"
      />
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">Frequently Asked Questions</h1>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Apa itu RuangAI Prompt Hub?</AccordionTrigger>
              <AccordionContent>
                RuangAI Prompt Hub adalah platform komunitas untuk berbagi, menemukan, dan menggunakan prompt AI berkualitas 
                untuk berbagai tools seperti ChatGPT, Midjourney, dan lainnya.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>Apakah layanan ini gratis?</AccordionTrigger>
              <AccordionContent>
                Ya, Anda dapat mencari dan menyalin prompt secara gratis. Beberapa fitur premium mungkin akan tersedia di masa mendatang.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger>Bagaimana cara menyalin prompt?</AccordionTrigger>
              <AccordionContent>
                Cukup klik tombol "Copy" pada kartu prompt yang Anda inginkan, dan prompt akan otomatis tersalin ke clipboard Anda.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger>Apakah saya bisa membagikan prompt saya sendiri?</AccordionTrigger>
              <AccordionContent>
                Tentu saja! Kami sangat mendorong pengguna untuk berkontribusi dengan membagikan prompt terbaik mereka kepada komunitas.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger>Apakah saya perlu mendaftar akun?</AccordionTrigger>
              <AccordionContent>
                Anda bisa melihat-lihat prompt tanpa mendaftar, namun untuk membagikan prompt dan menyimpan prompt favorit, 
                Anda perlu membuat akun.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;
