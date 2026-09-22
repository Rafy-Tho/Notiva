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

  // Brevo (email)
  brevoApiKey: process.env.BREVO_API_KEY,
  brevoFromName: process.env.BREVO_FROM_NAME,
  brevoFromEmail: process.env.BREVO_FROM_EMAIL,

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
    ['BREVO_API_KEY', env.brevoApiKey],
    ['BREVO_FROM_NAME', env.brevoFromName],
    ['BREVO_FROM_EMAIL', env.brevoFromEmail],
  ];

  const missing = [];
  for (const [name, value] of required) {
    if (!value) missing.push(name);
  }

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
