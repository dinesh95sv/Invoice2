import { Database } from '@watermelondb/Database';
import { setGenerator } from '@watermelondb/sync/index';
import LokiJSAdapter from '@watermelondb/adapters/lokijs';
import { schema } from './models/schema';
import migrations from './models/migrations';
import { modelClasses } from './models';

// Set UUID generator
import uuid from 'react-native-uuid';
setGenerator(uuid.v4);

// Create LokiJS adapter
const adapter = new LokiJSAdapter({
  schema,
  migrations,
  useWebWorker: false,
  useIncrementalIndexedDB: true,
});

// Create the database
const database = new Database({
  adapter,
  modelClasses,
});

export default database;