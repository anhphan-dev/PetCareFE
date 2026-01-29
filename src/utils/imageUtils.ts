// Helper function to get full image URL
export const getImageUrl = (
  path: string | null | undefined
): string | undefined => {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;

  const baseUrl =
    import.meta.env.VITE_API_URL || 'https://localhost:54813/api';

  return baseUrl.replace('/api', '') + path;
};