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
import { Public } from '../common/decorators/public.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PartiesService } from './parties.service';
import { CreatePartyDto } from './dto/create-party.dto';
import { UpdatePartyDto } from './dto/update-party.dto';
import { Party } from './entities/party.entity';

@ApiTags('Parties')
@ApiBearerAuth('JWT-auth')
@Public() // Allow public access for development
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
  async findAll(): Promise<Party[]> {
    return this.partiesService.findAll();
  }

  // Get parties by case
  @Get('case/:caseId')
  async findAllByCaseId(@Param('caseId') caseId: string): Promise<Party[]> {
    return this.partiesService.findAllByCaseId(caseId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPartyDto: CreatePartyDto): Promise<Party> {
    return this.partiesService.create(createPartyDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Party> {
    return this.partiesService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePartyDto: UpdatePartyDto,
  ): Promise<Party> {
    return this.partiesService.update(id, updatePartyDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.partiesService.remove(id);
  }
}

