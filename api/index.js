// Vercel Serverless Function Entry Point
// Uses dynamic import since package.json has "type": "module"
// but server files use CommonJS (.cjs extension)
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const app = require('../server/app.cjs');

export default app;
