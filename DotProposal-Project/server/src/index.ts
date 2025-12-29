// src/index.ts
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path'; // Dosya yolları için gerekli
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes'; // Kullanıcı rotalarını import ettik
import proposalRoutes from './routes/proposalRoutes';

dotenv.config();
connectDB();

const app: Express = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
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

app.listen(PORT, () => {
  console.log(`⚡️[server]: Sunucu http://localhost:${PORT} adresinde çalışıyor`);
});