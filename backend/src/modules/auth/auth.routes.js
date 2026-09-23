import { Router } from 'express';
import * as c from './auth.controller.js';
import * as oauthC from './oauth.controller.js';
import { authLimiter } from '../../common/middleware/rateLimiter.js';
import { validate } from '../../common/middleware/validate.js';
import { authenticate } from '../../common/middleware/authenticate.js';
import { 
  loginV, 
  registerV, 
  resendVerificationV,
  verifyEmailV,
  resetPasswordV,
  confirmPasswordResetV
} from './auth.validation.js';
import { asyncHandler } from '../../common/utils/response.js';

const r = Router();

r.get('/verify', authenticate, asyncHandler(c.verify));

r.use(authLimiter);
r.post('/register', validate(registerV), asyncHandler(c.register));
r.post('/login', validate(loginV), asyncHandler(c.login));
r.post('/resend-verification', validate(resendVerificationV), asyncHandler(c.resendVerification));
r.post('/verify-email', validate(verifyEmailV), asyncHandler(c.verifyEmail));
r.post('/reset-password-code', validate(resetPasswordV), asyncHandler(c.resetPasswordCode));
r.post('/confirm-password-reset', validate(confirmPasswordResetV), asyncHandler(c.confirmPasswordReset));
r.post('/logout', asyncHandler(c.logout));

r.get('/google', asyncHandler(oauthC.googleLogin));
r.get('/google/callback', asyncHandler(oauthC.googleCallback));

export default r;
