import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const reduceImageSize = async (base64Image, maxSizeKB = 100) => {
  const img = new Image();
  img.src = base64Image;

  return new Promise((resolve, reject) => {
    img.onload = () => {
      let quality = 1; // Initial quality (highest)
      let canvas = document.createElement('canvas');
      let ctx = canvas.getContext('2d');
      
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the image on the canvas
      ctx.drawImage(img, 0, 0);

      // Convert the canvas to Base64 with quality (initially 1, full quality)
      let compressedBase64 = canvas.toDataURL('image/jpeg', quality);

      // Check size and adjust if necessary
      while (getBase64Size(compressedBase64) > maxSizeKB * 1024 && quality > 0.1) {
        quality -= 0.1;  // Reduce quality by 10% until the size is under the limit
        compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      }

      resolve(compressedBase64);
    };

    img.onerror = (error) => {
      reject(error);
    };
  });
};

// Function to get the size of a Base64 string in bytes
const getBase64Size = (base64String) => {
  const padding = base64String.indexOf("=") === -1 ? 0 : base64String.length % 4;
  const size = (base64String.length * 3 / 4) - padding;
  return size;
};

