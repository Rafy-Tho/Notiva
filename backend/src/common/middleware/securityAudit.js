import { logger } from "../utils/logger.js";

const LOG_PREFIX = "[security-audit]";

function log(action, email, ip) {
  logger.info(`${LOG_PREFIX} ${action} - email: ${email}, ip: ${ip}`);
}

export const securityAudit = {
  failedLogin(email, ip) {
    log("failed login", email, ip);
  },

  successfulLogin(email, ip) {
    log("successful login", email, ip);
  },

  passwordResetRequested(email, ip) {
    log("password reset requested", email, ip);
  },

  passwordResetCompleted(email, ip) {
    log("password reset completed", email, ip);
  },

  accountDeleted(userId, email, ip) {
    log("account deleted", email, ip);
  },

  avatarChanged(userId, email, ip) {
    log("avatar changed", email, ip);
  },
};
