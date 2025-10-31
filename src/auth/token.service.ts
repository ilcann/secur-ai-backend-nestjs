import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import {
  JwtPayload,
  RefreshTokenPayload,
} from './interfaces/jwt-payload.interface';
import { User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { StringValue } from 'ms';
import cryptoUtils from './utils/crypto.util';
import { RefreshTokenRepository } from './refresh-token.repository';
import ms from 'ms';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private rtRepository: RefreshTokenRepository,
  ) {}
  // -----------------------------------------------------------------
  // 1. JWT OLUŞTURMA İŞLEMLERİ (DB'ye dokunmaz)
  // -----------------------------------------------------------------

  /**
   * Access Token (AT) ve Refresh Token (RT) imzalayarak oluşturur.
   */
  private async generateAccessToken(
    user: User,
  ): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return accessToken;
  }

  private async generateRefreshToken(
    user: User,
  ): Promise<{ refreshToken: string; rtJti: string }> {
    const rtJti = uuidv4();

    const payload: RefreshTokenPayload = {
      sub: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      jti: rtJti,
    };

    const signOptions: JwtSignOptions = {
      secret: this.configService.get<string>('jwt.refreshSecret')!,
      expiresIn: this.configService.get<string>(
        'jwt.refreshTokenExpiresIn',
      )! as StringValue,
    };

    const refreshToken = await this.jwtService.signAsync(payload, signOptions);

    return { refreshToken, rtJti };
  }

  private async getTokens(user: User): Promise<{
    accessToken: string;
    refreshToken: string;
    rtJti: string;
    rtExpiresAt: Date;
  }> {
    const [accessToken, { refreshToken, rtJti }] = await Promise.all([
      this.generateAccessToken(user),
      this.generateRefreshToken(user),
    ]);

    const rtExpiresIn = this.configService.get<string>(
      'jwt.refreshTokenExpiresIn',
    )!;
    const rtExpiresInMs = ms(rtExpiresIn as StringValue);
    const rtExpiresAt = new Date(Date.now() + rtExpiresInMs);
    return { accessToken, refreshToken, rtJti, rtExpiresAt: rtExpiresAt };
  }

  // -----------------------------------------------------------------
  // 2. REFRESH TOKEN SÜREÇ YÖNETİMİ (İŞ MANTIĞI)
  // -----------------------------------------------------------------

  async createSession(
    user: User,
  ): Promise<{ accessToken: string; refreshToken: string; rtJti: string }> {
    // 1. Tokenları oluştur
    const { accessToken, refreshToken, rtJti, rtExpiresAt } =
      await this.getTokens(user);
    // 2. Refresh Token'ı hashle
    const tokenHash = await cryptoUtils.hashPlainText(refreshToken);

    // 3. Hashlenmiş Refresh Token'ı veritabanına kaydet
    await this.rtRepository.create({
      data: {
        user: {
          connect: { id: user.id },
        },
        jti: rtJti,
        hashedSecret: tokenHash,
        expiresAt: rtExpiresAt,
      },
    });

    return { accessToken, refreshToken, rtJti };
  }

  async refreshTokens({
    user,
    oldRtJti,
  }: {
    user: User;
    oldRtJti: string;
  }): Promise<{ accessToken: string; refreshToken: string; rtJti: string }> {
    await this.rtRepository.updateRevokedStatus({
      where: { jti: oldRtJti },
      revoked: true,
    });

    // 2. Yeni tokenlar oluştur
    return this.createSession(user);
  }
}
