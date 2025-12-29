// server/src/controllers/authController.ts
import { Request, Response } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Token oluşturucu
// id parametresini 'any' veya 'string' olarak alabiliriz
const generateToken = (id: string | any) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'gizli_anahtar', {
    expiresIn: '30d',
  });
};

// --- REGISTER (KAYIT OL) ---
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: 'Lütfen tüm alanları doldurun.' });
      return;
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ message: 'Bu e-posta adresi zaten kayıtlı.' });
      return;
    }

    const user = await User.create({ name, email, password });

    if (user) {
      res.status(201).json({
        _id: user._id, // DÜZELTME: user.id -> user._id
        name: user.name,
        email: user.email,
        // DÜZELTME: ObjectId'yi string'e çeviriyoruz
        token: generateToken(user._id.toString()), 
      });
    } else {
      res.status(400).json({ message: 'Geçersiz kullanıcı verisi.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};

// --- LOGIN (GİRİŞ YAP) ---
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id, // DÜZELTME: user.id -> user._id
        name: user.name,
        email: user.email,
        cvFileName: user.cvFileName, 
        // DÜZELTME: ObjectId'yi string'e çeviriyoruz
        token: generateToken(user._id.toString()),
      });
    } else {
      res.status(401).json({ message: 'Geçersiz e-posta veya şifre.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};

// --- GET ME (PROFİL) ---
export const getMe = async (req: any, res: Response): Promise<void> => {
  try {
    // req.user.id middleware'den geliyor, orada sorun yoksa burası çalışır.
    // Ancak User modelinden gelen veride _id kullanılır.
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Kullanıcı bilgisi alınamadı.' });
  }
};