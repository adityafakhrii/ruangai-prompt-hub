import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  keywords?: string[];
  jsonLd?: Record<string, any>;
}

const SEO = ({ title, description, canonical, ogImage, ogType = "website", keywords, jsonLd }: SEOProps) => {
  const siteName = "RuangAI Prompt Hub";
  const fullTitle = `${title} | ${siteName}`;
  const baseUrl = "https://raiprompt.adityafakhri.com"; // Hardcoded production domain
  const image = ogImage || `${baseUrl}/iconbiru.png`;
  const url = canonical || (typeof window !== 'undefined' ? window.location.href : baseUrl);

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {keywords && keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(", ")} />
      )}

      {/* Open Graph */}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={url} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Structured Data (JSON-LD) */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
