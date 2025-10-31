import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenService } from '../token.service';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { RefreshTokenPayload } from '../interfaces/jwt-payload.interface';
import { RefreshTokenRepository } from '../refresh-token.repository';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
    private readonly rtTokenRepository: RefreshTokenRepository,
    private readonly prismaService: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
        (req: Request) => req?.cookies?.refreshToken ?? null,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.refreshSecret')!,
    });
  }

  async validate(payload: RefreshTokenPayload): Promise<{
    sub: number;
    jti: string;
  }> {
    const { sub, jti } = payload;
    const matchingToken = await this.rtTokenRepository.findByJti(jti);

    if (!matchingToken || matchingToken.revoked) {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    return { sub, jti };
  }
}
