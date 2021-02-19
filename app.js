const Koa = require('koa');
const InitManager = require('./core/init');
const parser = require('koa-bodyparser');
const cors = require('koa2-cors');

const catchError = require('./middlewares/exception');

const app = new Koa();

app.use(cors());
app.use(catchError);
app.use(parser());

InitManager.initCore(app);

app.listen(3000, () => {
    console.log('Koa is listening');
});

module.exports = app;

