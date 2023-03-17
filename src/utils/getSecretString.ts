import crypto from 'crypto';

export default (size: number = 32): string => {
  return crypto.randomBytes(size).toString('base64');
};

