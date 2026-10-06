import 'dotenv/config';
import { DataSource } from 'typeorm';
import { buildDataSourceOptions } from '../config/database.config';

export default new DataSource({
  ...buildDataSourceOptions(),
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
});
