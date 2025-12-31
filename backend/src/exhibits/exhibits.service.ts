import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository} from 'typeorm';
import { TrialExhibit, ExhibitStatus } from './entities/trial-exhibit.entity';
import { CreateExhibitDto } from './dto/create-exhibit.dto';
import { UpdateExhibitDto } from './dto/update-exhibit.dto';

/**
 * ╔=================================================================================================================╗
 * ║EXHIBITS                                                                                                         ║
 * ╠=================================================================================================================╣
 * ║                                                                                                                 ║
 * ║  External Request                   Controller                            Service                                ║
 * ║       │                                   │                                     │                                ║
 * ║       │  HTTP Endpoints                  │                                     │                                ║
 * ║       └───────────────────────────────────►                                     │                                ║
 * ║                                                                                                                 ║
 * ║                                                                 ┌───────────────┴───────────────┐                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          Repository                    Database                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          PostgreSQL                                          ║
 * ║                                                                                                                 ║
 * ║  DATA IN:  Data input                                                                                         ║

 * ║                                                                                                                 ║
 * ║  DATA OUT: Data output                                                                                        ║

 * ║                                                                                                                 ║

 * ╚=================================================================================================================╝
 */

@Injectable()
export class ExhibitsService {
  constructor(
    @InjectRepository(TrialExhibit)
    private readonly exhibitRepository: Repository<TrialExhibit>,
  ) {}

  async create(createDto: CreateExhibitDto): Promise<TrialExhibit> {
    const existing = await this.exhibitRepository.findOne({
      where: { exhibitNumber: createDto.exhibitNumber, caseId: createDto.caseId }
    });

    if (existing) {
      throw new ConflictException(`Exhibit ${createDto.exhibitNumber} already exists for this case`);
    }

    const exhibit = this.exhibitRepository.create({
      ...createDto,
      status: createDto.status as unknown as ExhibitStatus, // Cast if needed or ensure DTO uses correct enum
    });
    return await this.exhibitRepository.save(exhibit);
  }

  async findAll(filters: {
    caseId?: string;
    status?: ExhibitStatus;
    type?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { caseId, status, type, search, page = 1, limit = 50 } = filters;
    
    const queryBuilder = this.exhibitRepository.createQueryBuilder('exhibit');

    if (caseId) queryBuilder.andWhere('exhibit.caseId = :caseId', { caseId });
    if (status) queryBuilder.andWhere('exhibit.status = :status', { status });
    if (type) queryBuilder.andWhere('exhibit.type = :type', { type });
    if (search) {
      queryBuilder.andWhere(
        '(exhibit.exhibitNumber LIKE :search OR exhibit.description LIKE :search)',
        { search: `%${search}%` }
      );
    }

    const [data, total] = await queryBuilder
      .orderBy('exhibit.exhibitNumber', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<TrialExhibit> {
    const exhibit = await this.exhibitRepository.findOne({ where: { id } });
    
    if (!exhibit) {
      throw new NotFoundException(`Exhibit with ID ${id} not found`);
    }

    return exhibit;
  }

  async update(id: string, updateDto: UpdateExhibitDto): Promise<TrialExhibit> {
    const exhibit = await this.findOne(id);
    Object.assign(exhibit, updateDto);
    return await this.exhibitRepository.save(exhibit);
  }

  async markAdmitted(id: string, admittedBy: string, date: string): Promise<TrialExhibit> {
    const exhibit = await this.findOne(id);
    
    exhibit.status = ExhibitStatus.ADMITTED;
    exhibit.dateAdmitted = new Date(date);
    exhibit.admittedBy = admittedBy;

    return await this.exhibitRepository.save(exhibit);
  }

  async remove(id: string): Promise<void> {
    const exhibit = await this.findOne(id);
    await this.exhibitRepository.remove(exhibit);
  }
}
