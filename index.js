const { time: Logger } = require('@flasco/logger');

const notifier = require('node-notifier');

const App = require('./dist');

Logger.info('welcome to use');
Logger.info('current version:', process.env.npm_config_init_version);

new App().start().catch(e => {
  console.log(e);
  notifier.notify({
    title: 'LEARN',
    message: e.message || e,
  });
  process.exit(0);
});
