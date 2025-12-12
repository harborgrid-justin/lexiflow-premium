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
} from '@nestjs/common';
import { PartiesService } from './parties.service';
import { CreatePartyDto } from './dto/create-party.dto';
import { UpdatePartyDto } from './dto/update-party.dto';
import { Party } from './entities/party.entity';

@Controller('api/v1')
export class PartiesController {
  constructor(private readonly partiesService: PartiesService) {}

  @Get('cases/:caseId/parties')
  async findAllByCaseId(@Param('caseId') caseId: string): Promise<Party[]> {
    return this.partiesService.findAllByCaseId(caseId);
  }

  @Post('cases/:caseId/parties')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPartyDto: CreatePartyDto): Promise<Party> {
    return this.partiesService.create(createPartyDto);
  }

  @Put('parties/:id')
  async update(
    @Param('id') id: string,
    @Body() updatePartyDto: UpdatePartyDto,
  ): Promise<Party> {
    return this.partiesService.update(id, updatePartyDto);
  }

  @Delete('parties/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.partiesService.remove(id);
  }

  @Post('parties/check-conflicts')
  async checkConflicts(
    @Body() body: { name: string; type: string; caseId: string; excludePartyId?: string },
  ) {
    return this.partiesService.checkConflicts(
      body.name,
      body.type,
      body.caseId,
      body.excludePartyId,
    );
  }

  @Get('cases/:caseId/parties/conflict-summary')
  async getConflictSummary(@Param('caseId') caseId: string) {
    return this.partiesService.getConflictSummary(caseId);
  }

  @Get('cases/:caseId/parties/by-role/:role')
  async findByRole(@Param('caseId') caseId: string, @Param('role') role: string) {
    return this.partiesService.findByRole(caseId, role);
  }

  @Get('cases/:caseId/parties/by-type/:type')
  async findByType(@Param('caseId') caseId: string, @Param('type') type: string) {
    return this.partiesService.findByType(caseId, type);
  }
}
