import { UserDto } from 'src/user/dto/user.dto';

export class LoginResponseDto {
  user: UserDto;
  constructor(user: UserDto) {
    this.user = user;
  }
}
