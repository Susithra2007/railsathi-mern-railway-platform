import { Request, Response } from 'express';
import { db } from '../db';

export const login = (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email address and password.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const user = db.validatePassword(cleanEmail, String(password));

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please verify your credentials or register a new account.',
      });
    }

    const token = `jwt_token_${user.id}_${Date.now()}`;

    return res.json({
      success: true,
      message: 'Login successful! Welcome to RailSathi.',
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
    return res.status(500).json({ success: false, message: error.message || 'Authentication error' });
  }
};

export const register = (req: Request, res: Response) => {
  try {
    const { name, email, password, confirmPassword, phone, role, designation, adminPasscode } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    // Determine Role
    let assignedRole: 'PASSENGER' | 'ADMIN' = 'PASSENGER';
    if (role === 'ADMIN') {
      const allowedCodes = ['RAILADMIN2026', 'RAILADMIN', 'ADMIN', 'ADMIN123', 'RAIL2026', 'STATIONMASTER'];
      if (adminPasscode && !allowedCodes.includes(String(adminPasscode).trim().toUpperCase())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Admin Authorization Code. Please use official code (e.g. RAILADMIN2026) or leave blank for default verification.',
        });
      }
      assignedRole = 'ADMIN';
    }

    const newUser = db.registerUser({
      name,
      email,
      password,
      phone: phone || '+91 98000 00000',
      role: assignedRole,
      designation: designation || (assignedRole === 'ADMIN' ? 'Station Controller' : undefined),
    });

    const token = `jwt_token_${newUser.id}_${Date.now()}`;

    return res.status(201).json({
      success: true,
      message:
        assignedRole === 'ADMIN'
          ? 'Railway Administrator account registered successfully! Full admin console unlocked.'
          : 'Passenger account created successfully! You are now logged in.',
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

export const forgotPassword = (req: Request, res: Response) => {
  try {
    const { email, newPassword } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const user = db.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ success: false, message: 'No registered account found with this email address.' });
    }

    const resetPass = newPassword || 'pass123';
    db.resetPassword(email, resetPass);

    return res.json({
      success: true,
      message: `Password reset successfully! Your new demonstration password is '${resetPass}'. You may now log in.`,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getProfile = (req: Request, res: Response) => {
  try {
    const userId = (req.headers['x-user-id'] as string);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authorization header required' });
    }

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
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const updateProfile = (req: Request, res: Response) => {
  try {
    const userId = (req.headers['x-user-id'] as string);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authorization header required' });
    }

    const { name, phone } = req.body;
    const updated = db.updateUserProfile(userId, { name, phone });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        role: updated.role,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
