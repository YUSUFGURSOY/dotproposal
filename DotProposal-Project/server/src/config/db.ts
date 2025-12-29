// src/config/db.ts
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // .env dosyasından adresi alıyoruz
    const conn = await mongoose.connect(process.env.MONGO_URI as string);

    console.log(`✅ MongoDB Bağlandı: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Bağlantı Hatası: ${error}`);
    process.exit(1); // Hata varsa sunucuyu kapat
  }
};

export default connectDB;