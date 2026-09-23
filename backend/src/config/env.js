import 'dotenv/config';

export const env = {
  // Server
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database
  databaseUrl: process.env.DATABASE_URL,

  // JWT
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtTtl: process.env.JWT_TTL || '7d',

  // Frontend
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',

  // Cloudinary
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,

  // Hostinger (email)
  hostingerApiKey: process.env.HOSTINGER_MAIL_API_KEY,
  hostingerMailboxId: process.env.HOSTINGER_MAIL_MAILBOX_ID,
  hostingerBaseUrl: process.env.HOSTINGER_API_BASE_URL,
  mailFrom: process.env.MAIL_FROM,
  mailFromName: process.env.MAIL_FROM_NAME,

  // Google OAuth (optional)
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL,

  // Redis
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

  // Rate limit
  trustedIps: process.env.TRUSTED_IPS?.split(',')?.map((s) => s.trim()) || [],

  // Security
  accountLockoutThreshold: parseInt(process.env.ACCOUNT_LOCKOUT_THRESHOLD || '5', 10),
  accountLockoutDuration: parseInt(process.env.ACCOUNT_LOCKOUT_DURATION || '900000', 10),
};

export function validateEnv() {
  const required = [
    ['DATABASE_URL', env.databaseUrl],
    ['JWT_ACCESS_SECRET', env.jwtAccessSecret],
    ['CLOUDINARY_CLOUD_NAME', env.cloudinaryCloudName],
    ['CLOUDINARY_API_KEY', env.cloudinaryApiKey],
    ['CLOUDINARY_API_SECRET', env.cloudinaryApiSecret],
    ['HOSTINGER_MAIL_API_KEY', env.hostingerApiKey],
    ['HOSTINGER_MAIL_MAILBOX_ID', env.hostingerMailboxId],
    ['HOSTINGER_API_BASE_URL', env.hostingerBaseUrl],
    ['MAIL_FROM', env.mailFrom],
    ['MAIL_FROM_NAME', env.mailFromName],
  ];

  const missing = [];
  for (const [name, value] of required) {
    if (!value) missing.push(name);
  }

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
