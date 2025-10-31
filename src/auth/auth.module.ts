import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import type { StringValue } from 'ms';
import { ConfigService } from '@nestjs/config';
import { TokenService } from './token.service';
import { RefreshTokenRepository } from './refresh-token.repository';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('jwt.secret')!;
        const expiresIn = configService.get<string>(
          'jwt.accessTokenExpiresIn',
        )!;

        return {
          secret: secret,
          signOptions: { expiresIn: expiresIn as StringValue },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, TokenService, RefreshTokenRepository],
  exports: [AuthService, JwtStrategy],
})
export class AuthModule {}
