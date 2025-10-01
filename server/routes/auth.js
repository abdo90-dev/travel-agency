import express from 'express';
import { generateToken, authenticateToken } from '../middleware/auth.js';
import bcrypt from 'bcrypt';
import pool from '../db.js';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const router = express.Router();

// Mock users database (replace with real database later)

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const result = await pool.query(
      'SELECT id, email, password_hash, full_name, role, created_at FROM "User" WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const userForToken = {
      id: user.id.toString(),
      email: user.email,
      fullName: user.full_name,
      role: user.role
    };
console.log(userForToken);

    const token = generateToken(userForToken);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        createdAt: user.created_at
      }
    });

  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ error: 'Login failed' });
  }
});


/**
 * POST /api/auth/register
 * Register new user
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    // Only require email, password, and fullName (let database handle id and createdAt)
    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Email, password, and fullName are required' });
    }

    // Check if user already exists - fix the quotes (no quotes around column names)
    const existingUser = await pool.query(
      'SELECT id FROM "User" WHERE email = $1',
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into DB - DON'T provide id (let SERIAL auto-generate it)
    const result = await pool.query(
      `INSERT INTO "User" (email, password_hash, full_name, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, email, password_hash, full_name, role, created_at`,
      [email, hashedPassword, fullName, 'customer']
    );

    const newUser = result.rows[0];

    // Create user object for JWT (use the data returned from database)
    const userForToken = {
      id: newUser.id.toString(), // Convert integer to string for JWT
      email: newUser.email,
      fullName: newUser.full_name, // Database returns full_name
      role: newUser.role
    };

    // Generate JWT
    const token = generateToken(userForToken);

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.full_name,
        role: newUser.role,
        createdAt: newUser.created_at
      }
    });

  } catch (error) {
    console.error("❌ Registration error:", error);
    res.status(500).json({ error: error.message || 'Registration failed' });
  }
});
/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.user.id) },
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
        created_at: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      createdAt: user.created_at
    });
  } catch (error) {
    console.error("❌ /me error:", error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

export default router;