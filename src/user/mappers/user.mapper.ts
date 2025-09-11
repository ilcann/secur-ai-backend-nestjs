// src/common/mappers/user.mapper.ts
import { User } from '@prisma/client';
import { UserDto } from '../dto/user.dto';
export class UserMapper {
  static toDto(user: User): UserDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      departmentId: user.departmentId,
    };
  }
}
