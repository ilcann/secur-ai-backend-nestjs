import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserDto } from 'src/user/dto/user.dto';
import { UserMapper } from 'src/user/mappers/user.mapper';
import { UserService } from 'src/user/user.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { User, UserStatus } from '@prisma/client';
import { TokenService } from './token.service';
import cryptoUtils from './utils/crypto.util';



@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private userService: UserService,
    private tokenService: TokenService,
  ) {}
  async validateUser(email: string, password: string): Promise<{ user, accessToken, refreshToken }> {
    const user = await this.userService.findByEmail(email);

    // 2. Kullanıcı/Etkinlik Kontrolü
    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // 3. Şifre Doğrulaması
    const isPasswordValid = await cryptoUtils.compareWithHash(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 4. Başarılı Giriş Loglama
    const { accessToken, refreshToken } =
      await this.tokenService.createSession(user);

    return { user, accessToken, refreshToken };
  }
  issueAccessToken(user: UserDto): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
    const accessToken = this.jwtService.sign(payload);
    return accessToken;
  }

  async registerUser(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ): Promise<User> {
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) throw new ConflictException('Email already in use');

    const newUser = await this.userService.createUser({
      email,
      password,
      firstName,
      lastName,
    });

    return newUser;
  }

  async verifyToken(token: string): Promise<UserDto | null> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      const user = await this.userService.findById(payload.sub);
      if (!user) return null;
      return UserMapper.toDto(user);
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }
}
