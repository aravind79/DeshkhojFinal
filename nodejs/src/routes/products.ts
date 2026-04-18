import { Router, Request, Response } from 'express';
import { query } from '../db';

const router = Router();

/**
 * GET /api/products
 * List products, optionally filtered by business
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { shop_id, q, page = '1', limit = '12' } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    const conditions: string[] = ['p.is_del = 0'];
    const params: unknown[] = [];
    let p = 1;

    if (shop_id) {
      conditions.push(`p.shop_id = ?`);
      params.push(shop_id);
    }
    if (q) {
      conditions.push(`(p.prod_name LIKE ? OR p.prod_desc LIKE ?)`);
      params.push(`%${q}%`, `%${q}%`);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const countResult = await query(`SELECT COUNT(*) as count FROM dukaan_products p ${where}`, params);
    const total = parseInt(countResult.rows[0]?.count || '0');

    params.push(parseInt(limit as string));
    params.push(offset);

    const result = await query(
      `SELECT p.id, p.prod_name, p.prod_desc, p.prod_amt, p.quantity, p.unit,
              p.shop_id, d.dukaan_name AS shop_name, d.dukaan_addr AS shop_address
       FROM dukaan_products p
       LEFT JOIN dukaan_list d ON d.id = p.shop_id
       ${where}
       ORDER BY p.id DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit as string), offset]
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * GET /api/products/:id
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT p.*, d.dukaan_name AS shop_name, d.dukaan_addr AS shop_address, d.contact_no AS shop_contact
       FROM dukaan_products p
       LEFT JOIN dukaan_list d ON d.id = p.shop_id
       WHERE p.id = $1 AND p.is_del = 0`,
      [req.params.id]
    );
    if (!result.rows.length) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
