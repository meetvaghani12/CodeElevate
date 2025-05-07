import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Response | void => {
  console.log('Debug: Auth middleware - Headers:', req.headers);
  const authHeader = req.headers['authorization'];
  console.log('Debug: Auth middleware - Auth header:', authHeader);
  
  const token = authHeader && authHeader.split(' ')[1];
  console.log('Debug: Auth middleware - Extracted token:', token ? 'Token exists' : 'No token');

  if (!token) {
    console.log('Debug: Auth middleware - No token found');
    return res.status(401).json({ message: 'Authentication token required' });
  }

  try {
    console.log('Debug: Auth middleware - Verifying token');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as {
      id: string;
      email: string;
    };
    console.log('Debug: Auth middleware - Token decoded:', decoded);
    req.user = decoded;
    return next();
  } catch (error) {
    console.error('Debug: Auth middleware - Token verification failed:', error);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
}; 