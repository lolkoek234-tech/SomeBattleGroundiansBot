import { join } from 'path';

const root = process.env.CONFIG_PATH || join(process.cwd(), 'data');

export const dataPath = (...parts) => join(root, ...parts);
