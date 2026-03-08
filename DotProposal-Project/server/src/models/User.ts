// src/models/User.ts
import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

// 1. ARAYÜZ (INTERFACE)
// 1. ARAYÜZ (INTERFACE)
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  cvFileName?: string;
  title?: string;
  githubLink?: string;
  resetPasswordCode?: string;
  resetPasswordExpire?: Date;
  resetPasswordCooldown?: Date;
  isVerified: boolean;
  verificationToken?: string;
  verificationCooldown?: Date;
  // 👇 TYPESCRIPT'İ SUSTURAN KISIM (Bu 3 satırın olduğundan kesinlikle emin ol)
  hourlyRate?: number;
  currency?: string;
  hasCompletedOnboarding?: boolean;
  
  comparePassword(candidatePassword: string): Promise<boolean>;
  isModified(path: string): boolean;
}

// 2. ŞEMA
const userSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Lütfen adınızı girin'],
    },
    email: {
      type: String,
      required: [true, 'Lütfen e-posta adresini girin'],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Lütfen şifre girin'],
    },
    cvFileName: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: 'Freelancer',
    },
    githubLink: {
      type: String,
      default: '',
    },
    resetPasswordCode: {
      type: String,
    },
    resetPasswordExpire: {
      type: Date,
    },
    resetPasswordCooldown: {
      type: Date,
    },
    // 👇 YENİ EKLENENLER
    isVerified: {
      type: Boolean,
      default: false, // İlk kayıtta otomatik false olur
    },
    verificationToken: {
      type: String,
    },
    verificationCooldown: {
      type: Date,
    }
    // 👆 YENİ EKLENENLER BİTİŞ
  },
  {
    timestamps: true 
  }
);

// 3. KAYIT ÖNCESİ ŞİFRELEME
userSchema.pre('save', async function (this: IUser) {
  if (!this.isModified('password')) {
    return;
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error: any) {
    throw new Error(error.message);
  }
});

// 4. ŞİFRE KARŞILAŞTIRMA
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default User;