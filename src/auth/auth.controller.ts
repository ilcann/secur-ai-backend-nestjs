import { Body, Controller, HttpException, Post } from '@nestjs/common';
import { LoginRequestDto } from './dto/login-request.dto';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { LoginResponseDto } from './dto/login-response.dto';
import { ApiResponse } from 'src/common/dto/api-response.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { RegisterRequestDto } from './dto/register-request.dto';
import { UserDto } from 'src/user/dto/user.dto';
import { UserMapper } from 'src/user/mappers/user.mapper';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('login')
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticate user with email and password, returns JWT token',
  })
  @ApiBody({
    type: LoginRequestDto,
    description: 'User login credentials',
  })
  async login(
    @Body() dto: LoginRequestDto,
  ): Promise<ApiResponse<LoginResponseDto>> {
    try {
      const user = await this.authService.validateUser(dto.email, dto.password);
      if (!user) throw new UnauthorizedException();

      const accessToken = this.authService.issueAccessToken(user);

      const response: LoginResponseDto = { accessToken, user };

      return {
        success: true,
        message: 'Login successful',
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof HttpException ? error.message : 'Login failed',
      };
    }
  }

  @Post('register')
  @ApiOperation({
    summary: 'User registration',
    description: 'Register a new user account',
  })
  @ApiBody({
    type: RegisterRequestDto,
    description: 'User registration data',
  })
  async register(
    @Body() dto: RegisterRequestDto,
  ): Promise<ApiResponse<RegisterResponseDto>> {
    try {
      const user = await this.authService.registerUser(
        dto.email,
        dto.password,
        dto.firstName,
        dto.lastName,
      );
      const userDto: UserDto = UserMapper.toDto(user);
      const response: RegisterResponseDto = { user: userDto };

      return {
        success: true,
        message: 'Registration successful',
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof HttpException
            ? error.message
            : 'Registration failed',
      };
    }
  }
}
