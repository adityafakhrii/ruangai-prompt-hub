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
  const baseUrl = "https://prompt.ruangai.id"; // Updated to current domain
  const defaultImage = "https://image.web.id/images/clipboard-image-1753328088.png"; // Use the actual logo
  const image = ogImage ? (ogImage.startsWith('http') ? ogImage : baseUrl + ogImage) : defaultImage;
  const url = canonical || (typeof window !== 'undefined' ? window.location.href : baseUrl);

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {keywords && keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(", ")} />
      )}

      {/* Open Graph - Critical for WhatsApp */}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={url} />

      {/* Twitter - Also works for WhatsApp */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:url" content={url} />

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
