import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
}

const SEO = ({ title, description, canonical, ogImage, ogType = "website" }: SEOProps) => {
  const siteName = "RuangAI Prompt Hub";
  const fullTitle = `${title} | ${siteName}`;
  // Fallback to window.location.origin if not available (in SSR scenarios this might need adjustment, but this is SPA)
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ruangai-prompt-hub.vercel.app';
  const image = ogImage || `${baseUrl}/iconbiru.png`;
  const url = canonical || (typeof window !== 'undefined' ? window.location.href : baseUrl);

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

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
    </Helmet>
  );
};

export default SEO;
