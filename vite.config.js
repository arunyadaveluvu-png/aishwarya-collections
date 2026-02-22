import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Return index.html for all routes so React Router handles them.
    // Without this, refreshing /products etc. returns a 404 from the dev server.
    historyApiFallback: true,
  }
})
