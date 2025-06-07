import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __PROXY__:  JSON.stringify("http://192.168.0.110:4373"),
  }
})
