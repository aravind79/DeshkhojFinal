import { Router, Request, Response } from 'express';
import { query } from '../db';
import { protect, AuthRequest } from '../middleware/auth';
import multer from 'multer';
import path from 'path';

const router = Router();

// Configure Multer for image uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, './uploads/'),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'biz-' + uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

/**
 * POST /api/businesses/upload
 * Returns filename of uploaded business photo
 */
router.post('/upload', upload.single('image'), (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ success: false, message: 'No file uploaded' });
    return;
  }
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.headers['x-forwarded-host'] || req.get('host');
  const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
  res.json({ success: true, filename: req.file.filename, url: fileUrl });
});

/**
 * GET /api/businesses/stats
 * Public stats for home page
 */
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const [totalBusiness, activeBusiness, users, pending, products, states, districts] = await Promise.all([
      query("SELECT COUNT(*) as count FROM dukaan_list WHERE dukaan_name != 'Sample Shop Name'"),
      query("SELECT COUNT(*) as count FROM dukaan_list d WHERE d.paid = 1"),
      query("SELECT COUNT(*) as count FROM user_list"),
      query("SELECT COUNT(*) as count FROM dukaan_list WHERE paid = 0"),
      query("SELECT COUNT(*) as count FROM dukaan_products WHERE is_del = 0"),
      query("SELECT COUNT(*) as count FROM states"),
      query("SELECT COUNT(*) as count FROM districts"),
    ]);

    res.json({
      success: true,
      data: {
        totalBusinesses: parseInt(totalBusiness.rows[0]?.count || '0'),
        activeBusinesses: parseInt(activeBusiness.rows[0]?.count || '0'),
        users: parseInt(users.rows[0]?.count || '0'),
        pending: parseInt(pending.rows[0]?.count || '0'),
        products: parseInt(products.rows[0]?.count || '0'),
        states: parseInt(states.rows[0]?.count || '0'),
        towns: parseInt(districts.rows[0]?.count || '0'),
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * GET /api/businesses
 * Search and filter businesses
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      q,
      loc,
      category,
      state_id,
      district_id,
      block_id,
      village_id,
      page = '1',
      limit = '12',
    } = req.query;

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    // PUBLIC SEARCH: Show all active businesses
    const conditions: string[] = ["d.status = 'active'"];
    const params: any[] = [];
    let paramIndex = 1;

    if (q) {
      conditions.push(`(d.dukaan_name LIKE ? OR d.dukaan_desc LIKE ? OR d.dukaan_addr LIKE ?)`);
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }

    if (loc) {
      conditions.push(`d.dukaan_addr LIKE ?`);
      params.push(`%${loc}%`);
    }

    if (category) {
      conditions.push(`d.shop_categories LIKE ?`);
      params.push(`%${category}%`);
    }

    if (state_id) {
      conditions.push(`d.state_id = ?`);
      params.push(state_id);
    }

    if (district_id) {
      conditions.push(`d.district_id = ?`);
      params.push(district_id);
    }

    if (block_id) {
      conditions.push(`d.block_id = ?`);
      params.push(block_id);
    }

    if (village_id) {
      conditions.push(`d.village_id = ?`);
      params.push(village_id);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get Total Count
    const countResult = await query(
      `SELECT COUNT(*) as count FROM dukaan_list d ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0]?.count || '0');

    // Get Results - map legacy photos to main_photo
    const queryParams = [...params, parseInt(limit as string), offset];
    const result = await query(
      `SELECT d.*,
       COALESCE(NULLIF(d.main_photo, ''), (SELECT photo_name FROM dukaan_photos WHERE id = d.dukaan_img_id LIMIT 1)) as main_photo
       FROM dukaan_list d 
       ${whereClause} 
       ORDER BY d.id DESC 
       LIMIT ? OFFSET ?`,
      queryParams
    );

    res.json({
      success: true,
      data: result.rows,
      meta: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (err: any) {
    console.error('BUSINESSES ROUTE ERROR:', err.message);
    res.status(500).json({ success: false, message: 'Server error', detail: err.message });
  }
});

/**
 * GET /api/businesses/:id
 * Returns single business with products and photos
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    // Fetch business details without the subqueries to avoid crashing if reviews table is missing
    const dukaanResult = await query(
      `SELECT d.*,
              COALESCE(NULLIF(TRIM(d.main_photo), ''), (SELECT NULLIF(TRIM(photo_name), '') FROM dukaan_photos WHERE id = d.dukaan_img_id LIMIT 1), 'sample.jpg') as main_photo
       FROM dukaan_list d
       WHERE d.id = ?`,
      [req.params.id]
    );
    if (!dukaanResult.rows.length) {
      res.status(404).json({ success: false, message: 'Business not found' });
      return;
    }

    const photosResult = await query(
      'SELECT id, photo_name, prod_id FROM dukaan_photos WHERE prod_id IS NULL AND id IN (SELECT dukaan_img_id FROM dukaan_list WHERE id = ?)',
      [req.params.id]
    );

    const productsResult = await query(
      'SELECT id, prod_name, prod_desc, prod_detailed_desc, prod_amt, cat_id, quantity, unit FROM dukaan_products WHERE shop_id = ? AND is_del = 0',
      [req.params.id]
    );

    // Try to fetch reviews, but don't crash if it fails
    let avg_rating = 0;
    let review_count = 0;
    try {
      const reviewsResult = await query(
        'SELECT CAST(COALESCE(AVG(rating), 0) AS DECIMAL(10,2)) as avg_rating, COUNT(*) as review_count FROM dukaan_reviews WHERE shop_id = ?',
        [req.params.id]
      );
      if (reviewsResult.rows.length > 0) {
        avg_rating = reviewsResult.rows[0].avg_rating;
        review_count = reviewsResult.rows[0].review_count;
      }
    } catch (e) {
      console.warn("Could not fetch reviews (table might be missing)", e);
    }

    res.json({
      success: true,
      data: {
        ...dukaanResult.rows[0],
        avg_rating,
        review_count,
        photos: photosResult.rows,
        products: productsResult.rows,
      },
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error', detail: err.message, stack: err.stack });
  }
});

/**
 * POST /api/businesses
 * Register a new business with products
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      dukaan_name, dukaan_addr, dukaandar_name, contact_no, whatsapp, pincode, block_id,
      dukaan_desc, email, shop_categories, category_1, category_2, category_3,
      business_type, gst_no, payment_modes, main_photo, gallery,
      years_established = 0, products = [], user_id = 1
    } = req.body;

    const result = await query(
      `INSERT INTO dukaan_list (
        user_id, dukaan_name, dukaan_addr, dukaandar_name, contact_no, whatsapp, pincode,
        dukaan_desc, email, shop_categories, category_1, category_2, category_3,
        business_type, gst_no, payment_modes, main_photo, gallery, 
        years_established, video_name, audio_name, dukaan_img_id, paid, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '', '', 1, 0, 'pending')`,
      [
        user_id, dukaan_name, dukaan_addr, dukaandar_name, contact_no, whatsapp, pincode,
        dukaan_desc, email, shop_categories, category_1 || shop_categories, category_2 || '', category_3 || '',
        business_type, gst_no, payment_modes, main_photo, gallery, years_established
      ]
    );

    const businessId = result.insertId;

    // Smart Categorization: Find cat_id from product_category
    let catId = 1; // Default
    try {
      const catSearch = await query("SELECT id FROM product_category WHERE category_name LIKE ? OR loc_category_name LIKE ? LIMIT 1", [`%${shop_categories || category_1}%`, `%${shop_categories || category_1}%`]);
      if (catSearch.rows.length) catId = catSearch.rows[0].id;
    } catch (e) { console.error("Category lookup failed", e); }

    // Insert Products
    if (products && Array.isArray(products) && products.length > 0) {
      for (const prod of products) {
        await query(
          `INSERT INTO dukaan_products (prod_name, prod_desc, prod_amt, shop_id, is_del, cat_id, quantity, unit)
           VALUES (?, ?, ?, ?, 0, ?, 1, 'pcs')`,
          [prod.name || prod.prod_name, prod.description || prod.prod_desc || '', prod.price || prod.prod_amt || '0', businessId, catId]
        );
      }
    }

    res.status(201).json({
      success: true,
      message: 'Business and products submitted for review',
      data: { id: businessId },
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

/**
 * GET /api/businesses/:id/reviews
 */
router.get('/:id/reviews', async (req: Request, res: Response) => {
  try {
    const result = await query(
      "SELECT * FROM dukaan_reviews WHERE shop_id = ? ORDER BY created_at DESC",
      [req.params.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (err: any) {
    console.error(err);
    // Return empty array instead of 500 error if table is missing
    res.json({ success: true, data: [] });
  }
});

/**
 * POST /api/businesses/:id/reviews
 */
router.post('/:id/reviews', async (req: Request, res: Response) => {
  try {
    const { user_name, rating, comment } = req.body;
    if (!user_name || !rating) {
      res.status(400).json({ success: false, message: 'Name and rating are required' });
      return;
    }
    await query(
      "INSERT INTO dukaan_reviews (shop_id, user_name, rating, comment) VALUES (?, ?, ?, ?)",
      [req.params.id, user_name, rating, comment]
    );
    res.status(201).json({ success: true, message: 'Review added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
