import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const maskEmail = (email: string): string => {
  const atIndex = email.indexOf('@');
  if (atIndex === -1) return email;

  const [localPart, domain] = email.split('@');
  const dotIndex = domain.lastIndexOf('.');

  if (dotIndex === -1) return email;

  const domainName = domain.substring(0, dotIndex);
  const domainExt = domain.substring(dotIndex);

  // Show first 3 chars of local part (or less if shorter)
  const visibleLocal = localPart.substring(0, 3);
  const maskedLocal = visibleLocal + '*'.repeat(Math.max(0, localPart.length - 3));

  // Show first 1 char of domain name
  const visibleDomain = domainName.substring(0, 1);
  const maskedDomain = visibleDomain + '*'.repeat(Math.max(0, domainName.length - 1));
  return `${maskedLocal}@${maskedDomain}${domainExt}`;
};

export const getOptimizedImageUrl = (url: string, width: number = 400): string => {
  if (!url) return '';
  // Check if it's a Supabase Storage URL
  if (url.includes('supabase.co/storage/v1/object/public')) {
    return `${url}?width=${width}&quality=80&format=webp`;
  }
  return url;
};

export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-')   // Replace multiple - with single -
    .replace(/^-+/, '')       // Trim - from start of text
    .replace(/-+$/, '');      // Trim - from end of text
};
