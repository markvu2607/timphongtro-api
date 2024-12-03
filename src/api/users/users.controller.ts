import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { ERole } from '../auth/enums/role.enum';
import { User } from './decorators/user.decorator';
import { User as UserEntity } from './entities/user.entity';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getMe(@User('sub') userId: string) {
    return this.usersService.findOneById(userId);
  }

  @Patch('me')
  @HttpCode(HttpStatus.OK)
  async updateMe(
    @User('sub') userId: string,
    @Body() user: Partial<Omit<UserEntity, 'id'>>,
  ) {
    return this.usersService.update(userId, user);
  }

  @Get()
  @Roles(ERole.ADMIN)
  async findAll() {
    return this.usersService.findAll();
  }

  @Post()
  @Roles(ERole.ADMIN)
  async create(@Body() user: Omit<UserEntity, 'id'>) {
    return this.usersService.create(user);
  }

  @Put(':id')
  @Roles(ERole.ADMIN)
  async update(@Param('id') id: string, @Body() user: Omit<UserEntity, 'id'>) {
    return this.usersService.update(id, user);
  }

  @Delete(':id')
  @Roles(ERole.ADMIN)
  async delete(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}
