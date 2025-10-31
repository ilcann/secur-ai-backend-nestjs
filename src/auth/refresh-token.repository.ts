import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, RefreshToken, User } from '@prisma/client';

@Injectable()
export class RefreshTokenRepository {
  constructor(private prismaService: PrismaService) {}

  async create({
    data,
  }: {
    data: Prisma.RefreshTokenCreateInput;
  }): Promise<RefreshToken> {
    return await this.prismaService.refreshToken.create({
      data,
    });
  }

  async updateRevokedStatus({
    where,
    revoked,
  }: {
    where: Prisma.RefreshTokenWhereUniqueInput;
    revoked: boolean;
  }): Promise<RefreshToken> {
    return await this.prismaService.refreshToken.update({
      where,
      data: { revoked },
    });
  }

  async findByJti(
    jti: string,
  ): Promise<(RefreshToken & { user: User }) | null> {
    const token = await this.prismaService.refreshToken.findUnique({
      where: {
        jti: jti,
      },
      include: { user: true },
    });
    return token;
  }
}
