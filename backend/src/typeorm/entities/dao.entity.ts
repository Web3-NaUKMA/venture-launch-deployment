import { Column, Entity, JoinTable, ManyToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Dao } from '../../types/dao.interface';
import { User } from '../../types/user.interface';
import { UserEntity } from './user.entity';
import { ProjectLaunchEntity } from './project-launch.entity';
import { ProjectLaunch } from '../../types/project-launch.interface';

@Entity('dao')
export class DaoEntity implements Dao {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  multisigPda: string;

  @Column({ type: 'text' })
  vaultPda: string;

  @Column({ type: 'int8', default: 0 })
  threshold: number;

  @OneToOne(() => ProjectLaunchEntity, projectLaunch => projectLaunch.dao)
  projectLaunch: ProjectLaunch;

  @ManyToMany(() => UserEntity, user => user.daos)
  @JoinTable()
  members: User[];

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamptz', nullable: true, default: null })
  updatedAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true, default: null })
  removedAt: Date | null;
}
