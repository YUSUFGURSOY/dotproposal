// src/index.ts
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path'; // Dosya yolları için gerekli
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes'; // Kullanıcı rotalarını import ettik
import proposalRoutes from './routes/proposalRoutes';
// [DEVRE DIŞI BIRAKILDI - MVP SÜRÜMÜ] RabbitMQ geçici olarak kapalı:
// import { connectQueue } from './config/rabbitmq'; 
// import { startProposalWorker } from './workers/proposalWorker';


dotenv.config();

if (!process.env.MONGO_URI) {
    console.error("❌ HATA: MONGO_URI .env dosyasında tanımlı değil!");
    process.exit(1);
}
if (!process.env.JWT_SECRET) {
    console.error("❌ HATA: JWT_SECRET .env dosyasında tanımlı değil!");
    process.exit(1);
}
if (!process.env.GOOGLE_API_KEY) {
    console.error("❌ HATA: GOOGLE_API_KEY .env dosyasında tanımlı değil!");
    process.exit(1);
}

connectDB();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// --- 1. ÖNCE LOG MIDDLEWARE (İstek gelir gelmez önce görelim, CORS'tan bile önce!) ---
app.use((req, res, next) => {
  console.log(`📡 İSTEK GELDİ: ${req.method} ${req.url} | Origin: ${req.headers.origin || 'Bilinmiyor'}`);
  next();
});

// --- 2. KURŞUNGEÇİRMEZ CORS AYARI ---
app.use(cors({
  origin: [
    'https://www.dotproposal.com', 
    'https://dotproposal.com',     
    'http://localhost:3000',       
    'http://localhost:5173'
  ],
  credentials: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(express.json());

// --- ÖNEMLİ: Yüklenen dosyalara (CV) tarayıcıdan erişim izni ---
// 'uploads' klasörünü statik olarak dışarı açıyoruz
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// --- ROTALAR ---
console.log("🚦 Rotalar Tanımlanıyor...");

// Auth Rotaları (Login/Register)
app.use('/api/auth', authRoutes);

// User Rotaları (Profil/CV Yükleme) - BURAYA TAŞIDIK ✅
app.use('/api/users', userRoutes);


app.use('/api/proposals', proposalRoutes);

// --- Test Rotası ---
app.get('/', (req: Request, res: Response) => {
  res.send('DotProposal Backend Çalışıyor! 🚀');
});

// Sunucuyu başlatıyoruz
const startServer = async () => {
    try {
        // [DEVRE DIŞI BIRAKILDI - MVP SÜRÜMÜ] RabbitMQ geçici olarak kapalı:
        // await connectQueue(); // RabbitMQ'ya bağlan
        // await startProposalWorker();

        app.listen(PORT, () => {
          console.log(`⚡️[server]: Sunucu http://localhost:${PORT} adresinde çalışıyor`);
        });
    } catch (error) {
        console.log("Sunucu başlatma hatası:", error);
    }
};

startServer();