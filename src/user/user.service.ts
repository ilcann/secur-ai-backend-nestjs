import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { hashPassword } from 'src/common/utils/hash.util';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findById(userId: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async createUser(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: data.email,
        password: await hashPassword(data.password),
        firstName: data.firstName,
        lastName: data.lastName,
      },
    });
  }
}
