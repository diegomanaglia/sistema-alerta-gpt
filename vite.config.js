// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(),
    tailwindcss()],
  server: {
    port: 5173,     // ou outra porta que você queira
    proxy: {
      // aqui toda chamada a /api/* vai pra http://localhost:3000/api/*
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      // se você usa fetch("/veiculos/...") no front:
      '/veiculos': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      // e, se precisar, adicione outros endpoints (ex: /ordem_servico)
    }
  }
})
