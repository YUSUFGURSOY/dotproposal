// server/src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

// Request tipini genişletiyoruz ki içine 'user' bilgisi koyabilelim
export interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  // 1. Header'da "Authorization" var mı ve "Bearer" ile başlıyor mu?
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // "Bearer <token>" kısmından sadece token'ı al
      token = req.headers.authorization.split(' ')[1];

      // 2. Token'ı çöz (Verify)
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

      // 3. Token içindeki ID'den kullanıcıyı bul (Şifreyi getirme)
      req.user = await User.findById(decoded.id).select('-password');

      next(); // Her şey yolunda, geçebilirsin
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Yetkisiz işlem, token geçersiz.' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Token bulunamadı, lütfen giriş yapın.' });
  }
};