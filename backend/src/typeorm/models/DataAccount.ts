import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Project } from './Project';
import { DataAccount as DataAccountInterface } from '../../types/data-account.interface';

@Entity()
export class DataAccount implements DataAccountInterface {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  accountHash: string;

  @OneToOne(() => Project, project => project.id, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'projectId', referencedColumnName: 'id' })
  project: Project;
}
