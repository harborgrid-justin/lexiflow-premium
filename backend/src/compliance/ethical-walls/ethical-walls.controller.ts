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
import { Public } from '../../common/decorators/public.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation , ApiResponse }from '@nestjs/swagger';
import { EthicalWallsService } from './ethical-walls.service';
import {
  CreateEthicalWallDto,
  UpdateEthicalWallDto,
  QueryEthicalWallsDto,
} from './dto/ethical-wall.dto';

@ApiTags('Compliance - Ethical Walls')
@ApiBearerAuth('JWT-auth')

@Controller('compliance/ethical-walls')
export class EthicalWallsController {
  constructor(private readonly ethicalWallsService: EthicalWallsService) {}

  @Get()
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(@Query() query: QueryEthicalWallsDto) {
    return this.ethicalWallsService.findAll(query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async create(@Body() dto: CreateEthicalWallDto) {
    return this.ethicalWallsService.create(dto);
  }

  @Get('user/:userId')
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async checkWallsForUser(@Param('userId') userId: string) {
    return this.ethicalWallsService.checkWallsForUser(userId);
  }

  @Get(':id')
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async findOne(@Param('id') id: string) {
    return this.ethicalWallsService.findOne(id);
  }

  @Put(':id')
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async update(@Param('id') id: string, @Body() dto: UpdateEthicalWallDto) {
    return this.ethicalWallsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async remove(@Param('id') id: string) {
    return this.ethicalWallsService.remove(id);
  }
}

