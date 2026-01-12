export const cleanVerificationCode = (code: string): string => {
  return code.replace(/\D/g, '').slice(0, 6);
};

export const formatBackupCodes = (codes: string[]): string => {
  return codes.join('\n');
};
