import { Router, Request, Response } from 'express';
import { protect, adminOnly } from '../middleware/auth';
import { query } from '../db';
import multer from 'multer';
import path from 'path';
import { parse } from 'csv-parse';
import fs from 'fs';

const router = Router();

const csvStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, './uploads/csv'),
  filename: (_req, file, cb) => cb(null, `import_${Date.now()}${path.extname(file.originalname)}`),
});

const csvUpload = multer({
  storage: csvStorage,
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.csv'].includes(ext)) cb(null, true);
    else cb(new Error('Only CSV files supported for bulk import'));
  },
});

/**
 * GET /api/admin/stats
 * Dashboard statistics
 */
router.get('/stats', protect, adminOnly, async (_req: Request, res: Response) => {
  try {
    const [business, users, pending, products] = await Promise.all([
      query("SELECT COUNT(*) as count FROM dukaan_list WHERE dukaan_name != 'Sample Shop Name'"),
      query("SELECT COUNT(*) as count FROM user_list"),
      query("SELECT COUNT(*) as count FROM dukaan_list WHERE status = 'pending'"),
      query("SELECT COUNT(*) as count FROM dukaan_products WHERE is_del = 0"),
    ]);

    res.json({
      success: true,
      data: {
        businesses: parseInt(business.rows[0]?.count || '0'),
        users: parseInt(users.rows[0]?.count || '0'),
        pendingRegistrations: parseInt(pending.rows[0]?.count || '0'),
        products: parseInt(products.rows[0]?.count || '0'),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * GET /api/admin/businesses
 * List all businesses (with pagination)
 */
router.get('/businesses', protect, adminOnly, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const countResult = await query('SELECT COUNT(*) as count FROM dukaan_list');
    const total = parseInt(countResult.rows[0]?.count || '0');

    const result = await query(
      `SELECT * FROM dukaan_list ORDER BY id DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    res.json({
      success: true,
      data: result.rows,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * POST /api/admin/import
 * Bulk CSV import of businesses
 * CSV headers: dukaan_name, dukaan_addr, dukaandar_name, contact_no, dukaan_desc, email, shop_categories
 */
router.post('/import', protect, adminOnly, csvUpload.single('file'), async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ success: false, message: 'No CSV file uploaded' });
    return;
  }

  const records: Record<string, string>[] = [];
  let imported = 0;
  let failed = 0;

  fs.createReadStream(req.file.path)
    .pipe(parse({ columns: true, skip_empty_lines: true, trim: true }))
    .on('data', (row: Record<string, string>) => records.push(row))
    .on('error', (err) => {
      console.error(err);
      res.status(400).json({ success: false, message: 'Failed to parse CSV: ' + err.message });
    })
    .on('end', async () => {
      for (const row of records) {
        try {
          await query(
            `INSERT INTO dukaan_list (user_id, dukaan_name, dukaan_addr, dukaandar_name, contact_no, dukaan_desc, email, shop_categories, video_name, audio_name, dukaan_img_id, paid)
             VALUES (1, ?, ?, ?, ?, ?, ?, ?, '', '', 1, 0)`,
            [
              row.dukaan_name || '',
              row.dukaan_addr || '',
              row.dukaandar_name || '',
              row.contact_no || '',
              row.dukaan_desc || '',
              row.email || '',
              row.shop_categories || '',
            ]
          );
          imported++;
        } catch {
          failed++;
        }
      }

      // Clean up temp file
      fs.unlinkSync(req.file!.path);

      res.json({
        success: true,
        message: `Import complete: ${imported} imported, ${failed} failed`,
        data: { total: records.length, imported, failed },
      });
    });
});

/**
 * GET /api/admin/pending-registrations
 */
router.get('/pending-registrations', protect, adminOnly, async (_req, res) => {
  try {
    const result = await query(
      "SELECT * FROM dukaan_list WHERE status = 'pending' ORDER BY id DESC"
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * PUT /api/admin/businesses/:id/approve
 */
router.put('/businesses/:id/approve', protect, adminOnly, async (req: Request, res: Response) => {
  try {
    const { action } = req.body; // 'approve' or 'reject'
    const status = action === 'reject' ? 'rejected' : 'active';
    await query('UPDATE dukaan_list SET status = ?, paid = ? WHERE id = ?', [status, action === 'reject' ? 0 : 1, req.params.id]);
    res.json({ success: true, message: `Business ${status}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * PUT /api/admin/businesses/:id
 * Update ANY business details (Admin only)
 */
router.put('/businesses/:id', protect, adminOnly, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      dukaan_name, dukaandar_name, contact_no, whatsapp, pincode, dukaan_addr,
      shop_categories, category_1, category_2, category_3,
      paid, main_photo, gallery, dukaan_desc,
      business_type, gst_no, payment_modes, email,
      years_established = 0, products = []
    } = req.body;

    await query(
      `UPDATE dukaan_list
       SET dukaan_name = ?, dukaandar_name = ?, contact_no = ?, whatsapp = ?, pincode = ?, dukaan_addr = ?,
           shop_categories = ?, category_1 = ?, category_2 = ?, category_3 = ?,
           paid = ?, main_photo = ?, gallery = ?, dukaan_desc = ?,
           business_type = ?, gst_no = ?, payment_modes = ?, email = ?,
           years_established = ?
       WHERE id = ?`,
      [
        dukaan_name, dukaandar_name, contact_no, whatsapp, pincode, dukaan_addr,
        shop_categories || category_1, category_1 || shop_categories, category_2, category_3,
        paid, main_photo, gallery, dukaan_desc,
        business_type, gst_no, payment_modes, email, years_established, id
      ]
    );

    // Update Products (Delete and Re-insert for simplicity)
    if (Array.isArray(products)) {
      await query('DELETE FROM dukaan_products WHERE shop_id = ?', [id]);
      for (const prod of products) {
        await query(
          `INSERT INTO dukaan_products (prod_name, prod_desc, prod_amt, shop_id, prod_img, is_del, cat_id, quantity, unit)
           VALUES (?, ?, ?, ?, ?, 0, 1, 1, 'pcs')`,
          [prod.prod_name || prod.name, prod.prod_desc || prod.description || '', prod.prod_amt || prod.price || '0', id, prod.prod_img || prod.image || '']
        );
      }
    }

    res.json({ success: true, message: 'Business and products updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error while updating business' });
  }
});

/**
 * DELETE /api/admin/businesses/:id
 * Delete ANY business (Admin only)
 */
router.delete('/businesses/:id', protect, adminOnly, async (req: Request, res: Response) => {
  try {
    await query('DELETE FROM dukaan_list WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Business deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error while deleting business' });
  }
});

export default router;
