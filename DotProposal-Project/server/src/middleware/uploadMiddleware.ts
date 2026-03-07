// server/src/middleware/uploadMiddleware.ts
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// 1. Cloudinary Kimlik Bilgilerini Tanımla
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Cloudinary Depolama Motorunu Kur
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'dotproposal_cvs', // Cloudinary üzerinde bu isimde bir klasör açıp içine atacak
      format: 'pdf',             // Sadece PDF formatına zorla
      public_id: `cv-${Date.now()}`, // Dosya ismi çakışmasın diye
    };
  },
});

// 3. Sadece PDF Kabul Eden Filtremiz (Senin yazdığın gibi kalıyor)
const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Sadece PDF dosyaları yüklenebilir!'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter 
});

export default upload;