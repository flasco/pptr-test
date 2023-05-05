import notifier from 'node-notifier';
import App from './core';
import dayjs from 'dayjs';

const currentVersion = process.env.npm_package_version;

if (currentVersion != null) {
  console.log(`current date: ${dayjs().format('YYYY-MM-DD HH:mm:ss')}`);
  console.log('current version:', currentVersion);
  console.log();
}

new App().start().catch(e => {
  console.log(e);
  notifier.notify({
    title: 'LEARN',
    message: e.message || e,
  });
  process.exit(0);
});
