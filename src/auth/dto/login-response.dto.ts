import { UserDto } from 'src/user/dto/user.dto';

export class LoginResponseDto {
  accessToken: string;
  user: UserDto;
  constructor(accessToken: string, user: UserDto) {
    this.accessToken = accessToken;
    this.user = user;
  }
}
