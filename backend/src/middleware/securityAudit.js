import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOG_FILE = process.env.SECURITY_LOG_FILE || path.join(__dirname, '..', '..', '..', 'logs', 'security.log');

function ensureLogDir() {
  const dir = path.dirname(LOG_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function audit(event, details) {
  ensureLogDir();
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] [AUDIT] ${event} - ${JSON.stringify(details)}\n`;
  fs.appendFileSync(LOG_FILE, logLine);
}

export const securityAudit = {
  failedLogin(email, ip) {
    audit('FAILED_LOGIN', { email, ip });
  },

  successfulLogin(email, ip) {
    audit('SUCCESSFUL_LOGIN', { email, ip });
  },

  passwordResetRequested(email, ip) {
    audit('PASSWORD_RESET_REQUESTED', { email, ip });
  },

  passwordResetCompleted(email, ip) {
    audit('PASSWORD_RESET_COMPLETED', { email, ip });
  },

  accountDeleted(userId, email, ip) {
    audit('ACCOUNT_DELETED', { userId, email, ip });
  },

  avatarChanged(userId, email, ip) {
    audit('AVATAR_CHANGED', { userId, email, ip });
  },

  unauthorizedAccess(userId, resource, ip) {
    audit('UNAUTHORIZED_ACCESS', { userId, resource, ip });
  },
};

export default securityAudit;
