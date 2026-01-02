import { Permissions } from "@auth/decorators/permissions.decorator";
import { RolesGuard } from "@auth/guards/roles.guard";
import { Public } from "@common/decorators/public.decorator";
import { Permission } from "@common/enums/permission.enum";
import { JwtAuthGuard } from "@common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@common/guards/permissions.guard";
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UsersService } from "./users.service";

@ApiTags("Users")
@ApiBearerAuth("JWT-auth")
@Controller("users")
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Permissions(Permission.USER_MANAGE)
  @ApiResponse({ status: 400, description: "Invalid request data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 409, description: "Resource already exists" })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Public() // TODO: Remove in production - add proper auth
  @Get()
  @Permissions(Permission.USER_MANAGE)
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async findAll() {
    return this.usersService.findAll();
  }
  @Public() // TODO: Remove in production - add proper auth
  @Get(":id/profile")
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Resource not found" })
  async getProfile(@Param("id") id: string) {
    // For now, return user details as profile
    // In a real app, this would fetch from a separate profile table
    return this.usersService.findById(id);
  }

  @Public() // TODO: Remove in production - add proper auth  @Get(":id")
  @Permissions(Permission.USER_MANAGE)
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Resource not found" })
  async findOne(@Param("id") id: string) {
    return this.usersService.findById(id);
  }

  @Put(":id")
  @Permissions(Permission.USER_MANAGE)
  @ApiResponse({ status: 400, description: "Invalid request data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Resource not found" })
  async update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(":id")
  @Permissions(Permission.USER_MANAGE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Resource not found" })
  async remove(@Param("id") id: string) {
    return this.usersService.remove(id);
  }
}
