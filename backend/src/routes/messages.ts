import { Router, Request, Response } from 'express';
import { sendEmail } from '../utils/mail';

const router = Router();

/**
 * POST /api/messages
 * Submit a general contact message
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      res.status(400).json({ success: false, message: 'Name, Email, and Message are required' });
      return;
    }

    // Send Email Notification to Admin
    await sendEmail({
      to: process.env.ADMIN_EMAIL || 'info@deshkhoj.in',
      subject: `New Contact Message from ${name}`,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    });

    res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully'
    });
  } catch (err) {
    console.error('Contact form error:', err);
    res.status(500).json({ success: false, message: 'Server error during contact form submission' });
  }
});

export default router;
