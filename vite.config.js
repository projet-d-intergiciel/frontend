import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
  // 1. Importe le plugin

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
     // 2. Ajoute le plugin ici
  ],
})