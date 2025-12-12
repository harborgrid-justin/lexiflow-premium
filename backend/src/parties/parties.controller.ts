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
}
