import { Router, Request, Response } from 'express';
import { query } from '../db';
import { sendEmail } from '../utils/mail';

const router = Router();

/**
 * POST /api/inquiries
 * Submit a new business inquiry (Get Best Price)
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { 
      shop_id, 
      name, 
      business_name, 
      phone_number, 
      category, 
      interested_product, 
      description 
    } = req.body;

    if (!shop_id || !name || !phone_number) {
      res.status(400).json({ success: false, message: 'Shop ID, Name, and Phone Number are required' });
      return;
    }

    // Fetch Shop details for email
    const shopResult = await query("SELECT dukaan_name, email FROM dukaan_list WHERE id = ?", [shop_id]);
    const shop = shopResult.rows[0] || { dukaan_name: 'Unknown Shop' };

    // Ensure table exists
    await query(`
      CREATE TABLE IF NOT EXISTS inquiries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        shop_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        business_name VARCHAR(255),
        phone_number VARCHAR(20) NOT NULL,
        category VARCHAR(255),
        interested_product VARCHAR(255),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    const result = await query(
      `INSERT INTO inquiries (
        shop_id, name, business_name, phone_number, category, interested_product, description
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [shop_id, name, business_name, phone_number, category, interested_product, description]
    );

    // Send Email Notification to Admin (Non-blocking)
    try {
      await sendEmail({
        to: process.env.ADMIN_EMAIL || 'info@deshkhoj.in',
        subject: `New Inquiry for ${shop.dukaan_name}: ${interested_product || 'Price Quote'}`,
        html: `
          <h3>New Business Inquiry</h3>
          <p><strong>Shop:</strong> ${shop.dukaan_name} (ID: ${shop_id})</p>
          <p><strong>Customer Name:</strong> ${name}</p>
          <p><strong>Business:</strong> ${business_name || 'N/A'}</p>
          <p><strong>Phone:</strong> ${phone_number}</p>
          <p><strong>Category:</strong> ${category || 'N/A'}</p>
          <p><strong>Interested In:</strong> ${interested_product || 'N/A'}</p>
          <p><strong>Message:</strong> ${description || 'N/A'}</p>
          <br/>
          <p><em>This inquiry has been saved to the database.</em></p>
        `
      });
    } catch (emailErr) {
      console.error('Email failed to send, but inquiry was saved:', emailErr);
    }

    res.status(201).json({
      success: true,
      message: 'Inquiry submitted successfully',
      data: { id: result.insertId }
    });
  } catch (err: any) {
    console.error('Inquiry submission error:', err);
    res.status(500).json({ success: false, message: 'Server error during inquiry submission', detail: err.message });
  }
});

/**
 * GET /api/inquiries
 * View all inquiries (Admin only - though we might add protect/adminOnly middleware later)
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT i.*, d.dukaan_name as shop_name 
       FROM inquiries i 
       JOIN dukaan_list d ON i.shop_id = d.id 
       ORDER BY i.created_at DESC`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
