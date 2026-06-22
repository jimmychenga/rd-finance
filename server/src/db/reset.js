import { DB_PATH } from './schema.js';
import { unlinkSync, existsSync } from 'fs';

if (existsSync(DB_PATH)) {
  unlinkSync(DB_PATH);
  console.log('Database deleted. Run `npm run db:seed` to reinitialise.');
} else {
  console.log('No database found — nothing to reset.');
}
