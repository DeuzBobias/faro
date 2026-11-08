import { build } from 'vite';
import { spawnSync } from 'node:child_process';
await build({configFile:false,build:{ssr:'tests/api.test.ts',outDir:'.local/tests',target:'node24',rolldownOptions:{output:{entryFileNames:'api.test.mjs'}}}});
const run=spawnSync(process.execPath,['--test','.local/tests/api.test.mjs'],{stdio:'inherit'});
process.exitCode=run.status??1;
