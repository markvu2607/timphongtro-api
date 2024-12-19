export const generateVerificationLink = (host: string, token: string) => {
  return `${host}/auth/verify-email?token=${token}`;
};
