const { time: Logger } = require('@flasco/logger');

const notifier = require('node-notifier');

const App = require('./dist');

const currentVersion = process.env.npm_package_version;

if (currentVersion != null) {
  Logger.info('welcome to use');
  Logger.info('current version:', currentVersion);
}

new App().start().catch(e => {
  console.log(e);
  notifier.notify({
    title: 'LEARN',
    message: e.message || e,
  });
  process.exit(0);
});
