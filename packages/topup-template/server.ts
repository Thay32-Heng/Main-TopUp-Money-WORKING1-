/**
 * server.ts — Production Standalone Server for Topup Tenant Instance
 *
 * Capabilities:
 * - Dynamic BASE_PATH subpath routing (e.g. /luckytopup or /)
 * - Static frontend serving from dist/
 * - Live DB readiness and health checks:
 *     GET /healthz       -> { status: "ok", timestamp: "..." }
 *     GET /api/ready     -> { status: "ready", database: "connected" }
 * - Full standalone Express API server with JWT auth and MySQL/Postgres support
 * - Dynamic runtime configuration injection into index.html
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

// Enable require for CommonJS route modules in ESM context
const require = createRequire(import.meta.url);

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database helpers
const dbHelper = require('./server/db.cjs');
const { pool, checkHealth } = dbHelper;

const app = express();
app.set('trust proxy', 1);

const PORT = parseInt(process.env.PORT || '3000', 10);
const RAW_BASE_PATH = process.env.BASE_PATH || '/';
const BASE_PATH = (RAW_BASE_PATH === '/' || RAW_BASE_PATH === './' ? '' : RAW_BASE_PATH.replace(/\/$/, '')).trim();
const NORMALIZED_BASE_PATH = BASE_PATH.startsWith('/') ? BASE_PATH : (BASE_PATH ? `/${BASE_PATH}` : '');

console.log(`[Init] Initializing Topup Server on port ${PORT}`);
console.log(`[Init] Base path: "${NORMALIZED_BASE_PATH || '/'}"`);

// ── Middlewares ─────────────────────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : '*';

app.use(
  cors({
    origin: allowedOrigins === '*' ? '*' : allowedOrigins,
    credentials: true,
  })
);

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Security Headers
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// ── Health & Readiness Probes ───────────────────────────────────────────────
const handleHealthz = (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
};

const handleReadiness = async (_req: Request, res: Response) => {
  try {
    const health = await checkHealth();
    if (health.ok) {
      res.status(200).json({
        status: 'ready',
        database: 'connected',
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(503).json({
        status: 'not_ready',
        database: 'disconnected',
        error: health.error,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (err: any) {
    res.status(503).json({
      status: 'not_ready',
      database: 'disconnected',
      error: err.message,
      timestamp: new Date().toISOString(),
    });
  }
};

// Mount health and readiness at both root and BASE_PATH
app.get('/healthz', handleHealthz);
app.get('/api/ready', handleReadiness);
app.get('/api/health', handleHealthz);

if (NORMALIZED_BASE_PATH) {
  app.get(`${NORMALIZED_BASE_PATH}/healthz`, handleHealthz);
  app.get(`${NORMALIZED_BASE_PATH}/api/ready`, handleReadiness);
  app.get(`${NORMALIZED_BASE_PATH}/api/health`, handleHealthz);
}

// ── Rate Limiters ───────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Too many auth requests — please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const financialLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { error: 'Too many transactions — please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const pollLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  message: { error: 'Too many poll requests' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── API Router Creation ─────────────────────────────────────────────────────
const createApiRouter = () => {
  const apiRouter = express.Router();

  // Rate-limited & standard route mounts
  apiRouter.use('/auth', authLimiter, require('./server/routes/auth.cjs'));
  apiRouter.use('/settings', require('./server/routes/settings.cjs'));
  apiRouter.use('/games', require('./server/routes/games.cjs'));
  apiRouter.use('/orders', financialLimiter, require('./server/routes/orders.cjs'));
  apiRouter.use('/preorders', require('./server/routes/preorders.cjs'));
  apiRouter.use('/events', require('./server/routes/events.cjs'));
  apiRouter.use('/event-banners', require('./server/routes/event-banners.cjs'));
  apiRouter.use('/coupons', financialLimiter, require('./server/routes/coupons.cjs'));
  apiRouter.use('/points', financialLimiter, require('./server/routes/points.cjs'));

  const { router: walletRouter } = require('./server/routes/wallet.cjs');
  apiRouter.use('/wallet', financialLimiter, walletRouter);

  apiRouter.use('/payments', financialLimiter, require('./server/routes/payments.cjs'));
  apiRouter.use('/upload', require('./server/routes/uploads.cjs'));
  apiRouter.use('/admin', require('./server/routes/api-configs.cjs'));

  // Edge function ports
  apiRouter.use('/process-topup', financialLimiter, require('./server/routes/process-topup.cjs'));
  apiRouter.use('/verify-game-id', require('./server/routes/verify-game.cjs'));
  apiRouter.use('/g2bulk-api', require('./server/routes/g2bulk.cjs'));
  apiRouter.use('/ahnajak-khqr', pollLimiter, require('./server/routes/ahnajak-khqr.cjs'));
  apiRouter.use('/ikhode-payment', financialLimiter, require('./server/routes/ikhode.cjs'));
  apiRouter.use('/update-prices', require('./server/routes/prices.cjs'));
  apiRouter.use('/products/vg', require('./server/routes/vg-products.cjs'));
  apiRouter.use('/', require('./server/routes/image-search.cjs'));
  apiRouter.use('/auth', require('./server/routes/telegram-bot-auth.cjs'));
  apiRouter.use('/', require('./server/routes/misc.cjs'));

  return apiRouter;
};

const apiRoutes = createApiRouter();
app.use('/api', apiRoutes);
if (NORMALIZED_BASE_PATH) {
  app.use(`${NORMALIZED_BASE_PATH}/api`, apiRoutes);
}

// ── Static Assets & Uploads ─────────────────────────────────────────────────
const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));
if (NORMALIZED_BASE_PATH) {
  app.use(`${NORMALIZED_BASE_PATH}/uploads`, express.static(uploadsDir));
}

const distDir = path.resolve(process.cwd(), 'dist');

// Serve static assets from dist
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir, { index: false }));
  if (NORMALIZED_BASE_PATH) {
    app.use(NORMALIZED_BASE_PATH, express.static(distDir, { index: false }));
  }
}

// ── HTML Injection & SPA Route Fallback ──────────────────────────────────────
function serveIndexHtml(req: Request, res: Response) {
  const indexPath = path.join(distDir, 'index.html');
  if (!fs.existsSync(indexPath)) {
    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head><title>${process.env.SITE_NAME || 'Topup App'}</title></head>
        <body style="font-family: sans-serif; background: #111; color: #fff; padding: 2rem; text-align: center;">
          <h1>Topup Tenant Running</h1>
          <p>Base path: <code>${NORMALIZED_BASE_PATH || '/'}</code></p>
          <p>Ready probe: <a style="color: #38bdf8;" href="${NORMALIZED_BASE_PATH}/api/ready">${NORMALIZED_BASE_PATH}/api/ready</a></p>
          <p>Health probe: <a style="color: #38bdf8;" href="${NORMALIZED_BASE_PATH}/healthz">${NORMALIZED_BASE_PATH}/healthz</a></p>
        </body>
      </html>
    `);
  }

  let html = fs.readFileSync(indexPath, 'utf8');

  // Inject dynamic runtime configuration
  const siteName = process.env.SITE_NAME || 'Ahnajak Topup';
  const isPathRouted = Boolean(
    NORMALIZED_BASE_PATH &&
    (req.originalUrl.startsWith(NORMALIZED_BASE_PATH) || (req.baseUrl && req.baseUrl.startsWith(NORMALIZED_BASE_PATH)))
  );
  const effectiveBasePath = isPathRouted ? NORMALIZED_BASE_PATH : '/';
  const baseHref = effectiveBasePath.endsWith('/') ? effectiveBasePath : `${effectiveBasePath}/`;

  const injectedConfig = `
  <base href="${baseHref}">
  <script id="__APP_CONFIG__">
    window.__BASE_PATH__ = ${JSON.stringify(effectiveBasePath)};
    window.__CONFIG__ = {
      BASE_PATH: ${JSON.stringify(effectiveBasePath)},
      SITE_NAME: ${JSON.stringify(siteName)}
    };
  </script>
  `;

  if (html.includes('<script id="__APP_CONFIG__">')) {
    html = html.replace(/<script id="__APP_CONFIG__">[\s\S]*?<\/script>/, injectedConfig);
  } else {
    html = html.replace('</head>', `${injectedConfig}\n</head>`);
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.send(html);
}

// Fallback middleware for unmatched SPA routes
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.method !== 'GET') {
    return next();
  }
  if (req.path.startsWith('/api/') || (NORMALIZED_BASE_PATH && req.path.startsWith(`${NORMALIZED_BASE_PATH}/api/`))) {
    return next();
  }
  return serveIndexHtml(req, res);
});

// ── Background Sweeper ──────────────────────────────────────────────────────
try {
  const processTopupRoutes = require('./server/routes/process-topup.cjs');
  if (processTopupRoutes && typeof processTopupRoutes.recoverStuckOrders === 'function') {
    setInterval(() => {
      processTopupRoutes.recoverStuckOrders().catch((e: any) => console.error('[sweeper]', e.message));
    }, 60 * 1000);
    setTimeout(() => processTopupRoutes.recoverStuckOrders().catch(() => {}), 5000);
  }
} catch (e: any) {
  console.warn('[Sweeper] Could not initialize sweeper:', e.message);
}

// ── Start Server ────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║   Topup Tenant Standalone Server v1.0.0                        ║
║   Port:      ${PORT.toString().padEnd(49)} ║
║   Base Path: ${(NORMALIZED_BASE_PATH || '/').padEnd(49)} ║
║   Healthz:   http://0.0.0.0:${PORT}${NORMALIZED_BASE_PATH}/healthz
║   Readiness: http://0.0.0.0:${PORT}${NORMALIZED_BASE_PATH}/api/ready
╚════════════════════════════════════════════════════════════════╝
  `);
});

export default app;
