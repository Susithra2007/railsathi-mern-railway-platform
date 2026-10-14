import { Request, Response } from 'express';
import { db } from '../db';

export const login = (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = db.getUserByEmail(email);
    if (!user || user.passwordHash !== password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Use demo accounts passenger@rail.in / pass123 or admin@rail.in / admin123' });
    }

    // In this demonstration environment, generate standard token
    const token = `jwt_token_${user.id}_${Date.now()}`;

    return res.json({
      success: true,
      message: 'Authentication successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const register = (req: Request, res: Response) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
    }

    const newUser = db.registerUser({
      name,
      email,
      password,
      phone: phone || '+91 90000 00000',
    });

    const token = `jwt_token_${newUser.id}_${Date.now()}`;

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Registration failed' });
  }
};

export const getProfile = (req: Request, res: Response) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || 'usr_passenger_1';
    const user = db.getUserById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
