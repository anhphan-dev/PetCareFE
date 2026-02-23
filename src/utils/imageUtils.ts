// Helper function to get full image URL
export const getImageUrl = (
  path: string | null | undefined
): string | undefined => {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;

  const baseUrl =
<<<<<<< HEAD
    import.meta.env.VITE_API_URL || 'https://localhost:54813/api';
=======
    import.meta.env.VITE_API_URL || 'https://petcare-api-2026-bad653588c75.herokuapp.com/api';
>>>>>>> e24f4b7 (fix something)

  return baseUrl.replace('/api', '') + path;
};