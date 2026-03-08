// src/features/auth/authSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import authService from '../../services/authService';
import axios, { AxiosError } from 'axios';
import type { RootState } from '../../app/store';

// 1. Kullanıcı Veri Tipi
export interface User {
  _id: string;
  name: string;
  email: string;
  token: string;
  cvFileName?: string; 
  title?: string;   
  isVerified?: boolean; 
  hasCompletedOnboarding?: boolean; 
}
interface SuccessResponse {
  message: string;
  isVerified?: boolean;
}

// 2. State Yapısı
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  message: string;
}

// LocalStorage'dan güvenli veri çekme
const getUserFromStorage = (): User | null => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

const user = getUserFromStorage();

const initialState: AuthState = {
  user: user ? user : null,
  isAuthenticated: !!user,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
};

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

interface BackendError {
  message: string;
}

// --- ASYNC THUNK: KAYIT OLMA ---
export const registerUser = createAsyncThunk<
  User,
  RegisterData,
  { rejectValue: string }
>(
  'auth/register',
  async (userData, thunkAPI) => {
    try {
      return await authService.register(userData) as User;
    } catch (error) {
      const err = error as AxiosError<BackendError>;
      const message =
        (err.response && err.response.data && err.response.data.message) ||
        err.message ||
        'Bir hata oluştu';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// --- ASYNC THUNK: GİRİŞ YAPMA ---
export const loginUser = createAsyncThunk<
  User,
  LoginData,
  { rejectValue: string }
>(
  'auth/login',
  async (userData, thunkAPI) => {
    try {
      return await authService.login(userData) as User;
    } catch (error) {
      const err = error as AxiosError<BackendError>;
      const message =
        (err.response && err.response.data && err.response.data.message) ||
        err.message ||
        'Giriş yapılamadı';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// --- ASYNC THUNK: PROFİL GÜNCELLEME ---
export const updateUserProfile = createAsyncThunk<
  User,
  FormData,
  { rejectValue: string; state: RootState } 
>(
  'auth/updateProfile',
  async (formData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user?.token;
      
      if (!token) {
        return thunkAPI.rejectWithValue('Token bulunamadı');
      }

      return await authService.updateProfile(formData, token) as User;
    } catch (error) {
      const err = error as AxiosError<BackendError>;
      const message =
        (err.response && err.response.data && err.response.data.message) ||
        err.message ||
        'Güncelleme başarısız';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// --- ASYNC THUNK: E-POSTA DOĞRULAMA ---
export const verifyUserEmail = createAsyncThunk<
  SuccessResponse, 
  string, 
  { rejectValue: string } 
>(
  'auth/verifyEmail',
  async (token, thunkAPI) => {
    try { 
      return await authService.verifyEmail(token); 
    } catch (error) {
      const err = error as AxiosError<BackendError>;
      const message = (err.response && err.response.data && err.response.data.message) || 'Doğrulama başarısız.';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// --- ASYNC THUNK: TEKRAR MAİL GÖNDERME ---
export const resendVerificationEmail = createAsyncThunk<
  SuccessResponse, 
  string, 
  { rejectValue: string }
>(
  'auth/resendVerification',
  async (email, thunkAPI) => {
    try { 
      return await authService.resendVerification(email); 
    } catch (error) {
      const err = error as AxiosError<BackendError>;
      const message = (err.response && err.response.data && err.response.data.message) || 'Mail gönderilemedi.';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// --- ASYNC THUNK: HESAP SİLME ---
export const deleteUserAccount = createAsyncThunk<
  SuccessResponse,
  void,
  { rejectValue: string; state: RootState }
>(
  'auth/deleteAccount',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user?.token;
      if (!token) return thunkAPI.rejectWithValue('Token bulunamadı');

      const response = await axios.delete('https://dotproposal.onrender.com/api/auth/delete-account', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      
      return response.data;
    } catch (error) {
      const err = error as AxiosError<BackendError>;
      const message = (err.response && err.response.data && err.response.data.message) || 'Hesap silinemedi.';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
    logout: (state) => {
      authService.logout();
      state.user = null;
      state.isAuthenticated = false;
    },
    loginStart: (state) => { state.isLoading = true; },
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.isError = true;
      state.message = action.payload;
    },
    updateProfile: (state, action: PayloadAction<Partial<User>>) => {
       if (state.user) {
         state.user = { ...state.user, ...action.payload };
       }
    }
  },
  extraReducers: (builder) => {
    builder
      // REGISTER
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || 'Hata oluştu';
        state.user = null;
      })

      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || 'Hata oluştu';
        state.user = null;
      })

      // UPDATE PROFILE
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
        state.message = 'Profil güncellendi!';
        // 👇 İŞTE SİHİRLİ DOKUNUŞ 1: Backend'den gelen güncel profili KESİNLİKLE tarayıcıya kazı!
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || 'Hata oluştu';
      })

      // DOĞRULAMA
      .addCase(verifyUserEmail.fulfilled, (state) => {
        if (state.user) {
          state.user.isVerified = true;
        }
      })
      
      // HESAP SİLME
      .addCase(deleteUserAccount.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteUserAccount.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isAuthenticated = false;
        state.user = null; 
        state.message = action.payload.message;
      })
      .addCase(deleteUserAccount.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || 'Hesap silinirken hata oluştu.';
      });
  },
});

export const { reset, logout, loginStart, loginSuccess, loginFailure, updateProfile } = authSlice.actions;
export default authSlice.reducer;