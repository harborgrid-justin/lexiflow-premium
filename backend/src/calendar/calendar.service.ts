import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { CalendarEvent } from './entities/calendar-event.entity';
import { CreateCalendarEventDto, UpdateCalendarEventDto } from './dto/calendar.dto';

@Injectable()
export class CalendarService {
  constructor(
    @InjectRepository(CalendarEvent)
    private readonly calendarEventRepository: Repository<CalendarEvent>,
  ) {}

  async create(createDto: CreateCalendarEventDto): Promise<CalendarEvent> {
    const event = this.calendarEventRepository.create(createDto);
    return await this.calendarEventRepository.save(event);
  }

  async findAll(query: unknown): Promise<{ data: CalendarEvent[]; total: number }> {
    const { page = 1, limit = 50, startDate, endDate, eventType, caseId } = query as { page?: number; limit?: number; startDate?: string; endDate?: string; eventType?: string; caseId?: string };
    const skip = (page - 1) * limit;

    const where: any = {};
    if (eventType) where.eventType = eventType;
    if (caseId) where.caseId = caseId;
    if (startDate && endDate) {
      where.startDate = Between(new Date(startDate), new Date(endDate));
    }

    const [data, total] = await this.calendarEventRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { startDate: 'ASC' }
    });

    return { data, total };
  }

  async findOne(id: string): Promise<CalendarEvent> {
    const event = await this.calendarEventRepository.findOne({ where: { id } });
    if (!event) throw new NotFoundException(`Calendar event ${id} not found`);
    return event;
  }

  async update(id: string, updateDto: UpdateCalendarEventDto): Promise<CalendarEvent> {
    await this.findOne(id);
    await this.calendarEventRepository.update(id, updateDto);
    return await this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const event = await this.findOne(id);
    await this.calendarEventRepository.remove(event);
  }

  async findUpcoming(days: number = 7): Promise<CalendarEvent[]> {
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + days);

    return await this.calendarEventRepository.find({
      where: {
        startDate: Between(now, future),
        completed: false
      },
      order: { startDate: 'ASC' }
    });
  }

  async markComplete(id: string): Promise<CalendarEvent> {
    await this.findOne(id);
    await this.calendarEventRepository.update(id, { completed: true });
    return await this.findOne(id);
  }
}
