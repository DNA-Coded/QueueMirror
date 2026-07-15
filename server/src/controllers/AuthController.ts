import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { AuthRequest } from '../middleware/auth.js';
import { OAuth2Client } from 'google-auth-library';

const JWT_SECRET = process.env.JWT_SECRET || 'queuemirror_jwt_secret_key_12345';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

// Helper to generate tokens
const generateToken = (userId: string, role: string) => {
  return jwt.sign({ id: userId, role }, JWT_SECRET, { expiresIn: '7d' });
};

// Register
export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ message: 'All fields are required.' });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({ message: 'Email already registered.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: 'user', // default role
      avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`
    });

    await user.save();
    const token = generateToken(user._id.toString(), user.role);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        points: user.points,
        level: user.level,
        avatarUrl: user.avatarUrl
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error during registration.' });
  }
};

// Login
export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required.' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials.' });
      return;
    }

    const token = generateToken(user._id.toString(), user.role);

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        points: user.points,
        level: user.level,
        avatarUrl: user.avatarUrl
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error during login.' });
  }
};

// Google OAuth Login
export const googleLogin = async (req: AuthRequest, res: Response) => {
  try {
    const { token } = req.body;
    if (!token) {
      res.status(400).json({ message: 'Google ID token required.' });
      return;
    }

    let email = '';
    let name = '';
    let avatarUrl = '';

    if (googleClient) {
      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: GOOGLE_CLIENT_ID
      });
      const payload = ticket.getPayload();
      if (!payload || !payload.email || !payload.name) {
        res.status(400).json({ message: 'Invalid Google token payload.' });
        return;
      }
      email = payload.email;
      name = payload.name;
      avatarUrl = payload.picture || '';
    } else {
      // Mock Google Auth fallback for local testing & demos if Client ID is missing
      // The token can contain JSON stringified info or a dummy string
      try {
        const decoded = JSON.parse(token);
        email = decoded.email || 'demo_google_user@queuemirror.com';
        name = decoded.name || 'Demo Google User';
        avatarUrl = decoded.picture || '';
      } catch {
        email = 'demo_google_user@queuemirror.com';
        name = 'Demo Google User';
        avatarUrl = 'https://api.dicebear.com/7.x/adventurer/svg?seed=DemoGoogle';
      }
    }

    let user = await User.findOne({ email });
    if (!user) {
      // Create user if not exists
      const dummyPassword = await bcrypt.hash(Math.random().toString(36), 10);
      user = new User({
        name,
        email,
        password: dummyPassword,
        role: 'user',
        avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`
      });
      await user.save();
    }

    const appToken = generateToken(user._id.toString(), user.role);

    res.status(200).json({
      token: appToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        points: user.points,
        level: user.level,
        avatarUrl: user.avatarUrl
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Google Auth Server Error.' });
  }
};

// Forgot Password (Mock / Send Token Link)
export const forgotPassword = async (req: AuthRequest, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: 'No account with that email exists.' });
      return;
    }
    // In a full production system, we would send an email with a reset token here.
    // For our venture-scale prototype, we return a mock reset code or link.
    res.status(200).json({
      message: 'Password reset link generated.',
      resetCode: 'RESET_TOKEN_' + user._id.toString()
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Reset Password
export const resetPassword = async (req: AuthRequest, res: Response) => {
  try {
    const { resetCode, newPassword } = req.body;
    if (!resetCode || !newPassword) {
      res.status(400).json({ message: 'Reset code and new password are required.' });
      return;
    }

    const userId = resetCode.replace('RESET_TOKEN_', '');
    const user = await User.findById(userId);
    if (!user) {
      res.status(400).json({ message: 'Invalid reset code.' });
      return;
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: 'Password reset successful. You can now login.' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get Profile
export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }
    res.status(200).json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
