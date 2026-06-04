import { API_BASE_URL } from "@/api/axios";

export const BASE_URL = API_BASE_URL.replace(/\/api$/, "");

/**
 * Convert relative image path to full URL
 * Example:
 * /uploads/products/img.png → http://localhost:3030/uploads/products/img.png
 */
export const getImageUrl = (path?: string | null): string => {
  if (!path) return "";

  // already full URL (important for future cloud storage)
  if (path.startsWith("http")) return path;

  return `${BASE_URL}${path}`;
};
