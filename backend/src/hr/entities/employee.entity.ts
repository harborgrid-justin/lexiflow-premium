import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { EmployeeRole, EmployeeStatus } from '@hr/dto/create-employee.dto';
import { TimeOffRequest } from './time-off-request.entity';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ type: 'enum', enum: EmployeeRole })
  role!: EmployeeRole;

  @Column({ nullable: true })
  department!: string;

  @Column({ nullable: true })
  phone!: string;

  @Column({ type: 'timestamp', nullable: true })
  hireDate!: Date;

  @Column({ type: 'enum', enum: EmployeeStatus, default: EmployeeStatus.ACTIVE })
  status!: EmployeeStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  billingRate!: number;

  @Column({ type: 'int', nullable: true })
  targetBillableHours!: number;

  @OneToMany(() => TimeOffRequest, request => request.employee)
  timeOffRequests!: TimeOffRequest[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
