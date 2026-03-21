import { poku } from 'poku';

await poku(['tests'], {
  reporter: 'classic',
  debug: true,
});
