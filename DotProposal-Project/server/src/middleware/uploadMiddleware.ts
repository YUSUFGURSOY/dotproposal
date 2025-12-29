// server/src/middleware/uploadMiddleware.ts
import multer from 'multer';
import path from 'path';

// Dosyanın nereye ve hangi isimle kaydedileceği
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/'); // 'uploads' klasörüne kaydet
  },
  filename(req, file, cb) {
    // Dosya adı çakışmasın diye sonuna tarih ve saat ekliyoruz
    // Örn: cv-16982392.pdf
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// Sadece PDF kabul edelim (İstersen görsel de ekleyebilirsin)
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