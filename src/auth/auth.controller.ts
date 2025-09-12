import { Body, Controller, Post, Res } from '@nestjs/common';
import { LoginRequestDto } from './dto/login-request.dto';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { LoginResponseDto } from './dto/login-response.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { RegisterRequestDto } from './dto/register-request.dto';
import { UserDto } from 'src/user/dto/user.dto';
import { UserMapper } from 'src/user/mappers/user.mapper';
import type { Response as ResponseType } from 'express';
import { ApiResponse } from 'src/common/dto/api-response.dto';

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
    @Res({ passthrough: true }) response: ResponseType,
  ): Promise<ApiResponse<LoginResponseDto>> {
    const user = await this.authService.validateUser(dto.email, dto.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const accessToken = this.authService.issueAccessToken(user);
    console.log('Generated Access Token:', accessToken); // Log the generated token

    response.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600 * 1000, // 1 hour
    });

    const responseDto: ApiResponse<LoginResponseDto> = {
      message: 'Login successful',
      data: { user },
    };
    return responseDto;
  }

  @Post('logout')
  @ApiOperation({
    summary: 'User logout',
    description: 'Clears the access_token cookie to log out the user',
  })
  logout(@Res({ passthrough: true }) response: ResponseType) {
    response.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });
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
    const user = await this.authService.registerUser(
      dto.email,
      dto.password,
      dto.firstName,
      dto.lastName,
    );
    const userDto: UserDto = UserMapper.toDto(user);
    const response: ApiResponse<RegisterResponseDto> = {
      message: 'User registered successfully',
      data: { user: userDto },
    };

    return response;
  }
}
