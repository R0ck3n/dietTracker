import { initDatabase, closeDatabase } from '../db/connection.js';
import { env } from '../config/env.js';

initDatabase();
console.log(`Base initialisée : ${env.databasePath}`);
closeDatabase();
