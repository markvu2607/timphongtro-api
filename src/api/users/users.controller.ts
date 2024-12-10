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
  Query,
} from '@nestjs/common';
import { PaginationRequestDto } from 'src/common/dtos/requests/pagination.request.dto';
import { ERole } from 'src/common/enums/role.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { User } from './decorators/user.decorator';
import { PaginatedUsersResponseDto } from './dtos/responses/get-users.response.dto';
import { UserResponseDto } from './dtos/responses/user.response.dto';
import { UsersService } from './users.service';
import { UpdateUserRequestDto } from './dtos/requests/update-user.request.dto';
import { CreateUserRequestDto } from './dtos/requests/create-user.request.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getMe(@User('sub') userId: string): Promise<UserResponseDto> {
    const user = await this.usersService.findOneById(userId);
    return new UserResponseDto(user);
  }

  @Patch('me')
  @HttpCode(HttpStatus.OK)
  async updateMe(
    @User('sub') userId: string,
    @Body() user: UpdateUserRequestDto,
  ): Promise<UserResponseDto> {
    const updatedUser = await this.usersService.update(userId, user);
    return new UserResponseDto(updatedUser);
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
  async createAdminUser(
    @Body() createUserRequestDto: CreateUserRequestDto,
  ): Promise<UserResponseDto> {
    const createdUser =
      await this.usersService.createAdminUser(createUserRequestDto);
    return new UserResponseDto(createdUser);
  }

  @Roles(ERole.ADMIN)
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateUserRequestDto: UpdateUserRequestDto,
  ): Promise<UserResponseDto> {
    const updatedUser = await this.usersService.update(
      id,
      updateUserRequestDto,
    );
    return new UserResponseDto(updatedUser);
  }

  @Roles(ERole.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    return await this.usersService.delete(id);
  }
}
