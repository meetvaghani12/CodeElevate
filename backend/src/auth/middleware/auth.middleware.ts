import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Extend the Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log('Auth Middleware: Request received', {
      headers: req.headers,
      url: req.url
    });

    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Auth Middleware: No valid authorization header');
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const token = authHeader.split(' ')[1];
    console.log('Auth Middleware: Token extracted');

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      console.log('Auth Middleware: Invalid or expired token');
      res.status(401).json({ message: 'Invalid or expired token' });
      return;
    }
    console.log('Auth Middleware: Token verified', { decoded });

    // Check if session exists
    const session = await prisma.session.findFirst({
      where: {
        sessionToken: token,
        userId: decoded.id,
        expires: {
          gt: new Date(),
        },
      },
    });

    if (!session) {
      console.log('Auth Middleware: No valid session found');
      res.status(401).json({ message: 'Session expired or invalid' });
      return;
    }
    console.log('Auth Middleware: Valid session found');

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      console.log('Auth Middleware: User not found');
      res.status(401).json({ message: 'User not found' });
      return;
    }
    console.log('Auth Middleware: User found', { userId: user.id });

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
    };
    console.log('Auth Middleware: User attached to request', { user: req.user });

    next();
  } catch (error) {
    console.error('Auth Middleware: Error details:', error);
    res.status(500).json({ message: 'Server error during authentication' });
  }
};

export const authorize = (_roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }


    next();
  };
};