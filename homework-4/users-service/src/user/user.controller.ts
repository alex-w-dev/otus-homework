import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiTags } from '@nestjs/swagger';
import { UserCreateDto } from './dto/user-create.dto';
import { User } from './dto/user.dto';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('')
  geAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get(':userId')
  getUserById(@Param('userId') userId: string): Promise<User> {
    return this.userService.get(userId);
  }

  @Post('')
  create(@Body() user: UserCreateDto): Promise<User> {
    return this.userService.create(user);
  }

  @Put(':userId')
  update(
    @Param('userId') userId: string,
    @Body() user: UserCreateDto,
  ): Promise<User> {
    return this.userService.update({ ...user, _id: userId });
  }

  @Delete(':userId')
  delete(@Param('userId') userId: string): Promise<User> {
    return this.userService.delete(userId);
  }
}
