export const auth = {
  loginMaxAttempts: 5,
  registerMaxAttempts: 3,
  passwordResetTokenExpiryMs: 60 * 60 * 1000, // 1 hour
};

export const user = {
  nameMaxLength: 50,
  emailMaxLength: 255,
};

export const note = {
  titleMaxLength: 50,
  contentMaxLength: 100000,
};

export const notebook = {
  nameMaxLength: 50,
};
