// src/services/authService.ts
import axios from 'axios';

const API_URL = 'https://dotproposal.onrender.com/api/';

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface UserResponse {
  _id: string;
  name: string;
  email: string;
  token: string;
  isVerified?: boolean; // 👇 YENİ EKLENDİ
  cvFileName?: string;
  title?: string;
}

// --- REGISTER ---
const register = async (userData: RegisterData): Promise<UserResponse> => {
  const response = await axios.post<UserResponse>(API_URL + 'auth/register', userData);
  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
    }
  }
  return response.data;
};

// --- LOGIN ---
const login = async (userData: LoginData): Promise<UserResponse> => {
  const response = await axios.post<UserResponse>(API_URL + 'auth/login', userData);
  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
    }
  }
  return response.data;
};

// --- UPDATE PROFILE ---
const updateProfile = async (userData: FormData, token: string): Promise<UserResponse> => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const response = await axios.put<UserResponse>(API_URL + 'users/profile', userData, config);
  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
    }
  }
  return response.data;
};

// 👇 YENİ: E-POSTA DOĞRULAMA
const verifyEmail = async (token: string) => {
  const response = await axios.get(API_URL + `auth/verify-email/${token}`);
  // Doğrulama başarılıysa LocalStorage'daki user'ı güncelle
  if (response.data && response.data.isVerified) {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      user.isVerified = true;
      localStorage.setItem('user', JSON.stringify(user));
    }
  }
  return response.data;
};

// 👇 YENİ: DOĞRULAMA MAİLİNİ TEKRAR GÖNDERME
const resendVerification = async (email: string) => {
  const response = await axios.post(API_URL + 'auth/resend-verification', { email });
  return response.data;
};

// --- LOGOUT ---
const logout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token'); 
};

const authService = {
  register,
  login,
  logout,
  updateProfile,
  verifyEmail,        // 👈 Dışa aktarıldı
  resendVerification, // 👈 Dışa aktarıldı
};

export default authService;