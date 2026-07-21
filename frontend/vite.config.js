import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ['REACT_APP_', 'VITE_']);
  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 4000
    },
    define: {
      'process.env': JSON.stringify({
        PUBLIC_URL: '',
        REACT_APP_API_URL: env.REACT_APP_API_URL || 'http://localhost:8000',
        ...env
      })
    }
  }
})
