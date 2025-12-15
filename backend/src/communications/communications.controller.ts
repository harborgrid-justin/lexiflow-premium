import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CommunicationsService } from './communications.service';

@Controller('communications')
export class CommunicationsController {
renderTemplate(templateId: string, variables: { caseNumber: string; clientName: string; }) {
throw new Error('Method not implemented.');
}
scheduleMessage(scheduleDto: { communicationId: string; scheduledAt: Date; }) {
throw new Error('Method not implemented.');
}
getScheduledMessages() {
throw new Error('Method not implemented.');
}
getDeliveryStatus(commId: string) {
throw new Error('Method not implemented.');
}
  constructor(private readonly communicationsService: CommunicationsService) {}

  @Get()
  findAll() {
    return this.communicationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.communicationsService.findById(id);
  }

  @Post()
  create(@Body() createDto: any) {
    return this.communicationsService.create(createDto);
  }
}
