export const isImageLoaded = (loaded: Set<string>, url: string) =>
  loaded.has(url);

export const handleImageError = (
  setLoaded: React.Dispatch<React.SetStateAction<Set<string>>>,
  url: string,
) => {
  setLoaded((prev) => new Set([...prev, url]));
};
