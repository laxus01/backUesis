import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('communication_companies')
@Unique(['name'])
export class CommunicationCompany {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 120 })
  name: string;
}
