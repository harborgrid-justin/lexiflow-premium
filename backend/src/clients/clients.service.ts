import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as crypto from "crypto";
import { Repository } from "typeorm";
import { ClientStatus, CreateClientDto } from "./dto/create-client.dto";
import { UpdateClientDto } from "./dto/update-client.dto";
import { Client } from "./entities/client.entity";

/**
 * ╔=================================================================================================================╗
 * ║CLIENTS                                                                                                          ║
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
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>
  ) {}

  async create(createDto: CreateClientDto): Promise<Client> {
    const existing = await this.clientRepository.findOne({
      where: { email: createDto.email },
    });

    if (existing) {
      throw new ConflictException(
        `Client with email ${createDto.email} already exists`
      );
    }

    // Create client directly from DTO
    const client = this.clientRepository.create({
      ...createDto,
      clientType: createDto.clientType?.toLowerCase() || "individual",
      status: createDto.status?.toLowerCase() || "active",
    });
    return await this.clientRepository.save(client);
  }

  async findAll(filters: {
    status?: ClientStatus;
    type?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    const {
      status,
      type,
      search,
      page = 1,
      limit = 50,
      sortBy = "name",
      sortOrder = "ASC",
    } = filters;

    const queryBuilder = this.clientRepository.createQueryBuilder("client");

    if (status)
      queryBuilder.andWhere("client.status = :status", {
        status: status.toLowerCase(),
      });
    if (type)
      queryBuilder.andWhere("client.clientType = :type", {
        type: type.toLowerCase(),
      });
    if (search) {
      queryBuilder.andWhere(
        "(client.name LIKE :search OR client.email LIKE :search OR client.primaryContact LIKE :search)",
        { search: `%${search}%` }
      );
    }

    // Handle sorting - map common sort fields
    const sortField =
      sortBy === "totalBilled" ? "client.totalBilled" : `client.${sortBy}`;
    const order = sortOrder?.toUpperCase() === "DESC" ? "DESC" : "ASC";

    const [data, total] = await queryBuilder
      .orderBy(sortField, order)
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

  async findOne(id: string): Promise<Client> {
    const client = await this.clientRepository.findOne({ where: { id } });

    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    return client;
  }

  async update(id: string, updateDto: UpdateClientDto): Promise<Client> {
    const client = await this.findOne(id);

    if (updateDto.email && updateDto.email !== client.email) {
      const existing = await this.clientRepository.findOne({
        where: { email: updateDto.email },
      });
      if (existing) {
        throw new ConflictException(
          `Email ${updateDto.email} is already in use`
        );
      }
    }

    Object.assign(client, updateDto);
    return await this.clientRepository.save(client);
  }

  async remove(id: string): Promise<void> {
    const client = await this.findOne(id);
    await this.clientRepository.remove(client);
  }

  async getCases(id: string) {
    await this.findOne(id);
    // This would query the cases table where clientId = id
    // For now returning empty array as placeholder
    return [];
  }

  async generatePortalToken(
    id: string
  ): Promise<{ token: string; expiresAt: string }> {
    const client = await this.findOne(id);

    const token = `token-${id}-${crypto.randomBytes(32).toString("hex")}`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days validity

    client.portalToken = token;
    client.portalTokenExpiry = expiresAt;

    await this.clientRepository.save(client);

    return {
      token,
      expiresAt: expiresAt.toISOString(),
    };
  }
}
