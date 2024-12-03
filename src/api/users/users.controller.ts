import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Patch,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './decorators/user.decorator';
import { User as UserEntity } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getCurrentUser(@User('sub') userId: string) {
    return this.usersService.findOneById(userId);
  }

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Post()
  async create(@Body() user: Omit<UserEntity, 'id'>) {
    return this.usersService.create(user);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() user: Partial<Omit<UserEntity, 'id'>>,
  ) {
    return this.usersService.update(id, user);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}
