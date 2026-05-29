import { DataAdapter } from './adapter';
import { JsonAdapter } from './adapters/json';
import { MemoryAdapter } from './adapters/memory';
import { PostgresAdapter } from './adapters/postgres';

let adapterInstance: DataAdapter | null = null;

export const getDataAdapter = (): DataAdapter => {
  if (adapterInstance) return adapterInstance;

  const driver = process.env.DB_DRIVER || 'memory';
  const databaseUrl = process.env.DATABASE_URL || '';

  switch (driver) {
    case 'postgres':
      adapterInstance = new PostgresAdapter(databaseUrl);
      break;
    case 'json':
      adapterInstance = new JsonAdapter();
      break;
    case 'memory':
    default:
      adapterInstance = new MemoryAdapter();
      break;
  }

  console.log(`[Data Layer] Using adapter: ${driver}`);
  return adapterInstance;
};

export type { DataAdapter };
export { JsonAdapter, MemoryAdapter, PostgresAdapter };
