import express from 'express';
import {
  register,
  verifyEmail,
  login,
  verifyLoginOTP,
  resendOTP,
  forgotPassword,
  resetPassword,
  logout,
  getProfile,
  updateProfile,
  updatePassword,
} from './../controller/auth-controller';
import {
  validateRequest,
  registrationValidationRules,
  loginValidationRules,
  otpValidationRules,
  passwordResetValidationRules,
  updateProfileValidationRules,
  updatePasswordValidationRules,
} from './../middleware/validate.middleware';
import { authenticate } from './../middleware/auth.middleware';
import googleAuthRoutes from './google-auth-routes';

const router = express.Router();

// Public routes
router.post('/register', validateRequest(registrationValidationRules), register);
router.post('/verify-email', validateRequest(otpValidationRules), verifyEmail);
router.post('/login', validateRequest(loginValidationRules), login);
router.post('/verify-login-otp', validateRequest(otpValidationRules), verifyLoginOTP);
router.post('/resend-otp', resendOTP);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', validateRequest(passwordResetValidationRules), resetPassword);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, validateRequest(updateProfileValidationRules), updateProfile);
router.put('/password', authenticate, validateRequest(updatePasswordValidationRules), updatePassword);

// Google OAuth routes
router.use('/google', googleAuthRoutes);

export default router; 