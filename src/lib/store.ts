"use client";

import { create } from 'zustand';

interface AppState {
  isProcessing: boolean;
  setProcessing: (val: boolean) => void;
  // We can add more state here for real-time updates if needed
}

export const useAppStore = create<AppState>((set) => ({
  isProcessing: false,
  setProcessing: (val) => set({ isProcessing: val }),
}));
