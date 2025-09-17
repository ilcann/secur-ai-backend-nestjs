import { Controller, Req, Get, UseGuards } from '@nestjs/common';
import type { AuthenticatedRequest } from 'src/common/dto/authenticated-request.interface';
import { UserMapper } from './mappers/user.mapper';
import { UserDto } from './dto/user.dto';
import { ControllerResponse } from 'src/common/dto/controller-response.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('user')
export class UserController {
  constructor() {}

  @Get('me')
  getMe(
    @Req() req: AuthenticatedRequest,
  ): Promise<ControllerResponse<{ user: UserDto }>> {
    const user = req.user;
    const userDto = UserMapper.toDto(user);
    return Promise.resolve({
      data: { user: userDto },
      message: 'User profile retrieved successfully',
    });
  }
}
