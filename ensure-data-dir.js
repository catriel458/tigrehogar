// ensure-data-dir.js
import { mkdir } from 'fs/promises';
await mkdir('./data', { recursive: true });
console.log('Data directory created');