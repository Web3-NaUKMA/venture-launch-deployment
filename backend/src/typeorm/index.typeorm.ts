import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './models/User';
import { Session } from './models/Session';
import { Project } from './models/Project';
import { Milestone } from './models/Milestone';
import { DataAccount } from './models/DataAccount';
import { UserToProject } from './models/UsersToProjects';
import * as dotenv from 'dotenv';
import { ProjectLaunch } from './models/ProjectLaunch';
import { ProjectLaunchInvestment } from './models/ProjectLaunchInvestment';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: Number(process.env.DATABASE_PORT || 5432),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  entities: [
    User,
    Session,
    Project,
    ProjectLaunch,
    ProjectLaunchInvestment,
    Milestone,
    DataAccount,
    UserToProject,
  ],
  synchronize: true,
  logging: false,
});

AppDataSource.initialize()
  .then(() => {
    console.log('Database was successfully connected!');
  })
  .catch(error => console.log(error));
