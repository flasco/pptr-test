const notifier = require('node-notifier');

const App = require('./dist');

new App().start().catch(e => {
  console.log(e);
  notifier.notify({
    title: 'LEARN',
    message: e.message || e
  });
  process.exit(0);
});
