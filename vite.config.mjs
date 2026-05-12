import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: path.join(__dirname, 'web'),
  publicDir: path.join(__dirname, 'web', 'public'),
  build: {
    outDir: path.join(__dirname, 'dist-web'),
    emptyOutDir: true,
  },
  server: {
    fs: {
      allow: [path.join(__dirname, 'src'), __dirname],
    },
  },
});
