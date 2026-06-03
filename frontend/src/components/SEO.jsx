import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SEO = ({ title, description, keywords, ogType = 'website', ogImage = 'https://stockpredict.ai/assets/preview-card.png', schema }) => {
  const location = useLocation();
  // Dynamically compute the canonical URL relative to the active deployment origin
  const canonicalUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${location.pathname}`
    : `https://stockpredict.ai${location.pathname}`;

  useEffect(() => {
    // 1. Update Document Title
    const originalTitle = document.title;
    if (title) {
      document.title = title;
    } else {
      document.title = 'Stock Price Prediction System – AI Trading Floor';
    }

    // Helper to update/create meta tags
    const updateMetaTag = (attribute, value, content) => {
      if (content === undefined || content === null) return;
      let tag = document.querySelector(`meta[${attribute}="${value}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attribute, value);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    // Helper to remove tags if they exist
    const removeMetaTag = (attribute, value) => {
      const tag = document.querySelector(`meta[${attribute}="${value}"]`);
      if (tag) tag.remove();
    };

    // 2. Set Meta Description & Keywords
    if (description) {
      updateMetaTag('name', 'description', description);
    }
    if (keywords) {
      updateMetaTag('name', 'keywords', keywords);
    }

    // 3. Set Open Graph (OG) tags
    updateMetaTag('property', 'og:title', title || 'Stock Price Prediction System');
    if (description) {
      updateMetaTag('property', 'og:description', description);
    }
    updateMetaTag('property', 'og:type', ogType);
    updateMetaTag('property', 'og:url', canonicalUrl);
    if (ogImage) {
      updateMetaTag('property', 'og:image', ogImage);
    }

    // 4. Set Twitter Card tags
    updateMetaTag('name', 'twitter:card', 'summary_large_image');
    updateMetaTag('name', 'twitter:title', title || 'Stock Price Prediction System');
    if (description) {
      updateMetaTag('name', 'twitter:description', description);
    }
    if (ogImage) {
      updateMetaTag('name', 'twitter:image', ogImage);
    }

    // 5. Manage Canonical Link tag
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // 6. Handle JSON-LD Structured Data
    let schemaScript = document.getElementById('seo-schema-jsonld');
    if (schema) {
      if (!schemaScript) {
        schemaScript = document.createElement('script');
        schemaScript.id = 'seo-schema-jsonld';
        schemaScript.type = 'application/ld+json';
        document.head.appendChild(schemaScript);
      }
      schemaScript.textContent = JSON.stringify(schema);
    } else {
      if (schemaScript) schemaScript.remove();
    }

    // Cleanup function when the component unmounts
    return () => {
      document.title = originalTitle;
      const currentSchemaScript = document.getElementById('seo-schema-jsonld');
      if (currentSchemaScript) currentSchemaScript.remove();
    };
  }, [title, description, keywords, ogType, ogImage, canonicalUrl, schema]);

  return null;
};

export default SEO;
