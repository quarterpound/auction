import { v2 as cloudinary, UploadApiResponse } from 'cloudinary'
import { env } from '../env';

cloudinary.config({
  cloud_name: env.CLOUDINARY_API_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET
});

export const uploadFile = (file: Buffer) => {
  return new Promise<UploadApiResponse>((resolve, reject) => {
    cloudinary.uploader.upload_stream({
      folder: 'auction-assets',
      eager: [{ fetch_format: 'webp' }],
    }, (err, result) => {
      if(err || !result) {
        return reject(err)
      }

      resolve(result)
    }).end(file)
  })
}
