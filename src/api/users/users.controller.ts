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
  Query,
} from '@nestjs/common';
import { PaginationRequestDto } from 'src/common/dtos/requests/pagination.request.dto';
import { ERole } from 'src/common/enums/role.enum';
import { User as UserEntity } from 'src/repositories/entities';
import { Roles } from '../auth/decorators/roles.decorator';
import { User } from './decorators/user.decorator';
import { PaginatedUsersResponseDto } from './dtos/responses/get-users.response.dto';
import { UserResponseDto } from './dtos/responses/user.response.dto';
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

  @Roles(ERole.ADMIN)
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() query: PaginationRequestDto,
  ): Promise<PaginatedUsersResponseDto> {
    const { users, total, page, limit } =
      await this.usersService.findAll(query);

    return new PaginatedUsersResponseDto({
      items: users.map((user) => new UserResponseDto(user)),
      total,
      page,
      limit,
    });
  }

  @Roles(ERole.ADMIN)
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOneById(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.usersService.findOneById(id);
    return new UserResponseDto(user);
  }

  @Roles(ERole.ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() user: Omit<UserEntity, 'id'>): Promise<UserResponseDto> {
    const createdUser = await this.usersService.create(user);
    return new UserResponseDto(createdUser);
  }

  @Roles(ERole.ADMIN)
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() user: Omit<UserEntity, 'id'>) {
    return this.usersService.update(id, user);
  }

  @Roles(ERole.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}
