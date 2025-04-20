import { CLOUDINARY_CLOUD_NAME } from "astro:env/client";
import { CLOUDINARY_UPLOAD_PRESET} from "astro:env/client";

export const uploadToCloudinary = async (file, folder = 'differentest-lesson-images/badges') => {
  try {
    if (!file) {
      throw new Error('No file provided for upload');
    }

    // Log environment variables for debugging
    console.log('Cloudinary Configuration:', {
      cloudName: CLOUDINARY_CLOUD_NAME,
      uploadPreset: CLOUDINARY_UPLOAD_PRESET,
      isCloudNameSet: !!CLOUDINARY_CLOUD_NAME,
      isUploadPresetSet: !!CLOUDINARY_UPLOAD_PRESET
    });

    if (!CLOUDINARY_CLOUD_NAME) {
      throw new Error('Cloudinary cloud name is not configured');
    }

    if (!CLOUDINARY_UPLOAD_PRESET) {
      throw new Error('Cloudinary upload preset is not configured');
    }

    console.log('Starting upload to Cloudinary:', {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      folder: folder
    });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', folder);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
    console.log('Uploading to:', uploadUrl);

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
    console.log('Upload successful:', {
      secure_url: data.secure_url,
      public_id: data.public_id,
      format: data.format,
      resource_type: data.resource_type
    });
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
}; 