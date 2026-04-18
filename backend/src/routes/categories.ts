import { Router, Request, Response } from 'express';
import { query } from '../db';

const router = Router();

/**
 * GET /api/categories
 * Returns all product/business categories
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await query(
      'SELECT id, category_name AS cat_name, loc_category_name AS loc_cat_name, slug FROM product_category ORDER BY category_name'
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * GET /api/categories/:id
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await query(
      'SELECT id, category_name AS cat_name, loc_category_name AS loc_cat_name, slug FROM product_category WHERE id = ?',
      [req.params.id]
    );
    if (!result.rows.length) {
      res.status(404).json({ success: false, message: 'Category not found' });
      return;
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
