import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Head,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth  , ApiResponse }from '@nestjs/swagger';
import { Public } from '@common/decorators/public.decorator';
import { PartiesService } from './parties.service';
import { CreatePartyDto } from './dto/create-party.dto';
import { UpdatePartyDto } from './dto/update-party.dto';
import { Party } from './entities/party.entity';

@ApiTags('Parties')
@ApiBearerAuth('JWT-auth')

@Controller('parties')
export class PartiesController {
  constructor(private readonly partiesService: PartiesService) {}

  // Health check endpoint
  @Head()
  @HttpCode(HttpStatus.OK)
  async health() {
    return;
  }

  // Get all parties
  @Get()
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(): Promise<Party[]> {
    return this.partiesService.findAll();
  }

  // Get parties by case
  @Get('case/:caseId')
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAllByCaseId(@Param('caseId') caseId: string): Promise<Party[]> {
    return this.partiesService.findAllByCaseId(caseId);
  }

  @Public()  // Temporarily public for import script testing
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async create(@Body() createPartyDto: CreatePartyDto): Promise<Party> {
    return this.partiesService.create(createPartyDto);
  }

  @Get(':id')
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async findOne(@Param('id') id: string): Promise<Party> {
    return this.partiesService.findOne(id);
  }

  @Put(':id')
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async update(
    @Param('id') id: string,
    @Body() updatePartyDto: UpdatePartyDto,
  ): Promise<Party> {
    return this.partiesService.update(id, updatePartyDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.partiesService.remove(id);
  }
}

