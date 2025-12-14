import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../entities/base.entity';

@Entity('witnesses')
export class Witness extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  type?: string;
}
