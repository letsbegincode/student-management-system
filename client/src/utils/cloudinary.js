export function getOptimizedImageUrl(url, width = 200, height = 200) {
  if (!url || !url.includes('cloudinary.com')) return url;
  
  // Insert transformation parameters before the version number or public ID
  const parts = url.split('/upload/');
  if (parts.length !== 2) return url;
  
  const transformations = `w_${width},h_${height},c_fill,q_auto,f_auto`;
  return `${parts[0]}/upload/${transformations}/${parts[1]}`;
}
