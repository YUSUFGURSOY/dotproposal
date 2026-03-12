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

// --- YENİ: Gelişmiş CORS Politikası ---
const allowedOrigins = [
  'https://www.dotproposal.com', 
  'https://dotproposal.com',     
  'http://localhost:3000',       
  'http://localhost:5173'        
];

app.use(cors({
  origin: function (origin, callback) {
    // origin yoksa (örn: backend'den veya postman'den geliyorsa) veya listedeyse izin ver
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy engelledi.'));
    }
  },
  credentials: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json());

// --- ÖNEMLİ: Yüklenen dosyalara (CV) tarayıcıdan erişim izni ---
// 'uploads' klasörünü statik olarak dışarı açıyoruz
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// --- LOG MIDDLEWARE ---
app.use((req, res, next) => {
  console.log(`📡 İSTEK GELDİ: ${req.method} ${req.url}`);
  next();
});

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