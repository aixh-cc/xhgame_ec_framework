import { poku } from 'poku';

const prepareService = () => new Promise((resolve) => resolve(undefined));
// const resetService = () => new Promise((_, reject) => reject('Let\'s crash it'));
const resetService = () => new Promise((resolve) => resolve(undefined));

// core
await poku('tests/core', {
  reporter: 'classic',
  debug: true,
  // beforeEach: prepareService,
  // afterEach: resetService,
});

