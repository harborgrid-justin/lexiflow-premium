import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EthicalWallsService } from './ethical-walls.service';
import {
  CreateEthicalWallDto,
  UpdateEthicalWallDto,
  QueryEthicalWallsDto,
} from './dto/ethical-wall.dto';

@Controller('api/v1/compliance/ethical-walls')
export class EthicalWallsController {
  constructor(private readonly ethicalWallsService: EthicalWallsService) {}

  @Get()
  async findAll(@Query() query: QueryEthicalWallsDto) {
    return this.ethicalWallsService.findAll(query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateEthicalWallDto) {
    return this.ethicalWallsService.create(dto);
  }

  @Get('user/:userId')
  async checkWallsForUser(@Param('userId') userId: string) {
    return this.ethicalWallsService.checkWallsForUser(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.ethicalWallsService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateEthicalWallDto) {
    return this.ethicalWallsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return this.ethicalWallsService.remove(id);
  }
}
