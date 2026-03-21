export function getImageUrl(url: string | null | undefined): string {
  if (!url) return "/placeholder.png";
  
  // Handle pipe separated URLs from Cloudinary
  const cleanedUrl = url.includes("|") ? url.split("|")[0] : url;
  
  // Handle relative paths from backend
  if (cleanedUrl.startsWith("/uploads")) {
    return `https://seoul-spicy-production.up.railway.app${cleanedUrl}`;
  }
  
  return cleanedUrl;
}
