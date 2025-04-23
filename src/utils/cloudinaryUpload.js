//import { CLOUDINARY_CLOUD_NAME } from "astro:env/client";
//import { CLOUDINARY_UPLOAD_PRESET} from "astro:env/client";

export const uploadToCloudinary = async (file, folder = 'differentest-lesson-images/badges') => {
  try {
    if (!file) {
      throw new Error('No file provided for upload');
    }

    // Log environment variables for debuggin

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', import.meta.env.CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', folder);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${import.meta.env.CLOUDINARY_CLOUD_NAME}/image/upload`;

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Cloudinary upload failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(`Upload failed: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();

    return data.secure_url;
  } catch (error) {
    throw error;
  }
}; 