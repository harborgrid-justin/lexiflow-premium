import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MattersService } from './matters.service';
import { CreateMatterDto } from './dto/create-matter.dto';
import { UpdateMatterDto } from './dto/update-matter.dto';
import { MatterResponseDto, MatterListResponseDto } from './dto/matter-response.dto';

@Controller('matters')
export class MattersController {
  constructor(private readonly mattersService: MattersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(ValidationPipe) createMatterDto: CreateMatterDto,
  ): Promise<MatterResponseDto> {
    return this.mattersService.create(createMatterDto);
  }

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: string,
    @Query('matterType') matterType?: string,
    @Query('priority') priority?: string,
    @Query('clientId') clientId?: string,
    @Query('leadAttorneyId') leadAttorneyId?: string,
    @Query('search') search?: string,
  ): Promise<MatterListResponseDto> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const pageSizeNum = pageSize ? parseInt(pageSize, 10) : 50;

    const filters = {
      status,
      matterType,
      priority,
      clientId,
      leadAttorneyId,
      search,
    };

    const { matters, total } = await this.mattersService.findAll(
      pageNum,
      pageSizeNum,
      filters,
    );

    return new MatterListResponseDto(matters, total, pageNum, pageSizeNum);
  }

  @Get('statistics')
  async getStatistics(@Query('userId') userId?: string): Promise<any> {
    return this.mattersService.getStatistics(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<MatterResponseDto> {
    return this.mattersService.findOne(id);
  }

  @Get('by-number/:matterNumber')
  async findByMatterNumber(
    @Param('matterNumber') matterNumber: string,
  ): Promise<MatterResponseDto> {
    return this.mattersService.findByMatterNumber(matterNumber);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateMatterDto: UpdateMatterDto,
  ): Promise<MatterResponseDto> {
    return this.mattersService.update(id, updateMatterDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.mattersService.remove(id);
  }

  @Post(':id/archive')
  async archive(@Param('id') id: string): Promise<MatterResponseDto> {
    return this.mattersService.archive(id);
  }

  @Post(':id/restore')
  async restore(@Param('id') id: string): Promise<MatterResponseDto> {
    return this.mattersService.restore(id);
  }
}
