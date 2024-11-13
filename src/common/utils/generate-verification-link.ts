export const generateVerificationLink = (host: string, token: string) => {
  return `${host}/verify-email?token=${token}`;
};
