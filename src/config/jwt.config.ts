import { registerAs } from '@nestjs/config';

export const jwtConfig = registerAs('jwt', () => {
  const secret = process.env.JWT_SECRET;
  const refreshSecret = process.env.JWT_REFRESH_SECRET;

  // Erişim token'ının geçerlilik süresi (örneğin 15 dakika)
  const accessTokenExpiresIn = process.env.JWT_ACCESS_TOKEN_EXPIRY || '900s';
  // Yenileme token'ının geçerlilik süresi (örneğin 7 gün)
  const refreshTokenExpiresIn = process.env.JWT_REFRESH_TOKEN_EXPIRY || '7d';

  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not defined.');
  }
  if (!refreshSecret) {
    throw new Error(
      'JWT_REFRESH_SECRET environment variable is not defined for Refresh Token.',
    );
  }

  return {
    // 1. Access Token Gizli Anahtarı
    secret: secret,
    accessTokenExpiresIn: accessTokenExpiresIn,
    // 2. Refresh Token Gizli Anahtarı
    refreshSecret: refreshSecret,
    refreshTokenExpiresIn: refreshTokenExpiresIn,
  };
});
