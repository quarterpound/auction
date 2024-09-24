import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { env } from '../env';
import sharp from 'sharp';

cloudinary.config({
  cloud_name: env.CLOUDINARY_API_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET
});

export const uploadFile = async (file: Buffer): Promise<UploadApiResponse[]> => {
  const minWidth = 600;
  const minHeight = 600;
  const smallWidth = 50;

  try {
    const parsed = sharp(file);
    const metadata = await parsed.metadata();

    if (!metadata.width || !metadata.height) {
      throw new Error('Unable to retrieve image metadata');
    }

    // Determine the resize dimensions, maintaining aspect ratio
    let targetWidth = metadata.width;
    let targetHeight = metadata.height;

    if (metadata.width > metadata.height) {
      // Landscape
      if (metadata.width > minWidth) {
        targetWidth = minWidth;
        targetHeight = Math.round(metadata.height * (minWidth / metadata.width));
      }
    } else {
      // Portrait
      if (metadata.height > minHeight) {
        targetHeight = minHeight;
        targetWidth = Math.round(metadata.width * (minHeight / metadata.height));
      }
    }

    // Resize and create buffers
    const thumbBuffer = await parsed.clone()
      .resize({ width: smallWidth })
      .blur(5)
      .webp({ quality: 40 })
      .toBuffer();

    const hqBuffer = await parsed.clone()
      .resize({ width: targetWidth, height: targetHeight })
      .webp({ quality: 80 })
      .toBuffer();

    // Upload to Cloudinary
    const uploadResults = await Promise.all([
      uploadToCloudinary(hqBuffer),
      uploadToCloudinary(thumbBuffer),
    ]);

    return uploadResults;
  } catch (error) {
    console.error('Error processing the file:', error);
    throw error;
  }
};

const uploadToCloudinary = (file: Buffer): Promise<UploadApiResponse> => {
  return new Promise<UploadApiResponse>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'auction-assets' },
      (err, result) => {
        if (err || !result) {
          return reject(err || new Error('Failed to upload to Cloudinary'));
        }
        resolve(result);
      }
    );

    uploadStream.end(file);
  });
};
