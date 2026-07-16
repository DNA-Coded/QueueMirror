import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary if credentials exist
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

// Multer in-memory storage configuration
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed.'));
    }
  }
});

// Helper to upload a buffer to Cloudinary
export const uploadToCloudinary = (fileBuffer: Buffer, fileName: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    // If credentials are not configured, fall back to base64 Data URL
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.log('Cloudinary not configured. Falling back to local data URL.');
      const base64Image = fileBuffer.toString('base64');
      const dataUrl = `data:image/jpeg;base64,${base64Image}`;
      resolve(dataUrl);
      return;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'queuemirror',
        public_id: fileName.split('.')[0] + '_' + Date.now()
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else if (result) {
          resolve(result.secure_url);
        } else {
          reject(new Error('Failed to get secure URL from Cloudinary.'));
        }
      }
    );
    uploadStream.end(fileBuffer);
  });
};
