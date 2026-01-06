import { BaseEntity } from "@common/base/base.entity";
import { Party } from "@parties/entities/party.entity";
import { Column, Entity, ManyToMany } from "typeorm";

@Entity("counsels")
export class Counsel extends BaseEntity {
  @Column({ name: "first_name", type: "varchar", length: 100, nullable: true })
  firstName?: string;

  @Column({ name: "middle_name", type: "varchar", length: 100, nullable: true })
  middleName?: string;

  @Column({ name: "last_name", type: "varchar", length: 100, nullable: true })
  lastName?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  email?: string;

  @Column({ name: "firm_name", type: "varchar", length: 255, nullable: true })
  firmName?: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  phone?: string;

  @Column({ type: "text", nullable: true })
  address?: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  city?: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  state?: string;

  @Column({ name: "zip_code", type: "varchar", length: 20, nullable: true })
  zipCode?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  appearance?: string; // e.g. "COR NTC Retained"

  @ManyToMany(() => Party, (party) => party.counsels)
  parties?: Party[];

  get fullName(): string {
    return [this.firstName, this.middleName, this.lastName]
      .filter(Boolean)
      .join(" ");
  }
}
