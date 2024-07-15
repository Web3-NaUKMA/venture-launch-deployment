import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '../.env.database' });

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: Number(process.env.DATABASE_PORT || 5432),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  synchronize: false,
  logging: false,
  ...(process.env.NODE_ENV === 'production'
    ? {
        entities: ['dist/typeorm/entities/*{.ts,.js}'],
        migrations: ['dist/typeorm/migrations/*{.ts,.js}'],
      }
    : {
        entities: ['src/typeorm/entities/*{.ts,.js}'],
        migrations: ['src/typeorm/migrations/*{.ts,.js}'],
      }),
});

AppDataSource.initialize()
  .then(() => {
    console.log('Database was successfully connected!');
  })
  .catch(error => console.log(error));

export default AppDataSource;
