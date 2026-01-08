import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { PortalUser } from './entities/portal-user.entity';

@Injectable()
export class AppointmentSchedulingService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(PortalUser)
    private readonly portalUserRepository: Repository<PortalUser>,
  ) {}

  /**
   * Get all appointments for a portal user
   */
  async getAppointments(portalUserId: string, filters?: {
    status?: string;
    appointmentType?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{ appointments: Appointment[]; total: number }> {
    const query = this.appointmentRepository
      .createQueryBuilder('appointment')
      .where('appointment.portal_user_id = :portalUserId', { portalUserId })
      .orderBy('appointment.datetime', 'ASC');

    if (filters?.status) {
      query.andWhere('appointment.status = :status', { status: filters.status });
    }

    if (filters?.appointmentType) {
      query.andWhere('appointment.appointment_type = :appointmentType', {
        appointmentType: filters.appointmentType
      });
    }

    if (filters?.startDate) {
      query.andWhere('appointment.datetime >= :startDate', { startDate: filters.startDate });
    }

    if (filters?.endDate) {
      query.andWhere('appointment.datetime <= :endDate', { endDate: filters.endDate });
    }

    const total = await query.getCount();

    if (filters?.limit) {
      query.limit(filters.limit);
    }

    if (filters?.offset) {
      query.offset(filters.offset);
    }

    const appointments = await query.getMany();

    return { appointments, total };
  }

  /**
   * Get a specific appointment by ID
   */
  async getAppointment(appointmentId: string, portalUserId: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId, portalUserId },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }

  /**
   * Request/Schedule a new appointment
   */
  async scheduleAppointment(
    portalUserId: string,
    data: {
      attorneyId: string;
      attorneyName?: string;
      matterId?: string;
      datetime: Date;
      durationMinutes?: number;
      appointmentType: string;
      meetingMethod: string;
      location?: string;
      notes?: string;
      clientNotes?: string;
      agenda?: string;
      phoneNumber?: string;
      timeZone?: string;
    },
  ): Promise<Appointment> {
    const portalUser = await this.portalUserRepository.findOne({
      where: { id: portalUserId },
    });

    if (!portalUser) {
      throw new NotFoundException('Portal user not found');
    }

    // Check if appointment date is in the future
    if (new Date(data.datetime) < new Date()) {
      throw new BadRequestException('Appointment date must be in the future');
    }

    // Check for attorney availability (simplified - in production, check attorney's calendar)
    const conflictingAppointments = await this.checkAttorneyAvailability(
      data.attorneyId,
      new Date(data.datetime),
      data.durationMinutes || 60,
    );

    if (conflictingAppointments > 0) {
      throw new ConflictException('Attorney is not available at the requested time');
    }

    const durationMinutes = data.durationMinutes || 60;
    const endDatetime = new Date(new Date(data.datetime).getTime() + durationMinutes * 60000);

    const appointment = this.appointmentRepository.create({
      portalUserId,
      attorneyId: data.attorneyId,
      attorneyName: data.attorneyName,
      matterId: data.matterId,
      datetime: new Date(data.datetime),
      durationMinutes,
      endDatetime,
      appointmentType: data.appointmentType as any,
      meetingMethod: data.meetingMethod as any,
      location: data.location,
      notes: data.notes,
      clientNotes: data.clientNotes,
      agenda: data.agenda,
      phoneNumber: data.phoneNumber,
      timeZone: data.timeZone || 'America/New_York',
      status: 'scheduled',
      reminderSent: false,
      confirmationSent: false,
      createdBy: portalUserId,
    });

    return await this.appointmentRepository.save(appointment);
  }

  /**
   * Update an appointment
   */
  async updateAppointment(
    appointmentId: string,
    portalUserId: string,
    data: Partial<{
      datetime: Date;
      durationMinutes: number;
      meetingMethod: string;
      location: string;
      clientNotes: string;
      phoneNumber: string;
    }>,
  ): Promise<Appointment> {
    const appointment = await this.getAppointment(appointmentId, portalUserId);

    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      throw new BadRequestException('Cannot update a completed or cancelled appointment');
    }

    if (data.datetime) {
      if (new Date(data.datetime) < new Date()) {
        throw new BadRequestException('Appointment date must be in the future');
      }

      // Check for conflicts if rescheduling
      const conflictingAppointments = await this.checkAttorneyAvailability(
        appointment.attorneyId,
        new Date(data.datetime),
        data.durationMinutes || appointment.durationMinutes,
        appointmentId,
      );

      if (conflictingAppointments > 0) {
        throw new ConflictException('Attorney is not available at the requested time');
      }

      appointment.datetime = new Date(data.datetime);
      appointment.status = 'rescheduled';
    }

    if (data.durationMinutes) {
      appointment.durationMinutes = data.durationMinutes;
      appointment.endDatetime = new Date(
        appointment.datetime.getTime() + data.durationMinutes * 60000,
      );
    }

    if (data.meetingMethod) {
      appointment.meetingMethod = data.meetingMethod as any;
    }

    if (data.location) {
      appointment.location = data.location;
    }

    if (data.clientNotes) {
      appointment.clientNotes = data.clientNotes;
    }

    if (data.phoneNumber) {
      appointment.phoneNumber = data.phoneNumber;
    }

    appointment.updatedBy = portalUserId;

    return await this.appointmentRepository.save(appointment);
  }

  /**
   * Cancel an appointment
   */
  async cancelAppointment(
    appointmentId: string,
    portalUserId: string,
    reason?: string,
  ): Promise<Appointment> {
    const appointment = await this.getAppointment(appointmentId, portalUserId);

    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      throw new BadRequestException('Appointment is already completed or cancelled');
    }

    appointment.status = 'cancelled';
    appointment.cancelledAt = new Date();
    appointment.cancelledBy = portalUserId;
    appointment.cancellationReason = reason;
    appointment.updatedBy = portalUserId;

    return await this.appointmentRepository.save(appointment);
  }

  /**
   * Confirm an appointment
   */
  async confirmAppointment(appointmentId: string, portalUserId: string): Promise<Appointment> {
    const appointment = await this.getAppointment(appointmentId, portalUserId);

    if (appointment.status !== 'scheduled') {
      throw new BadRequestException('Only scheduled appointments can be confirmed');
    }

    appointment.status = 'confirmed';
    appointment.confirmedAt = new Date();
    appointment.updatedBy = portalUserId;

    return await this.appointmentRepository.save(appointment);
  }

  /**
   * Get upcoming appointments
   */
  async getUpcomingAppointments(portalUserId: string, limit = 10): Promise<Appointment[]> {
    return await this.appointmentRepository.find({
      where: {
        portalUserId,
        datetime: MoreThanOrEqual(new Date()),
        status: Between('confirmed' as any, 'scheduled' as any),
      },
      order: { datetime: 'ASC' },
      take: limit,
    });
  }

  /**
   * Get past appointments
   */
  async getPastAppointments(portalUserId: string, limit = 20): Promise<Appointment[]> {
    return await this.appointmentRepository.find({
      where: {
        portalUserId,
        datetime: LessThanOrEqual(new Date()),
      },
      order: { datetime: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get available time slots for an attorney
   */
  async getAvailableTimeSlots(
    attorneyId: string,
    date: Date,
    durationMinutes = 60,
  ): Promise<Array<{ start: Date; end: Date; available: boolean }>> {
    const startOfDay = new Date(date);
    startOfDay.setHours(9, 0, 0, 0); // 9 AM

    const endOfDay = new Date(date);
    endOfDay.setHours(17, 0, 0, 0); // 5 PM

    // Get all appointments for the attorney on this date
    const appointments = await this.appointmentRepository.find({
      where: {
        attorneyId,
        datetime: Between(startOfDay, endOfDay),
        status: Between('confirmed' as any, 'scheduled' as any),
      },
      order: { datetime: 'ASC' },
    });

    const slots: Array<{ start: Date; end: Date; available: boolean }> = [];
    let currentTime = new Date(startOfDay);

    while (currentTime < endOfDay) {
      const slotEnd = new Date(currentTime.getTime() + durationMinutes * 60000);

      // Check if this slot conflicts with any existing appointments
      const hasConflict = appointments.some((apt) => {
        const aptEnd = apt.endDatetime || new Date(apt.datetime.getTime() + apt.durationMinutes * 60000);
        return (
          (currentTime >= apt.datetime && currentTime < aptEnd) ||
          (slotEnd > apt.datetime && slotEnd <= aptEnd) ||
          (currentTime <= apt.datetime && slotEnd >= aptEnd)
        );
      });

      slots.push({
        start: new Date(currentTime),
        end: new Date(slotEnd),
        available: !hasConflict,
      });

      currentTime = new Date(currentTime.getTime() + 30 * 60000); // 30-minute intervals
    }

    return slots.filter((slot) => slot.available);
  }

  /**
   * Check attorney availability (helper method)
   */
  private async checkAttorneyAvailability(
    attorneyId: string,
    datetime: Date,
    durationMinutes: number,
    excludeAppointmentId?: string,
  ): Promise<number> {
    const endTime = new Date(datetime.getTime() + durationMinutes * 60000);

    const query = this.appointmentRepository
      .createQueryBuilder('appointment')
      .where('appointment.attorney_id = :attorneyId', { attorneyId })
      .andWhere('appointment.status IN (:...statuses)', { statuses: ['scheduled', 'confirmed'] })
      .andWhere(
        '((appointment.datetime <= :datetime AND appointment.end_datetime > :datetime) OR ' +
        '(appointment.datetime < :endTime AND appointment.end_datetime >= :endTime) OR ' +
        '(appointment.datetime >= :datetime AND appointment.end_datetime <= :endTime))',
        { datetime, endTime },
      );

    if (excludeAppointmentId) {
      query.andWhere('appointment.id != :excludeAppointmentId', { excludeAppointmentId });
    }

    return await query.getCount();
  }

  /**
   * Get appointment statistics for a portal user
   */
  async getAppointmentStatistics(portalUserId: string): Promise<{
    total: number;
    upcoming: number;
    completed: number;
    cancelled: number;
    byType: Record<string, number>;
  }> {
    const appointments = await this.appointmentRepository.find({
      where: { portalUserId },
    });

    const stats = {
      total: appointments.length,
      upcoming: 0,
      completed: 0,
      cancelled: 0,
      byType: {} as Record<string, number>,
    };

    const now = new Date();

    appointments.forEach((apt) => {
      if (apt.status === 'completed') {
        stats.completed += 1;
      } else if (apt.status === 'cancelled') {
        stats.cancelled += 1;
      } else if (apt.datetime >= now) {
        stats.upcoming += 1;
      }

      stats.byType[apt.appointmentType] = (stats.byType[apt.appointmentType] || 0) + 1;
    });

    return stats;
  }
}
