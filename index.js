const notifier = require('node-notifier');

const App = require('./src');

new App().start().catch(e => {
  notifier.notify({
    title: 'LEARN',
    message: e.message || e
  });
  process.exit(0);
});
