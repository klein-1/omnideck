import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { spawn } from 'child_process';
import http from 'http';

function autoStartBackend() {
  return {
    name: 'auto-start-backend',
    configureServer() {
      const req = http.get('http://localhost:3001/api/downloader/status', () => {
        // Backend is already running
      });
      req.on('error', () => {
        try {
          const child = spawn('node', ['server/index.js'], { stdio: 'inherit', shell: true });
          child.unref();
        } catch {}
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), autoStartBackend()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  }
});
