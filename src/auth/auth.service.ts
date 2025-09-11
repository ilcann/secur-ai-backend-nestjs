import { ConflictException, Injectable } from '@nestjs/common';
import { comparePassword, hashPassword } from 'src/common/utils/hash.util';
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
    console.log('Validating user with email:', email);
    console.log('Provided password:', await hashPassword(password));
    const user = await this.userService.findByEmail(email);
    console.log('User found:', user);
    console.log('User password:', user?.password);
    if (!user) return null;

    const isPasswordValid = await comparePassword(password, user.password);
    console.log('Is password valid:', isPasswordValid);
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
}
