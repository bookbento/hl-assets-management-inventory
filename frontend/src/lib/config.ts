export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const resolveMediaUrl = (path?: string | null) => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_URL}${path}`;
};
