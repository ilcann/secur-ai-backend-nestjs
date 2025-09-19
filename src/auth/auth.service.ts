import { ConflictException, Injectable } from '@nestjs/common';
import { comparePassword } from 'src/common/utils/hash.util';
import { UserDto } from 'src/user/dto/user.dto';
import { UserMapper } from 'src/user/mappers/user.mapper';
import { UserService } from 'src/user/user.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private userService: UserService,
  ) {}
  async validateUser(email: string, password: string): Promise<UserDto | null> {
    const user = await this.userService.findByEmail(email);
    if (!user) return null;

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) return null;

    return UserMapper.toDto(user);
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
