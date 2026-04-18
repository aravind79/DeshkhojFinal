import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import rateLimit from 'express-rate-limit';

import { query } from './db';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import businessRoutes from './routes/businesses';
import locationRoutes from './routes/locations';
import categoryRoutes from './routes/categories';
import productRoutes from './routes/products';
import adminRoutes from './routes/admin';
import inquiriesRoutes from './routes/inquiries';
import messagesRoutes from './routes/messages';

dotenv.config();

// --- Global Safety Net ---
process.on('uncaughtException', (err) => {
  console.error('CRITICAL UNCAUGHT EXCEPTION:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION:', reason);
});

const app = express();

// --- Security & Rate Limiting ---
app.use(helmet());
// app.use(
//   rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 200,
//     standardHeaders: true,
//     legacyHeaders: false,
//   })
// );

// --- CORS ---
app.options(/.*/, cors()); // Handle OPTIONS preflight for all routes
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: false,
  })
);

// --- Body Parsing ---
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// --- Upload Directories ---
const uploadDirs = ['./uploads', './uploads/csv'];
uploadDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// --- Static Files (Uploads) ---
app.use('/uploads', express.static(path.resolve('./uploads')));
app.use('/api/uploads', express.static(path.resolve('./uploads'))); // Fallback for Vercel API_BASE

// --- Health Check ---
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'DeshKhoj API is running', timestamp: new Date() });
});

// --- Secret Admin: Flatten Images (Safe Version) ---
app.get('/api/admin/flatten', (req, res) => {
  const uploadsDir = path.resolve('./uploads');
  let movedCount = 0;
  // This route now uses raw fs to avoid any DB dependencies
  function flatten(dir: string) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      if (fs.statSync(fullPath).isDirectory()) {
        if (item !== 'csv') flatten(fullPath);
      } else {
        const destPath = path.join(uploadsDir, item);
        if (!fs.existsSync(destPath) && fullPath !== destPath) {
          try { fs.renameSync(fullPath, destPath); movedCount++; } catch (e) { }
        }
      }
    }
  }
  try {
    flatten(uploadsDir);
    res.json({ success: true, message: `Successfully organized ${movedCount} images.` });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// --- Secret Admin: Radar (Find my files) ---
app.get('/api/admin/radar', (req, res) => {
  try {
    const cwd = process.cwd();
    const uploadsPath = path.resolve('./uploads');

    // Scan root, dist, and nodejs for uploads or the zip file
    const scanPath = (dir: string) => {
      try {
        if (fs.existsSync(dir)) {
          return fs.readdirSync(dir).filter(f => f.includes('upload') || f.includes('image') || f.includes('.zip'));
        }
        return ['Directory not found'];
      } catch (e) {
        return [`Error reading ${dir}`];
      }
    };

    res.json({
      success: true,
      serverInfo: {
        workingDirectory: cwd,
        expectedUploadsFolder: uploadsPath,
        doesExpectedFolderExist: fs.existsSync(uploadsPath),
      },
      fileRadar: {
        root: scanPath(path.resolve('./')),
        dist: scanPath(path.resolve('./dist')),
        nodejs: scanPath(path.resolve('./nodejs')),
        parent: scanPath(path.resolve('../')),
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/inquiries', inquiriesRoutes);
app.use('/api/messages', messagesRoutes);

// --- Static Frontend (Production Only) ---
const frontendPath = path.resolve(__dirname, '../public');
if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));
  app.get(/.*/, (req: express.Request, res: express.Response) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(frontendPath, 'index.html'));
    } else {
      res.status(404).json({ success: false, message: 'API Route not found' });
    }
  });
} else {
  // --- 404 Handler ---
  app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
  });
}

// --- Error Handler ---
app.use(errorHandler);

const PORT = parseInt(process.env.PORT || '5000', 10);
app.listen(PORT, () => {
  console.log(`\n🚀 DeshKhoj Backend running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Health:      http://localhost:${PORT}/api/health\n`);
});


export default app;
