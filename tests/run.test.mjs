import { poku } from 'poku';
import * as fs from 'fs';
import { join } from 'path';

const clearDir = async (dir) => {
  await fs.promises.mkdir(dir, { recursive: true });
  const items = await fs.promises.readdir(dir);
  await Promise.all(items.map(async (name) => {
    const p = join(dir, name);
    await fs.promises.rm(p, { recursive: true, force: true });
  }));
};

const prepareService = async () => {
  const root = process.cwd();
  console.log('clearDir', join(root, 'assets', 'bundle_factory'));
  console.log('clearDir', join(root, 'assets', 'script', 'itemViews'));
  await clearDir(join(root, 'assets', 'bundle_factory'));
  await clearDir(join(root, 'assets', 'script', 'itemViews'));
};
// const resetService = () => new Promise((_, reject) => reject('Let\'s crash it'));
const resetService = () => new Promise((resolve) => resolve(undefined));

prepareService();
// core
await poku(['tests/core', 'tests/builder'], {
  reporter: 'classic',
  debug: true,
  // beforeEach: prepareService,
  // afterEach: resetService,
});

