export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebP?: boolean;
}

export async function compressImage(file: File, options: CompressionOptions = {}): Promise<File> {
  const { maxSizeMB = 1, maxWidthOrHeight = 1920, useWebP = true } = options;
  
  if (file.size / 1024 / 1024 < maxSizeMB && !useWebP) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > maxWidthOrHeight || height > maxWidthOrHeight) {
          if (width > height) {
            height = Math.round((height * maxWidthOrHeight) / width);
            width = maxWidthOrHeight;
          } else {
            width = Math.round((width * maxWidthOrHeight) / height);
            height = maxWidthOrHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Canvas context not available'));
        }

        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = useWebP ? 'image/webp' : file.type;
        const extension = useWebP ? 'webp' : file.name.split('.').pop();
        const newFileName = file.name.replace(/\.[^/.]+$/, "") + "_compressed." + extension;

        let quality = 0.9;
        const compress = () => {
          canvas.toBlob((blob) => {
            if (!blob) {
              return reject(new Error('Canvas to Blob failed'));
            }
            if (blob.size / 1024 / 1024 > maxSizeMB && quality > 0.1) {
              quality -= 0.1;
              compress();
            } else {
              resolve(new File([blob], newFileName, { type: mimeType }));
            }
          }, mimeType, quality);
        };
        compress();
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
}
