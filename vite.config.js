import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  base: '/StazioneMeteoCento/',
  plugins: [react()],
    resolve: {
     alias: {
      // rimappiamo l’import problematico di Splide su file CSS già pronto:
      '@splidejs/splide/src/css/core/index': path.resolve(
        __dirname,
        'node_modules/@splidejs/splide/dist/css/splide-core.min.css'
      ),
      'bootstrap-italia': path.resolve(__dirname, 'node_modules/bootstrap-italia'),
    }
  
  },


})
