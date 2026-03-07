// src/services/authService.ts
import axios from 'axios';

const API_URL = 'https://dotproposal.onrender.com/api/';

// Veri Tipleri
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
  cvFileName?: string;
  title?: string;
}

// --- REGISTER ---
const register = async (userData: RegisterData): Promise<UserResponse> => {
  const response = await axios.post<UserResponse>(API_URL + 'auth/register', userData);
  
  if (response.data) {
    // 1. Kullanıcı objesini kaydet (Eski kodun çalışmaya devam etsin)
    localStorage.setItem('user', JSON.stringify(response.data));
    
    // 🔥 2. TOKEN'I AYRI OLARAK KAYDET (Sihirbaz sayfası bunu arıyor!)
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
    // 1. Kullanıcı objesini kaydet
    localStorage.setItem('user', JSON.stringify(response.data));

    // 🔥 2. TOKEN'I AYRI OLARAK KAYDET (401 Hatasını Çözen Satır)
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
    }
  }

  return response.data;
};

// --- UPDATE PROFILE ---
const updateProfile = async (userData: FormData, token: string): Promise<UserResponse> => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.put<UserResponse>(API_URL + 'users/profile', userData, config);

  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
    // Profil güncellenince token değişmez ama garanti olsun diye varsa güncelleyelim
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
    }
  }

  return response.data;
};

// --- LOGOUT ---
const logout = () => {
  // Çıkış yaparken ikisini de silmemiz lazım
  localStorage.removeItem('user');
  localStorage.removeItem('token'); // 🔥 Bunu da siliyoruz
};

const authService = {
  register,
  login,
  logout,
  updateProfile,
};

export default authService;