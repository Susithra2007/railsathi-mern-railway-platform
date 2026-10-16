import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Transparent bootstrap for 'node server.ts' when run directly in production Node without --import tsx
if (!process.env.__TSX_BOOTSTRAPPED__ && !process.execArgv.some((a) => a.includes('tsx'))) {
  try {
    const isTsFile = __filename.endsWith('.ts');
    if (isTsFile) {
      process.env.__TSX_BOOTSTRAPPED__ = 'true';
      const { spawnSync } = await import('node:child_process');
      const res = spawnSync(process.execPath, ['--import', 'tsx', __filename], {
        stdio: 'inherit',
        env: process.env,
      });
      process.exit(res.status || 0);
    }
  } catch (e) {
    // Continue in native runtime
  }
}

// Dynamically import apiApp
const { default: apiApp } = await import('./server/app');

async function main() {
  const app = express();
  const isProd = process.env.NODE_ENV === 'production';
  const PORT = isProd ? (Number(process.env.PORT) || 3000) : 3000;

  // Mount API backend for all /api endpoints
  app.use(apiApp);

  if (!isProd) {
    // Development mode: mount Vite dev middleware
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log(`[RailSathi] Vite dev middlewares mounted.`);
  } else {
    // Production mode: serve built static assets from dist/
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
      console.log(`[RailSathi] Serving production static files from ${distPath}`);
    } else {
      console.warn(`[RailSathi] dist/ folder not found. Please run 'npm run build' first.`);
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[RailSathi] Server running on http://0.0.0.0:${PORT} (${isProd ? 'production' : 'development'})`);
  });
}

main().catch((err) => {
  console.error('[RailSathi] Server startup failed:', err);
  process.exit(1);
});
