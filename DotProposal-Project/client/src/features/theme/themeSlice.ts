import { createSlice } from '@reduxjs/toolkit';

interface ThemeState {
  mode: 'light' | 'dark';
}

const initialState: ThemeState = {
  mode: 'light', // Varsayılan tema
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => { 
      state.mode = state.mode === 'light' ? 'dark' : 'light';
    },
  },
});

export const { toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;