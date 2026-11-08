import { build as viteBuild } from 'vite';
import { resolve, dirname } from 'node:path';
import { rmSync, existsSync, lstatSync } from 'node:fs';
const output = resolve('dist');
if (dirname(output) !== process.cwd() || (existsSync(output) && lstatSync(output).isSymbolicLink())) throw new Error('Unsafe build output path');
rmSync(output, { recursive:true, force:true });
await viteBuild();
console.log('FARO client built for Netlify.');

const { generatePwa } = await import('./pwa.mjs');
generatePwa('dist/client','faro-app-');
