import { Router, Request, Response } from 'express';
import { query } from '../db';

const router = Router();

/**
 * GET /api/locations/states
 * Returns all states
 */
router.get('/states', async (_req: Request, res: Response) => {
  try {
    const result = await query(
      'SELECT id, state_name, loc_state_name, slug FROM states ORDER BY state_name'
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * GET /api/locations/districts?state_id=1
 * Returns all districts, optionally filtered by state
 */
router.get('/districts', async (req: Request, res: Response) => {
  try {
    const { state_id } = req.query;
    let result;
    if (state_id) {
      result = await query(
        'SELECT id, district_name, loc_district_name, slug, state_id FROM districts WHERE state_id = ? ORDER BY district_name',
        [state_id]
      );
    } else {
      result = await query(
        'SELECT id, district_name, loc_district_name, slug, state_id FROM districts ORDER BY district_name'
      );
    }
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * GET /api/locations/blocks?district_id=1
 * Returns all blocks, optionally filtered by district
 */
router.get('/blocks', async (req: Request, res: Response) => {
  try {
    const { district_id } = req.query;
    let result;
    if (district_id) {
      result = await query(
        'SELECT id, block_name, loc_block_name, slug, district_id FROM blocks WHERE district_id = ? ORDER BY block_name',
        [district_id]
      );
    } else {
      result = await query('SELECT id, block_name, loc_block_name, slug, district_id FROM blocks ORDER BY block_name');
    }
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * GET /api/locations/villages?block_id=1
 * Returns all villages, optionally filtered by block
 */
router.get('/villages', async (req: Request, res: Response) => {
  try {
    const { block_id } = req.query;
    let result;
    if (block_id) {
      result = await query(
        'SELECT id, village_name, loc_village_name, slug, block_id FROM villages WHERE block_id = ? ORDER BY village_name',
        [block_id]
      );
    } else {
      result = await query('SELECT id, village_name, loc_village_name, slug, block_id FROM villages ORDER BY village_name LIMIT 200');
    }
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
