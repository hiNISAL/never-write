import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import { getConfig } from './helpers/get-config';
import path from 'path';
import { generator } from './helpers/generator';
import { init } from './app/init';
import { build } from './app/build';

const pkg = require('../package.json');

(globalThis as any).__app_started_at = Date.now();

const argv: Record<string, any> = yargs(hideBin(process.argv)).argv;

const root = argv.root ? path.resolve(process.cwd(), argv.root) : process.cwd();

(async () => {
  if (argv.init)  {
    init(root);
    return;
  }

  if ((argv._ || []).includes('build')) {
    build(root);
    return;
  }

  console.log('[info] never-write');
  console.log(`[info] v${pkg.version}`);
  console.log(`[info] \`neverw --init\` to generate sample files`);
  console.log(`[info] \`neverw build\` to generate posts`);
  console.log(`[info] https://github.com/hiNISAL/never-write to known more about nerver-write\n`);
})();
