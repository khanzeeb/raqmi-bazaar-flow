import { Controller, Get, Put, Delete, Body, Param, Query, Headers, UnauthorizedException } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto, QueryUsersDto } from './dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll(@Query() query: QueryUsersDto) {
    return this.userService.findAll(query);
  }

  @Get('me')
  getMe(@Headers('authorization') authHeader: string) {
    const token = this.extractToken(authHeader);
    return this.userService.getMe(token);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Put('me')
  updateMe(
    @Headers('authorization') authHeader: string,
    @Body() updateDto: UpdateUserDto
  ) {
    const token = this.extractToken(authHeader);
    return this.userService.updateMe(token, updateDto);
  }

  @Delete('me')
  deleteMe(@Headers('authorization') authHeader: string) {
    const token = this.extractToken(authHeader);
    return this.userService.deleteMe(token);
  }

  @Put(':id/deactivate')
  deactivate(@Param('id') id: string) {
    return this.userService.deactivate(id);
  }

  @Put(':id/reactivate')
  reactivate(@Param('id') id: string) {
    return this.userService.reactivate(id);
  }

  private extractToken(authHeader: string): string {
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('No valid authorization header');
    }
    return authHeader.substring(7);
  }
}
