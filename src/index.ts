import notifier from 'node-notifier';
import App from './core';

const currentVersion = process.env.npm_package_version;

if (currentVersion != null) {
  console.log('welcome to use');
  console.log('current version:', currentVersion);
}

new App().start().catch(e => {
  console.log(e);
  notifier.notify({
    title: 'LEARN',
    message: e.message || e,
  });
  process.exit(0);
});
