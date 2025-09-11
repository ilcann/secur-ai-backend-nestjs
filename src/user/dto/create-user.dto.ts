import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsString()
  email: string;

  @IsNotEmpty({ message: 'Password cannot be empty.' })
  @IsString()
  password: string;

  @IsNotEmpty({ message: 'First name cannot be empty.' })
  @IsString()
  firstName: string;

  @IsNotEmpty({ message: 'Last name cannot be empty.' })
  @IsString()
  lastName: string;

  @IsOptional()
  @IsInt()
  departmentId?: number;
}
