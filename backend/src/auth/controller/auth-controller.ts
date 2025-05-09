import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { findUserByEmail, createUser, updateUser } from '../db/user';
import { sendVerificationEmail } from '../utils/email';
import { generateOTP, storeOTP, verifyOTP } from '../utils/otp';
import { generateToken, verifyToken } from '../utils/jwt';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      phone, 
    } = req.body;

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      res.status(400).json({ message: 'User already exists with this email' });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate 2FA secret
    const twoFactorSecret = crypto.randomBytes(32).toString('hex');

    // Create user with properly typed accountType and 2FA secret
    const user = await createUser({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      twoFactorSecret,
    });

    // Generate OTP for email verification
    const otp = await generateOTP(email);
    await storeOTP(email, otp);

    // Send verification email
    await sendVerificationEmail(email, otp, firstName);

    res.status(201).json({
      message: 'User registered successfully. Please verify your email with the OTP sent.',
      userId: user.id,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;

    // Verify OTP
    const isValid = await verifyOTP(email, otp);
    if (!isValid) {
      res.status(400).json({ message: 'Invalid or expired OTP' });
      return;
    }

    // Update user's email verification status
    await updateUser(email, {
      emailVerified: new Date(),
    });

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Server error during email verification' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await findUserByEmail(email);
    if (!user) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    // Check if email is verified
    if (!user.emailVerified) {
      // Generate new OTP for unverified users
      const otp = await generateOTP(email);
      await storeOTP(email, otp);
      await sendVerificationEmail(email, otp, user.firstName);
      
      res.status(400).json({ 
        message: 'Email not verified. A new verification code has been sent to your email.' 
      });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    // Generate 2FA OTP using the user's secret
    const otp = await generateOTP(email);
    await storeOTP(email, otp);
    
    // Send verification email with 2FA OTP
    await sendVerificationEmail(email, otp, user.firstName, true);

    res.status(200).json({
      message: 'OTP sent to your email for 2FA verification',
      userId: user.id,
      requiresOTP: true,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

export const verifyLoginOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        subscription: true
      }
    });
    if (!user) {
      res.status(400).json({ message: 'User not found' });
      return;
    }

    // Verify OTP against user's 2FA secret
    const isValid = await verifyOTP(email, otp);
    if (!isValid) {
      res.status(400).json({ message: 'Invalid or expired OTP' });
      return;
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
    });

    // Create session
    await prisma.session.create({
      data: {
        sessionToken: token,
        userId: user.id,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    // Return user info and token
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        subscription: user.subscription ? {
          plan: user.subscription.plan
        } : null
      },
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Server error during OTP verification' });
  }
};

export const resendOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    // Find user
    const user = await findUserByEmail(email);
    if (!user) {
      res.status(400).json({ message: 'User not found' });
      return;
    }

    // Generate new OTP
    const otp = await generateOTP(email);
    await storeOTP(email, otp);
    await sendVerificationEmail(email, otp, user.firstName);

    res.status(200).json({ message: 'OTP resent successfully' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Server error while resending OTP' });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    // Find user
    const user = await findUserByEmail(email);
    if (!user) {
      res.status(400).json({ message: 'User not found' });
      return;
    }

    // Generate reset token
    const resetToken = generateToken({ id: user.id, email: user.email }, '1h');
    
    // Send password reset email
    await sendVerificationEmail(email, resetToken, user.firstName, false, true);

    res.status(200).json({ message: 'Password reset instructions sent to your email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error during password reset request' });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      res.status(400).json({ message: 'Invalid or expired token' });
      return;
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password
    await updateUser(decoded.email, {
      password: hashedPassword,
    });

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;

    // Delete session
    await prisma.session.deleteMany({
      where: {
        sessionToken: token,
      },
    });

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('GetProfile: Request received', {
      headers: req.headers,
      user: req.user
    });

    if (!req.user) {
      console.log('GetProfile: No user in request');
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    // Get user using email from the authenticated request
    const user = await prisma.user.findUnique({
      where: { email: req.user.email },
      include: {
        subscription: true
      }
    });
    console.log('GetProfile: User found', user ? 'Yes' : 'No');

    if (!user) {
      console.log('GetProfile: User not found');
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Return user info without sensitive data
    const response = {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        emailVerified: user.emailVerified,
        subscription: user.subscription ? {
          plan: user.subscription.plan
        } : null
      },
    };
    console.log('GetProfile: Sending response', response);
    res.status(200).json(response);
  } catch (error) {
    console.error('GetProfile: Error details:', error);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('UpdateProfile: Request received', {
      body: req.body,
      user: req.user
    });

    if (!req.user) {
      console.log('UpdateProfile: No user in request');
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    // Get current user
    const currentUser = await findUserByEmail(req.user.email);
    if (!currentUser) {
      console.log('UpdateProfile: User not found');
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Extract fields from request body
    const { firstName, lastName, email } = req.body;
    
    // Create update data object
    const updateData: any = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    
    // If email is being updated, check it's not already in use
    if (email !== undefined && email !== currentUser.email) {
      const existingUser = await findUserByEmail(email);
      if (existingUser) {
        console.log('UpdateProfile: Email already in use');
        res.status(400).json({ message: 'Email already in use' });
        return;
      }
      updateData.email = email;
    }
    
    // Only update if there are changes
    if (Object.keys(updateData).length === 0) {
      console.log('UpdateProfile: No changes to apply');
      res.status(400).json({ message: 'No changes provided' });
      return;
    }
    
    // Update user profile
    const updatedUser = await updateUser(currentUser.email, updateData);
    console.log('UpdateProfile: User updated', updatedUser);
    
    // Return updated user info
    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phone: updatedUser.phone,
        emailVerified: updatedUser.emailVerified,
      },
    });
  } catch (error) {
    console.error('UpdateProfile: Error details:', error);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
};

export const updatePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('UpdatePassword: Request received', {
      user: req.user
    });

    if (!req.user) {
      console.log('UpdatePassword: No user in request');
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    // Get current user
    const user = await findUserByEmail(req.user.email);
    if (!user) {
      console.log('UpdatePassword: User not found');
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Extract password data
    const { currentPassword, newPassword } = req.body;
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      console.log('UpdatePassword: Current password is incorrect');
      res.status(400).json({ message: 'Current password is incorrect' });
      return;
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update user password
    await updateUser(user.email, {
      password: hashedPassword,
    });
    
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('UpdatePassword: Error details:', error);
    res.status(500).json({ message: 'Server error while updating password' });
  }
};