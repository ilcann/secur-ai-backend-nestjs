export interface JwtPayload {
  sub: number;
  email: string;
  firstName: string;
  lastName: string;
}

export interface RefreshTokenPayload extends JwtPayload {
  jti: string; // Refresh token'ın benzersiz kimliği
}
