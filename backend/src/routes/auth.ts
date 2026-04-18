import { Router, Request, Response } from 'express';
import { query } from '../db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();

/**
 * POST /api/auth/register
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, password, name, mobile, email } = req.body;
    if (!username || !password || !mobile) {
      res.status(400).json({ success: false, message: 'Username, password and mobile are required' });
      return;
    }

    const existing = await query('SELECT id FROM user_list WHERE username = ? OR mobile = ?', [username, mobile]);
    if (existing.rows.length) {
      res.status(409).json({ success: false, message: 'User with that username or mobile already exists' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const result = await query(
      `INSERT INTO user_list (username, password, name, mobile, email, role, status, created_at)
       VALUES (?, ?, ?, ?, ?, 'user', 'active', NOW())`,
      [username, passwordHash, name || '', mobile, email || '']
    );

    const newUser = await query(
      'SELECT id, username, name, mobile, email, role FROM user_list WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({ success: true, message: 'Registration successful', data: newUser.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * POST /api/auth/login
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ success: false, message: 'Username and password are required' });
      return;
    }

    // Query admin_users table (created for new auth system)
    const result = await query(
      'SELECT id, username, password, name, email, role FROM admin_users WHERE username = ?',
      [username]
    );

    if (!result.rows.length) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, username: user.username },
      process.env.JWT_SECRET as string,
      { expiresIn: 60 * 60 * 24 * 7 } // 7 days in seconds
    );

    res.json({
      success: true,
      token,
      data: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err: any) {
    console.error('LOGIN ERROR:', err.message);
    res.status(500).json({ success: false, message: 'Server error', detail: err.message });
  }
});

/**
 * GET /api/auth/me (Protected)
 */
router.get('/me', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET as string) as {
      id: number;
    };
    const result = await query(
      'SELECT id, username, name, mobile, email, role FROM user_list WHERE id = ?',
      [decoded.id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch {
    res.status(401).json({ success: false, message: 'Token invalid' });
  }
});

export default router;
